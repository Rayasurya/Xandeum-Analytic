import {PRICE_FP, TOKEN_SYMBOL_DEFAULT} from "@/constants/projectConstants";
import InputBase from "../InputBase/InputBase";
import React, {useState} from "react";
import Modal from "../Modal/Modal";
import styles from "./Topup.module.scss";
import Button from "../Button/Button";
import useStripeProvider from "@/providers/StripeProvider";
import {toastError} from "@/utils/toast";
import {formatFloat} from "@/utils/customFormat";

export type TProps = {
  isOpen: boolean;
  onClose: () => void;
  onFinish?: () => void;
}

export default function CustomAmount({isOpen, onClose, onFinish}: TProps) {
  const [amount, setAmount] = useState<number>(10);
  const onChangeTimeout = React.useRef<NodeJS.Timeout>();
  const stripe = useStripeProvider();

  const onInputChange = React.useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    clearTimeout(onChangeTimeout.current);

    onChangeTimeout.current = setTimeout(() => {
      if (ev.target.value.trim().length === 0) {
        setAmount(0);
      } else {
        setAmount(parseFloat(ev.target.value));
      }
    }, 500);
  }, []);

  const isInvalidAmount = React.useMemo(() => isNaN(amount) || amount <= 0, [amount]);

  const onConfirm = React.useCallback(() => {
    if (isNaN(amount)) {
      return;
    }

    stripe.topup(
      amount + stripe.getFee(amount),
      () => {
        onFinish?.();
      },
      msg => {
        toastError(msg)
      },
    );

    onClose();
  }, [amount, onClose, onFinish, stripe]);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      className={styles.customTopup}
      closeOnOverlayClick={true}
    >
      <InputBase
        autoFocus
        label={"Amount (" + TOKEN_SYMBOL_DEFAULT + ")"}
        onChange={onInputChange}
        onBlur={onInputChange}
        value={amount.toString()}
        error={isInvalidAmount ? "Invalid Amount" : undefined}
      />
      <div style={{marginTop: 16}}>
        <InputBase
          label={"Estimated Transaction Fee (" + TOKEN_SYMBOL_DEFAULT + ")"}
          value={isInvalidAmount ? "" : formatFloat(stripe.getFee(amount), PRICE_FP)}
          isControlledValue
          readonly
        />
        <span style={{fontSize: ".8em", opacity: 0.7, lineHeight: "1.25em", marginTop: 8, display: "block"}}>Transaction fees may vary. In some cases, you might even receive a refund if the actual fee is lower than estimated. Any excess amount will be credited back to your wallet.</span>
      </div>
      <div style={{marginTop: 16}}>
        <InputBase
          label={"Total"}
          value={isInvalidAmount ? "" : formatFloat(amount + stripe.getFee(amount), PRICE_FP)}
          isControlledValue
          readonly
        />
      </div>
      <div style={{marginTop: 16}}>
        <Button
          type="gradient"
          isBlock
          onClick={onConfirm}
          disabled={isInvalidAmount}
        >
          Confirm
        </Button>
      </div>
    </Modal>
);
}
