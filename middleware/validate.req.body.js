const validateReqBody = (validationSchema) => {
  return async (req, res, next) => {
    const data = req.body;
    try {
      const validatedData = await validationSchema.validate(data);
      req.body = validatedData;
    } catch (error) {
      return res.status(404).send({ message: error.message });
    }

    next();
  };
};

export default validateReqBody;
