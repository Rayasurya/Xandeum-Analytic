import React, {
  CSSProperties,
  DOMAttributes,
  MutableRefObject,
  ReactNode,
  useEffect,
  useMemo,
  useState
} from "react";
import IconClear from "@/assets/icons/IconClear";
import "./InputBase.scss";
import Spin from "../Spin/Spin";

export type TInputBaseProps = {
  outsideRef?: MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>,
  autoFocus?: boolean;
  className?: string;
  type?: "text" | "password" | "email" | "number" | "datetime-local" | "date" | "hidden";
  fieldName?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  status?: "" | "error" | "warning" | "success";
  style?: CSSProperties;
  value?: string | undefined;
  isRequired?: boolean;
  error?: string | null;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isMultipleLine?: boolean;
  readonly?: boolean;
  customRightItem?: ReactNode;
  validateNonNegativeInteger?: boolean;
  isDefaultValue?: boolean;
  isControlledValue?: boolean;
  isLoading?: boolean;
  onClick?: DOMAttributes<HTMLElement>["onClick"];
};

const InputBase: React.FC<TInputBaseProps> = ({
  outsideRef,
  autoFocus,
  className,
  type = "text",
  fieldName,
  label,
  placeholder,
  disabled,
  allowClear = true,
  status = "",
  style,
  value,
  isRequired = false,
  error,
  onChange,
  onBlur,
  isMultipleLine = false,
  readonly = false,
  customRightItem,
  validateNonNegativeInteger = false,
  onKeyUp,
  isDefaultValue = false,
  isControlledValue = false,
  isLoading,
  onClick,
}) => {
  const [query, setQuery] = useState(() => {
    return value ? value : "";
  });

  const inputStyle: React.CSSProperties = {
    ...style,
  };

  useEffect(() => {
    if (!isControlledValue) {
      return;
    }

    setQuery(value ?? "");
  }, [isControlledValue, value]);

  const isNonNegativeInteger = (value: string): boolean => {
    if (!/^[0-9]+$/.test(value)) {
      return false;
    }

    return !(value.length > 1 && value.startsWith("0") && value !== "0");
  };
  
 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validateNonNegativeInteger) {
      const newValue = e.target.value.replace(/-/g, "");

      if (!isNonNegativeInteger(newValue) && newValue !== "") {
        return;
      }
    }

    if (!isControlledValue) {
      setQuery(e.target.value);
    }

    onChange?.(e);
  };
  
  const handleInputBlurChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validateNonNegativeInteger) {
      const newValue = e.target.value.replace(/-/g, "");

      if (!isNonNegativeInteger(newValue) && newValue !== "") {
        return;
      }
    }

    if (!isControlledValue) {
      setQuery(e.target.value);
    }

    onBlur?.(e);
  };

  const classes = useMemo(() => {
    const list = ["c-input-base__field"];

    if (fieldName) {
      list.push("c-input-base__field-" + fieldName);
    }

    if (error) {
      list.push("c-input-base--error");
    } else if (status) {
      list.push("c-input-base--" + status);
    }

    if (disabled) {
      list.push("disabled");
    }

    if (className) {
      list.push(className);
    }

    if ((query ?? "").toString().trim().length > 0) {
      list.push("has-value");
    }

    return list;
  }, [fieldName, error, status, disabled, className, query]);

  return (
    <div className={classes.join(" ")}>
      {label && (
        <label className="c-input-base__label">
          <span>{label}</span>{" "}
          {isRequired && <span className="required">*</span>}
        </label>
      )}
      <div className="c-input-base__control">
        {isLoading && <Spin size="sm" loading={isLoading} />}
        {isMultipleLine ? (
          <textarea
            ref={r => {
              if (outsideRef) outsideRef.current = r;
            }}
            autoFocus={autoFocus}
            className={`input-text ${isLoading ? "loading" : ""}`}
            id={fieldName}
            name={fieldName}
            placeholder={placeholder}
            onChange={(e) =>
              handleInputChange(
                e as unknown as React.ChangeEvent<HTMLInputElement>
              )
            }
            onBlur={(e) =>
              handleInputBlurChange(
                e as unknown as React.ChangeEvent<HTMLInputElement>
              )
            }
            disabled={disabled || isLoading}
            style={inputStyle}
            readOnly={readonly}
            defaultValue={query}
            // @ts-ignore
            onKeyUp={onKeyUp}
            onClick={onClick}
          />
        ) : (
          <input
            ref={r => {
              if (outsideRef) outsideRef.current = r;
            }}
            autoFocus={autoFocus}
            className={`input-text ${isLoading ? "loading" : ""}`}
            id={fieldName}
            name={fieldName}
            type={type}
            value={isControlledValue ? value : query}
            placeholder={placeholder}
            onChange={handleInputChange}
            onBlur={handleInputBlurChange}
            disabled={disabled || isLoading}
            style={inputStyle}
            readOnly={readonly}
            onKeyUp={onKeyUp}
            onClick={onClick}
              // defaultValue={query}
            {...(isDefaultValue ? { defaultValue: query } : { value: query })}
          />
        )}
        {query.length > 0 && allowClear && (
          <div className="c-input-base__action">
            <button onClick={() => setQuery("")}>
              <IconClear />
            </button>
          </div>
        )}
        {customRightItem && (
          <div className="c-input-base__right">{customRightItem}</div>
        )}
      </div>
      {error && <span className="c-input-base__error">{error}</span>}
    </div>
  );
};

export default InputBase;
