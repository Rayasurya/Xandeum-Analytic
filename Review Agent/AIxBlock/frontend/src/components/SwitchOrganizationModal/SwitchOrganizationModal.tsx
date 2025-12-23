import { useEffect } from "react";
import { TCompactOrganizationsList } from "@/models/organization";
import { useAuth } from "@/providers/AuthProvider";
import Button from "../Button/Button";
import { infoDialog } from "../Dialog";
import Modal from "../Modal/Modal";
import "./SwitchOrganizationModal.scss";

interface ISpinProp {
  openModal: boolean;
  setCloseModal: () => void;
  organizationsData: TCompactOrganizationsList;
  confirmSwitchOrganization: (id: number) => void;
  error: Record<string, string> | undefined;
}

const SwitchOrganizationModal = (props: ISpinProp) => {
  const {
    openModal,
    setCloseModal,
    organizationsData,
    confirmSwitchOrganization,
    error,
  } = props;
  const { user } = useAuth();

  useEffect(() => {
    if (error && error?.message) {
      infoDialog({ message: error?.message });
    }
  }, [error]);

  return (
    <Modal
      open={openModal}
      title="Switch Organization"
      onCancel={setCloseModal}
      className="switch-org"
    >
      <div className="switch-org-content">
        {organizationsData.map((org) => (
          <div className="switch-org-content-row" key={`key-${org.id}`}>
            <span className="switch-org-content-row-title">{org.title}</span>
            <span className={`switch-org-content-row-status ${org.status}`}>
              {org.status}
            </span>
            <Button
              disabled={
                user?.active_organization === org.id || org.status !== "actived"
              }
              type="hot"
              onClick={() => org.id && confirmSwitchOrganization(org.id)}
            >
              Switch
            </Button>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default SwitchOrganizationModal;
