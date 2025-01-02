import Yup from "yup";

export const addCartItemValidationSchema = Yup.object({
  productId: Yup.string().required(),
  orderQuantity: Yup.number().required().min(1),
});
