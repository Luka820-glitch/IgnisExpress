export const validationRules = {
  required: (message: string = "This field is required") => ({
    required: message,
  }),
  email: {
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address",
    },
  },
  phone: {
    pattern: {
      value: /^\+?[1-9]\d{6,14}$/,
      message: "Invalid phone number",
    },
  },
  pid: {
    pattern: {
      value: /^[0-9]{11}$/,
      message: "Personal ID must be 11 digits",
    },
  },
  password: {
    minLength: {
      value: 6,
      message: "Password must be at least 6 characters",
    },
  },
};

export const createValidation = (fieldName: string, isRequired: boolean) => {
  const rules: any = {};

  if (isRequired) {
    rules.required = `${fieldName} is required`;
  }

  switch (fieldName) {
    case "email":
      return { ...rules, ...validationRules.email };
    case "phoneNumber":
      return { ...rules, ...validationRules.phone };
    case "pid":
      return { ...rules, ...validationRules.pid };
    case "password":
      return { ...rules, ...validationRules.password };
    default:
      return rules;
  }
};
