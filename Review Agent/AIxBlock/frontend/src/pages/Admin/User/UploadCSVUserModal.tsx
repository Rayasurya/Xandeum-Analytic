import {Fragment, ReactNode, Suspense, useCallback, useMemo, useState} from "react";
import Modal from "@/components/Modal/Modal";
import IconPlus from "@/assets/icons/IconPlus";
import Upload from "@/components/Upload/Upload";
import "./UploadCSVUserModal.scss";
import {useCreateUser} from "@/hooks/admin/user/useCreateUser";
import {infoDialog} from "@/components/Dialog";
import Table, {TTableColumn} from "@/components/Table/Table";
import {newUser} from "@/models/user";

type UploadCSVModalProps = {
  isOpenModal: boolean;
  setCloseModal: () => void;
};

const processingTableColumns: TTableColumn[] = [
  {label: "Email", dataKey: "email"},
  {label: "Username", dataKey: "username"},
  {label: "Status", dataKey: "status"},
];

type TProcessingTableData = {
  username: string | ReactNode,
  email: string | ReactNode,
  status: string | ReactNode,
}

const UploadCSVUserModal = (props: UploadCSVModalProps) => {
  const { isOpenModal, setCloseModal } = props;
  const [file, setFile] = useState<File | null>(null);
  const { create } = useCreateUser();
  const [createdUsers, setCreatedUsers] = useState<TProcessingTableData[]>([]);
  const [state, setState] = useState<"new" | "processing" | "processed">("new");

  const createUsers = useCallback(async () => {
    if (!file) {
      infoDialog({title: "Error", message: "Please select a .csv file"});
      return;
    }

    setState("processing");

    file.text().then(async c => {
      if (!isOpenModal) {
        return;
      }

      const rows = c.split("\n");

      for (let i = 0; i < rows.length; i++) {
        const cols = rows[i].split(",");
        const ar = create({...newUser, username: cols[0], email: cols[1], password: cols[2]})

        if (ar) {
          const r = await ar.promise;

          if (r.ok) {
            setCreatedUsers(l => [...l, {
              username: cols[0],
              email: cols[1],
              status: "Created",
            }]);
          } else {
            const data = await r.json();
            let email: string | ReactNode = cols[1];

            if (Object.hasOwn(data, "validation_errors")) {
              if (Object.hasOwn(data["validation_errors"], "email") && data["validation_errors"]["email"].length > 0) {
                email = (
                  <Fragment>
                    {email}
                    <div style={{marginTop: 4, fontSize: 12, color: "#F2415A"}}>
                      <em>{data["validation_errors"]["email"][0]}</em>
                    </div>
                  </Fragment>
                );
              }

              if (Object.hasOwn(data["validation_errors"], "username") && data["validation_errors"]["username"].length > 0) {
                email = (
                  <Fragment>
                    {email}
                    <div style={{marginTop: 4, fontSize: 12, color: "#F2415A"}}>
                      <em>{data["validation_errors"]["username"][0]}</em>
                    </div>
                  </Fragment>
                );
              }
            }

            setCreatedUsers(l => [...l, {
              username: cols[0],
              email: email,
              status: "Failed",
            }]);
          }
        } else {
          setCreatedUsers(l => [...l, {
            username: cols[0],
            email: cols[1],
            status: "Failed",
          }]);
        }
      }

      setState("processed");
    });
  }, [create, file, isOpenModal]);

  const processingNode = useMemo(() => {
    if (state === "new") {
      return null;
    }

    return (
      <Table columns={processingTableColumns} data={createdUsers} />
    );
  }, [createdUsers, state]);

  return (
    <Suspense>
      <Modal
        open={isOpenModal}
        title={state === "new" ? "Create users" : state === "processing" ? "Creating users..." : "Result"}
        className="csv-modal"
        icon={<IconPlus />}
        onCancel={() => state !== "processing" && setCloseModal()}
        displayClose={state !== "processing"}
        submitText={file && state === "new" ? "Create" : undefined}
        onSubmit={() => createUsers()}
        cancelText={state === "processed" ? "Close" : undefined}
      >
        {processingNode}
        {state === "new" && (
          <div className="csv-modal__upload">
            <Upload
              name="csv_file"
              accept=".csv"
              clearFile={() => setFile(null)}
              onUpload={(file) => {
                if (file instanceof File) {
                  setFile(file);
                }
              }}
            />
          </div>
        )}
      </Modal>
    </Suspense>
  );
};

export default UploadCSVUserModal;
