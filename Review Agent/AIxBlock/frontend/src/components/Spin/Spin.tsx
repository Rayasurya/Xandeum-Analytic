import { useEffect } from "react";
import "./Spin.scss";

interface ISpinProp {
  loading: boolean;
  inline?: boolean;
  size?: "lg" | "md" | "sm";
}

const Spin = (props: ISpinProp) => {
  const { loading, size = "sm" } = props;
  useEffect(() => {
    const body = document.body;

    if (loading) {
      body.style.overflowY = "hidden";
      body.style.width = "calc(100% - 15px)";
    }

    return () => {
      body.style.overflowY = "";
      body.style.width = "";
    };
  }, [loading]);

  return (
    <>
      {loading && (
        <div className={`c-spin ${props.inline ? "c-spin--inline" : ""}`}>
          <div className={`c-spin__content ${size}`}></div>
        </div>
      )}
    </>
  );
};

export default Spin;
