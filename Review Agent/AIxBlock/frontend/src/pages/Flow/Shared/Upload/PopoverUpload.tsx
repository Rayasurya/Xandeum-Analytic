import React, { ReactNode, useRef, useState } from 'react';
import { IconArrowDown, IconArrowUp } from '../../../../assets/icons/IconArrowDown';
import IconClose from '../../../../assets/icons/IconClose';
import styles from './PopoverUpload.module.scss';

type CollapseSectionProps = {
  children: ReactNode;
  isOpen: boolean;
};

type TPopoverUploadProps = {
  title: string;
  children?: ReactNode;
  isModalVisible: boolean;
  onCancel?: (ref?: React.RefObject<HTMLDivElement> | null) => void;
}

const CollapseSection = ({ children, isOpen }: CollapseSectionProps) => {
  return (
    <div className={styles.section}>

      {isOpen && <div className={styles.content}>{children}</div>}
    </div>
  );
};

const PopupWithCollapse = (props: TPopoverUploadProps) => {
  const cancelBtnRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const handleClose = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const targetTagName = (event.target as HTMLElement)?.tagName.toLowerCase();
    if (targetTagName !== "button" && props.onCancel) {
      props.onCancel(null);
    } else {
      props.onCancel && props.onCancel(cancelBtnRef);
    }
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {props.isModalVisible && (
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>{props.title}</h2>
            <div className={styles.modalHeaderAction}>
              <div onClick={toggleOpen} className={styles.btnCollapse}>
                {isOpen ? <IconArrowDown /> : <IconArrowUp />}
              </div>
              <div
                ref={cancelBtnRef}
                className={styles.btnClose}
                onClick={handleClose}
              >
                <IconClose width={18} height={18} />
              </div>
            </div>
          </div>
          {isOpen &&
            <div className={styles.modalContent}>
              <CollapseSection isOpen={isOpen}>
                {props.children}
              </CollapseSection>
            </div>
          }
        </div>
      )}
    </>
  );
};

export default PopupWithCollapse;
