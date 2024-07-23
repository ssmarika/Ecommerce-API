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

const validateMongoIdfromParams = (req, res, next) => {
  //extract id from req.params
  const id = req.params;

  //check for mongo id validity
  const isValidId = mongoose.isValidObjectId(id);

  //if not valid throw error
  if (!isValidId) {
    return res.status(400).send({ message: "Invalid mongoId" });
  }

  // call next function

  next();
};
export default validateReqBody;
