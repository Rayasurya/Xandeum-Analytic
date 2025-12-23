import { Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./CreatePractical.scss";
import Modal from "@/components/Modal/Modal";
import { TProjectModel } from "@/models/project";
import AppLoading from "@/components/AppLoading/AppLoading";

type TPracticalProps = {
  data?: TProjectModel | null;
};

const CreatePractical = (props: TPracticalProps) => {
  const [isOpenModal, setOpenModal] = useState<boolean>(true);
  const [isShowContent, setShowContent] = useState<boolean | null>(null);
  const navigate = useNavigate();

  const handleSubmitModal = () => {
    setShowContent(true);
    setOpenModal(false);
  };

  const handleCancelModal = (ref?: React.RefObject<HTMLDivElement> | null) => {
    setShowContent(false);
    setOpenModal(false);

    if (ref?.current) {
      navigate(`/projects/${props.data?.id}/import/local`);
    }
  };

  return (
    <div className="c-create-practical">
      <Suspense>
        <Modal
          title="Create a practical?"
          cancelText="No"
          submitText="Yes"
          className="c-create-practical__modal-manager"
          open={isOpenModal}
          onSubmit={handleSubmitModal}
          onCancel={handleCancelModal}
        ></Modal>
      </Suspense>
      <Suspense fallback={<AppLoading/>}>
        {isShowContent && (
          <div>Upload a test set with a ground truth result</div>
        )}
      </Suspense>
    </div>
  );
};

export default CreatePractical;
