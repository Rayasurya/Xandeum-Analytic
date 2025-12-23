interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

export const validateForm = (formData: any, setFormErrors: (fieldName: string, error: string) => void): ValidationResult => {
  const errors: { [key: string]: string } = {};

  Object.keys(formData).forEach((field) => {
    const fieldValue = formData[field];

    if (field !== 'null' && fieldValue !== null && typeof fieldValue !== 'boolean' && !fieldValue.name && fieldValue?.rq) {
      errors[field] = `${field} is required`;
      setFormErrors(field, `${field} is required`);
    } else {
      setFormErrors(field, '');
    }
  });

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

export const getError = (errors: any, fieldRq: string): string | null => {
  if (!errors) return null;
  const error = errors[fieldRq];
  return error || null;
};
