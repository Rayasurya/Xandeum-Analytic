import {useParams} from "react-router-dom";
import {Elements, useStripe} from "@stripe/react-stripe-js";
import {stripePromise} from "@/providers/StripeProvider";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import React from "react";
import {useCentrifuge} from "@/providers/CentrifugoProvider";

function Main() {
  const [error, setError] = React.useState<string | undefined>();
  const [success, setSuccess] = React.useState(false);
  const {cs} = useParams();
  const stripe = useStripe();
  const {publish} = useCentrifuge();

  React.useEffect(() => {
    if (!stripe) {
      return;
    }

    const timeout = setTimeout(async () => {
      if (!cs) {
        return;
      }

      try {
        const result = await stripe.handleNextAction({
          clientSecret: cs,
        });

        if (result.error) {
          setError(result.error.message ?? "An error occurred while confirming your transaction");
        } else {
          setSuccess(true);
        }
      } catch (e) {
        setError((e as Error).message)
      }

      publish(cs, {capture: true});
    }, 500);

    return () => clearTimeout(timeout);
  }, [cs, publish, stripe]);

  if (success) {
    return <EmptyContent message={(
      <div style={{lineHeight: "1.5em"}}>
        <div>Your transaction has been confirmed successfully.</div>
        <div>Now, you can close this page and come back to previous page to continue.</div>
      </div>
    )} />;
  }

  if (error) {
    return <EmptyContent message={error} />;
  }

  return <EmptyContent message="Processing your transaction... Please wait a moment!" />;
}

export default function StripeConfirm() {
  const {cs} = useParams();

  return (
    <>
      <Elements stripe={stripePromise} options={{
        clientSecret: cs,
        locale: "en",
      }}>
        <Main />
      </Elements>
    </>
  );
}
