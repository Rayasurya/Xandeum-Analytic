export const GENERAL_ENUM = {
  title: "title",
  description: "description",
  gpu: "gpu",
  type: "type",
  color: "color",
};

export type Errors = {
  [key: string]: string;
};

export const validateProjectData = (field: string, value: string, setErrors: React.Dispatch<React.SetStateAction<Errors>>) => {
  const errorsToUpdate: Errors = {};

  const updateErrors = (key: string, errorMessage: string) => {
    errorsToUpdate[key] = errorMessage;
  };

  const clearError = (key: string) => {
    errorsToUpdate[key] = '';
  };

  switch (field) {
    case GENERAL_ENUM.title:
      if (value.trim().length <= 2) {
        updateErrors(GENERAL_ENUM.title, 'Project name must be at least 3 characters long');
      } else {
        clearError(GENERAL_ENUM.title);
      }
      break;
    default:
      break;
  }

  setErrors((prevErrors) => ({
    ...prevErrors,
    ...errorsToUpdate,
  }));

  return Object.keys(errorsToUpdate).length === 0;
};


export const isEmpty = (value: any) => {
  return value === null || value === undefined || value === '';
}

export const isObjectEmpty = (obj: Record<string, any>) => {
  function checkFields(obj: Record<string, any>) {
    for (let key in obj) {
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        if (!checkFields(obj[key])) {
          return false;
        }
      } else {
        if (isEmpty(obj[key])) {
          return false;
        }
      }
    }
    return true;
  }

  return checkFields(obj);
}
