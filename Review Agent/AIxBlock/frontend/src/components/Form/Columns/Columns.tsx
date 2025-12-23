import FormFields from "../Fields/Fields";
import { TColumns } from "../Form";

type TColumnsProps = {
  columns: TColumns[];
};

const FormColumns = (props: TColumnsProps) => {
  const { columns } = props;
  return (
    <>
      {columns?.map((col, index) => (
        <div
          className={`c-form__columns `}
          key={`columns-${index}`}
          style={{ width: col.width }}
        >
          <FormFields fields={col.fields ?? []} />
        </div>
      ))}
    </>
  );
};

export default FormColumns;
