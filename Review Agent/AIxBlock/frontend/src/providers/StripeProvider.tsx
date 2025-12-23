import React, {useCallback} from "react";
import {loadStripe} from '@stripe/stripe-js';
import {Elements, PaymentElement, useElements, useStripe} from "@stripe/react-stripe-js";
import {confirmDialog} from "../components/Dialog";
import Button from "../components/Button/Button";
import {useApi} from "./ApiProvider";
import {useLoader} from "./LoaderProvider";
import {extractErrorMessage, extractErrorMessageFromResponse, unexpectedErrorMessage} from "../utils/error";
import {createAlertInfo} from "../utils/createAlert";
import {openNewTab} from "../utils/openNewTab";
import {useCentrifuge} from "./CentrifugoProvider";
import Modal from "../components/Modal/Modal";

export const stripePromise = loadStripe(window.APP_SETTINGS.stripePublicKey);

export type TStripeProvider = {
  topup: (amount: number, onFinish?: () => void, onError?: (message: string) => void) => boolean,
  getFee: (amount: number) => number,
}

const StripeContext = React.createContext<TStripeProvider>({
  topup: () => false,
  getFee: () => 0,
});

export type TStripeFormProps = {
  amount: number,
  onFinish?: () => void,
  onError?: (message: string) => void,
  onClose?: () => void,
}

