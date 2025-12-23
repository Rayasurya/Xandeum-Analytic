import React, {createContext, useContext, useState} from "react";

type FormDispatch = React.SetStateAction<any>;

type FormContextType = {
  formData: any;
  setFormData: FormDispatch;
  formErrors: any; // Todo
  setFormErrors: (fieldName: string, error: string) => void;
  clearFormErrors: () => void;
};

interface FormProviderProps {
  children: React.ReactNode;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  const [formData, setFormData] = useState<any>({});
  const [formErrors, setFormErrors] = useState<{ [key: string]: string } | null>(null);

  const setFieldError = (fieldName: string, error: string) => {
    if (fieldName === '' && error === '') {
      // Reset all form errors
      setFormErrors({});
    } else {
      // Set error for a specific field
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [fieldName]: error,
      }));
    }
  };

  const clearFormErrors = () => {
    setFormErrors({});
  };

  const contextValue: FormContextType = {
    formData,
    formErrors,
    setFormData,
    setFormErrors: setFieldError,
    clearFormErrors,
  };

  return (
    <FormContext.Provider value={contextValue}>{children}</FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
};
