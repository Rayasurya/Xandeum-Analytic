import "./Notice.scss";

type TNoticeProps = {
  title: string;
  status?: "success" | "info" | "warning" | "error";
  icon?: JSX.Element;
};

const Notice = (props: TNoticeProps) => {
  const { title, status = "info", icon } = props;

  return (
    <div className={`c-notice ${status ? status : ""}`}>
      {icon && <div className="c-notice__icon">{icon}</div>}
      {title && <p className="c-notice__title">{title}</p>}
    </div>
  );
};

export default Notice;