export function StripeForm({amount, onFinish, onError, onClose}: TStripeFormProps) {
  const [ready, setReady] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const [waitingCS, setWaitingCS] = React.useState<string | null>(null);
  const {call} = useApi();
  const {onMessage} = useCentrifuge();
  const [capturing, setCapturing] = React.useState(false);

  const onSubmit = useCallback(async () => {
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const {error: submitError} = await elements.submit();

    if (submitError) {
      onError?.(submitError.message ?? "An error ocurred while checking the payment method");
      setProcessing(false);
      return;
    }

    const {error: tokenError, confirmationToken} = await stripe.createConfirmationToken({
      elements,
      params: {}
    });

    if (tokenError) {
      onError?.(tokenError.message ?? "An error ocurred while confirming your transaction");
      setProcessing(false);
      return;
    }

    const ar = call("stripeConfirmToken", {
      params: {
        amount: Math.ceil(amount * 100).toString(),
        currency: "usd",
        confirmation_token: confirmationToken?.id,
      },
    });

    ar.promise
      .then(async r => {
        if (r.ok) {
          onFinish?.();
          return;
        }

        onError?.(await extractErrorMessageFromResponse(r));

        try {
          const data = await r.clone().json();

          if (data["paymentIntent"]["status"] === "requires_action") {
            setWaitingCS(data["paymentIntent"]["client_secret"]);
            return;
          }
        } catch (e) {
        }
      })
      .catch(e => {
        onError?.(extractErrorMessage(e) ?? unexpectedErrorMessage(e));
      })
      .finally(() => {
        setProcessing(false);
      });
  }, [stripe, elements, call, amount, onError, onFinish]);

  React.useEffect(() => {
    if (!waitingCS) {
      return;
    }

    const stop = onMessage(waitingCS, async m => {
      if (!stripe) {
        return;
      }

      if (!("capture" in m)) {
        window.APP_SETTINGS.debug && console.log("Stripe " + waitingCS + " confirm message", m);
        return;
      }

      // Check the payment intent
      const pi = await stripe.retrievePaymentIntent(waitingCS);

      if (!pi.error && pi.paymentIntent.status === "succeeded") {
        // Capture the payment
        setCapturing(true);

        const ar = call("stripeCapture", {
          params: {
            paymentIntent: pi.paymentIntent.id.toString(),
          },
        });

        ar.promise
          .then(async r => {
            if (r.ok) {
              onFinish?.();
              return;
            }

            onError?.(await extractErrorMessageFromResponse(r));
          })
          .catch(e => {
            onError?.(extractErrorMessage(e) ?? unexpectedErrorMessage(e));
          })
          .finally(() => {
            onClose?.();
          })
      } else {
        onError?.(pi.error?.message ?? "Failed to confirm the payment");
        onClose?.();
      }
    });

    return () => {
      stop();
    };
  }, [call, onClose, onError, onFinish, onMessage, stripe, waitingCS]);

  if (capturing) {
    return (
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center"}}>
        Capturing payment transaction...
      </div>
    );
  }

  if (waitingCS) {
    return (
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center"}}>
        <div>Your payment method needs manual confirmation.</div>
        <div>Please click the button below to confirm your payment method.</div>
        <Button
          isBlock
          style={{marginTop: 32}}
          onClick={() => {
            openNewTab(window.location.protocol + "//" + window.location.host + "/stripe/confirm/" + waitingCS);
          }}
        >
          Confirm now
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={e => e.preventDefault()}>
      {!ready && (
        <div style={{textAlign: "center", paddingBottom: 24}}>
          Loading payment gateway... Please wait a moment!
        </div>
      )}
      <PaymentElement options={{readOnly: processing}} onReady={() => setReady(true)} />
      {ready && !processing && (
        <div style={{marginTop: 16}}>
          <Button onClick={onSubmit} isBlock disabled={processing || !ready} size="large">Confirm</Button>
        </div>
      )}
      {processing && (
        <div style={{textAlign: "center", paddingTop: 24}}>
          Checking your payment...
        </div>
      )}
    </form>
  );
}

export type TTopupSession = {
  amount: number,
  onFinish?: () => void,
  onError?: (mesasge: string) => void,
  piClientSecret: string,
  isLiveMode: boolean,
}

export function StripeProvider({children}: React.PropsWithChildren) {
  const {call} = useApi();
  const {waitingForPromise} = useLoader();
  const [topupSession, setTopupSession] = React.useState<TTopupSession | null>(null);

  /**
   * Handle topup dialog.
   */
  const topup = React.useCallback((amount: number, onFinish?: () => void, onError?: (mesasge: string) => void) => {
    // Create payment intent
    const ar = call("stripeCreateIntent", {
      params: {
        amount: Math.ceil(amount * 100).toString(),
        currency: "usd",
      },
    });

    waitingForPromise(ar.promise, "Creating a new transaction...");

    ar.promise
      .then(async r => {
        // Can not create payment intent, return error
        if (!r.ok) {
          onError?.(await extractErrorMessageFromResponse(r));
          return r;
        }

        // Success, start topup dialog
        const data = await r.clone().json();
        setTopupSession({
          amount,
          onFinish,
          onError,
          piClientSecret: data["client_secret"],
          isLiveMode: !!data["livemode"],
        });
      })
      .catch(e => {
        onError?.(extractErrorMessage(e) ?? unexpectedErrorMessage(e));
      });
  }, [call, waitingForPromise]);

  /**
   * Check topup amount before process.
   */
  const topupCheck = React.useCallback((amount: number, onFinish?: () => void, onError?: (mesasge: string) => void) => {
    if (topupSession) {
      return false;
    }

    if (amount < 0.5) {
      confirmDialog({
        title: "Transaction Amount Increase",
        message: "The minimum transaction amount is $0.50 USD. Would you like to increase the amount and continue?",
        onSubmit: () => topup(0.5, onFinish, onError),
      });
    } else {
      topup(amount, onFinish, onError);
    }

    return true;
  }, [topup, topupSession]);

  const getFee = React.useCallback((amount: number) => {
    if (amount === 0) {
      return 0;
    }

    // oldPrice = newPrice - (newPrice * 0.0499 + 0.25)
    // oldPrice = newPrice - (newPrice * 0.0499) - 0.25
    // oldPrice + 0.25 = newPrice * (1 - 0.0499)
    // newPrice = (oldPrice + 0.25) / (1 - 0.0499)

    return (amount + 0.25) / (1 - 0.0499) - amount;
  }, []);

  return (
    <StripeContext.Provider value={{
      topup: topupCheck,
      getFee,
    }}>
      {children}
      {topupSession && (
        <Modal
          open={true}
          cancelText={undefined}
          closeOnOverlayClick={false}
          onClose={() => setTopupSession(null)}
          displayClose={false}
        >
          <Elements stripe={stripePromise} options={{
            clientSecret: topupSession.piClientSecret,
            locale: "en",
          }}>
            {!topupSession.isLiveMode && (
              <div style={{marginBottom: 32}}>
                {createAlertInfo("The payment gateway is working in TEST mode", false)}
              </div>
            )}
            <StripeForm
              amount={topupSession.amount}
              onFinish={() => {
                setTopupSession(null);
                topupSession.onFinish?.();
              }}
              onError={topupSession.onError}
              onClose={() => {
                setTopupSession(null);
              }}
            />
          </Elements>
          <div style={{marginTop: 16}}>
            <Button isBlock type="white" onClick={() => {
              confirmDialog({
                message: "Are you sure you want to close this payment form?",
                submitText: "Yes, I am",
                onSubmit: () => setTopupSession(null),
              })
            }}>
              Cancel
            </Button>
          </div>
        </Modal>
      )}
    </StripeContext.Provider>
  );
}

export default function useStripeProvider() {
  return React.useContext(StripeContext);
}
