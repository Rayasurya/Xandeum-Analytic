import React from "react";
import IconCopy from "@/assets/icons/IconCopy";
import IconDashArrowLeft from "@/assets/icons/IconDashArrowLeft";
import Modal from "@/components/Modal/Modal";
import "./DepositWithAXBModal.scss";
import IconChecked from "@/assets/icons/IconChecked";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { QRCodeSVG } from "qrcode.react";

type DepositWithAXBModalProps = {
  open: boolean;
  onCancel: (open: boolean) => void;
  walletAddress: string;
};

const DepositWithAXBModal = (props: DepositWithAXBModalProps) => {
  const depositAddressRef = React.useRef<HTMLDivElement>(null);
  const [copiedText, copy] = useCopyToClipboard();

  return (
    <Modal
      title="Deposit with SOL/USDC"
      open={props.open}
      onCancel={() => props.onCancel(false)}
      className="deposit-axb"
    >
      <div className="deposit-axb-modal">
        <QRCodeSVG value={props.walletAddress} className="qrcode-img"/>
        {/* <img
          src={require("@/assets/images/DepositQR.png")}
          alt="Deposit with AXB"
        /> */}
        <div className="deposit-axb-modal-item">
          <div className="deposit-axb-modal-item-content">
            <div className="deposit-axb-modal-item-content-title">
              <span className="highlight">Network</span>
            </div>
            <div className="deposit-axb-modal-item-content-name">Solana</div>
          </div>
          <div className="deposit-axb-modal-item-note">
            Be sure to only deposit USDC/SOL on Solana network to this address for now.
          </div>
            {/* <div className="deposit-axb-modal-item-content-des">
              <span>Free 1.00 USDT</span>
              <span>Minimum withdrawal 10 USDT</span>
              <span>Arrival time = 2 mins</span>
            </div> */}
          {/* </div> */}
          {/* <div className="deposit-axb-modal-item-icon">
            <IconTwoArrow />
          </div> */}
        </div>
        <div className="deposit-axb-modal-item">
          <div className="deposit-axb-modal-item-content">
            <div className="deposit-axb-modal-item-content-title">
              {/* Deposit Address */}
              Deposit SOL/USDC
            </div>
            <div
              className="deposit-axb-modal-item-content-name"
              ref={depositAddressRef}
            >
              {props.walletAddress}
            </div>
          </div>
          <div
            className="deposit-axb-modal-item-icon"
            onClick={() =>
              copy && copy(depositAddressRef.current?.innerText ?? "")
            }
          >
            {copiedText ? <IconChecked color="#27BE69" /> : <IconCopy />}
          </div>
        </div>
        <button
          className="deposit-axb-modal-btn"
          onClick={() => props.onCancel(false)}
        >
          <IconDashArrowLeft />
          <span>Back</span>
        </button>
      </div>
    </Modal>
  );
};

export default DepositWithAXBModal;
