import yup from "yup";

export const userValidationSchema = yup.object({
  email: yup.string().required().trim().max(55).lowercase().email(),
  password: yup.string().required().trim(),
  firstName: yup.string().required().trim().max(30),
  lastName: yup.string().required().trim().max(30),
  gender: yup.string().required().oneOf(["male", "female", "other"]),
  role: yup.string().required().oneOf(["buyer", "seller"]),
});

export const loginValidationSchema = yup.object({
  email: yup.string().required().trim().lowercase().email(),
  password: yup.string().required().trim(),
});
