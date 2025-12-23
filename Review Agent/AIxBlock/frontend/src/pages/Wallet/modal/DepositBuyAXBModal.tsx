import { useCallback, useRef, useState } from "react";
import Modal from "@/components/Modal/Modal";
import IconTwoArrow from "@/assets/icons/IconTwoArrow";
import IconArrowLeft from "@/assets/icons/IconArrowLeft";
import IconArrowLeftBold from "@/assets/icons/IconArrowLeftBold";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import "./DepositBuyAXBModal.scss";

type DepositBuyAXBModalProps = {
  open: boolean;
  onCancel: (open: boolean) => void;
  onHandleBuy?: () => void
};

const YOUR_AMOUNT_OPTIONS = ["ETH", "BTC", "TRB", "ARB"];

const DepositBuyAXBModal = (props: DepositBuyAXBModalProps) => {
  const [type, setType] = useState<"fiat" | "crypto">("fiat");
  const [amountValue, setAmountValue] = useState("ETH");
  const [showAmountOptions, setShowAmountOptions] = useState(false);
  const amountRef = useRef<HTMLDivElement | null>(null);
  const handleClickOutside = useCallback(() => {
    if (!amountRef.current || !showAmountOptions) return false;
    setShowAmountOptions(false);
  }, [showAmountOptions]);
  useOnClickOutside(amountRef, handleClickOutside);

  return (
    <Modal
      title="Buy AXB"
      open={props.open}
      onCancel={() => props.onCancel(false)}
      className="buy-axb"
    >
      <div className="buy-axb-content">
        <div className="buy-axb-content-tab">
          <span
            className={type === "fiat" ? "active" : ""}
            onClick={() => setType("fiat")}
          >
            By Fiat
          </span>
          <span
            className={type === "crypto" ? "active" : ""}
            onClick={() => setType("crypto")}
          >
            By Crypto
          </span>
        </div>

        {type === "fiat" && (
          <div className="buy-axb-content-fiat">
            <div className="group-field">
              <div className="group-field-title">Your amount</div>
              <div className="group-field-input">
                <input defaultValue="$453" />
                <div className="group-field-input-prefix">
                  <span>USD</span>
                  <span>Max</span>
                </div>
              </div>
            </div>
            <div className="group-field-icon">
              <IconTwoArrow />
            </div>
            <div className="group-field">
              <div className="group-field-title">Get</div>
              <div className="group-field-input">
                <input defaultValue="0.00012" />
                <div className="group-field-input-prefix">
                  <span>AXB</span>
                  <span>Max</span>
                </div>
              </div>
            </div>
            <div className="group-field-des">
              <span>you will get </span>
              <span>0.00012 AXB for $453</span>
            </div>
          </div>
        )}

        {type === "crypto" && (
          <div className="buy-axb-content-crypto">
            <div className="group-field">
              <div className="group-field-title">Your amount</div>
              <div className="group-field-input">
                <input defaultValue="0.001" />
                <div className="group-field-input-prefix">
                  <div
                    className={`group-field-input-prefix-select ${
                      showAmountOptions ? "arrow-down" : ""
                    }`}
                    ref={amountRef}
                    onClick={() => setShowAmountOptions(!showAmountOptions)}
                  >
                    <span>{amountValue}</span>
                    <IconArrowLeftBold />
                    {showAmountOptions && (
                      <div className="group-field-input-prefix-select-options">
                        {YOUR_AMOUNT_OPTIONS.filter(
                          (option) => option !== amountValue
                        ).map((item, index) => (
                          <div key={index} onClick={() => setAmountValue(item)}>
                            {item}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span>Max</span>
                </div>
              </div>
            </div>
            <div className="group-field-icon">
              <IconTwoArrow />
            </div>
            <div className="group-field">
              <div className="group-field-title">Get</div>
              <div className="group-field-input">
                <input defaultValue="0.00012" />
                <div className="group-field-input-prefix">
                  <span>AXB</span>
                  <span>Max</span>
                </div>
              </div>
            </div>
            <div className="group-field-des">
              <span>you will get </span>
              <span>0.00012 AXB for 0.01 ETH</span>
            </div>
          </div>
        )}

        <div className="buy-axb-content-btn">
          <button
            className="buy-axb-content-btn-back"
            onClick={() => props.onCancel(false)}
          >
            <IconArrowLeft />
            <span>Back</span>
          </button>
          <button onClick={props.onHandleBuy } className="buy-axb-content-btn-buy">
            <span>Buy</span>
            <IconArrowLeft />
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DepositBuyAXBModal;
