import { useState } from "react";
import Modal from "@/components/Modal/Modal";
import IconTwoArrow from "@/assets/icons/IconTwoArrow";
import IconArrowLeft from "@/assets/icons/IconArrowLeft";
import WithdrawSuccessModal from "./WithdrawSuccessModal";
import "./WithdrawWithFiatModal.scss";

type DepositBuyAXBModalProps = {
  open: boolean;
  onCancel: (open: boolean) => void;
};

const WithdrawWithFiatModal = (props: DepositBuyAXBModalProps) => {
  const [openWithdrawSuccessModal, setOpenWithdrawSuccessModal] =
    useState(false);

  return (
    <>
      <Modal
        title="Withdraw with fiat"
        open={props.open}
        onCancel={() => props.onCancel(false)}
        className="withdraw-fiat"
      >
        <div className="withdraw-fiat-content">
          <div className="withdraw-fiat-content-fiat">
            <div className="group-field">
              <div className="group-field-title">Sell</div>
              <div className="group-field-input">
                <input defaultValue="0.00012" />
                <div className="group-field-input-prefix">
                  <span>AXB</span>
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
                <input defaultValue="$453" />
                <div className="group-field-input-prefix">
                  <span>USD</span>
                  <span>Max</span>
                </div>
              </div>
            </div>
            <div className="group-field-des">
              <span>you will sell </span>
              <span>0.00012 AXB to get $453</span>
            </div>
          </div>
          <div className="withdraw-fiat-content-btn">
            <button
              className="withdraw-fiat-content-btn-back"
              onClick={() => props.onCancel(false)}
            >
              <IconArrowLeft />
              <span>Back</span>
            </button>
            <button
              className="withdraw-fiat-content-btn-buy"
              onClick={() => setOpenWithdrawSuccessModal(true)}
            >
              <span>Sell</span>
              <IconArrowLeft />
            </button>
          </div>
        </div>
      </Modal>
      <WithdrawSuccessModal
        open={openWithdrawSuccessModal}
        onCancel={setOpenWithdrawSuccessModal}
      />
    </>
  );
};

export default WithdrawWithFiatModal;
