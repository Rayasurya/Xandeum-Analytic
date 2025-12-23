import {useListGlobalStorage} from "@/hooks/settings/cloudStorage/useListGlobalStorage";
import Table from "@/components/Table/Table";
import {formatDateTime} from "@/utils/formatDate";
import Button from "@/components/Button/Button";
import {useMemo} from "react";
import EmptyContent from "@/components/EmptyContent/EmptyContent";

export type TProps = {
  onLink?: (id: number, type: string) => void;
}

export default function GlobalStorageList({onLink}: TProps) {
  const storages = useListGlobalStorage();
  const hasStorages = useMemo(() => storages.list && storages.list.length > 0, [storages.list]);

  return (
    <div>
      {!hasStorages && (
        <EmptyContent message="No global cloud storage found." />
      )}
      {hasStorages && (
        <Table
          columns={[
            {label: "ID", dataKey: "id"},
            {label: "Type", dataKey: "storage_type"},
            {label: "Title", dataKey: "title"},
            {label: "Date Created", dataKey: "created_at", renderer: (value) => formatDateTime(value.created_date)},
            {
              align: "RIGHT",
              renderer: (s) => {
                return (
                  <Button
                    size="tiny"
                    onClick={() => onLink?.(s.id, s.storage_type)}
                  >
                    Link
                  </Button>
                );
              },
            }
          ]}
          data={storages.list??[]}
        />
      )}
    </div>
  );
}
