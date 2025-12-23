import Modal from "@/components/Modal/Modal";
import "./WithdrawSuccessModal.scss";

type WithdrawSuccessModalProps = {
  open: boolean;
  onCancel: (open: boolean) => void;
};

const WithdrawSuccessModal = (props: WithdrawSuccessModalProps) => {
  return (
    <Modal
      title=""
      open={props.open}
      onCancel={() => props.onCancel(false)}
      className="withdraw-success"
    >
      <div className="withdraw-success-content">
        <div className="withdraw-success-content-title">
          WithDraw Successful
        </div>
        <button
          className="withdraw-success-content-btn-done"
          onClick={() => props.onCancel(false)}
        >
          Done
        </button>
        <div className="withdraw-success-content-skip">Skip for now</div>
      </div>
    </Modal>
  );
};

export default WithdrawSuccessModal;
