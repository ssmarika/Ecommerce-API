import express from "express";
import validateReqBody from "../middleware/validation.js";
import {
  loginValidationSchema,
  userValidationSchema,
} from "./user.validation.js";
import User from "./user.model.js";
import bcrypt from "bcrypt";

const router = express.Router();

// ? register user
router.post(
  "/register",
  //extract data from req.body
  //validate data
  //if error throw error
  //call next function

  validateReqBody(userValidationSchema),

  async (req, res) => {
    //extract the yser data
    const newUser = req.body;
    //find the user
    const user = User.findOne({ email: newUser.email });

    //if not found throw error
    if (!user) {
      return res.status(404).send({ message: "User already exits" });
    }

    //hash password
    const plainPassword = newUser.password;
    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRound);

    newUser.password = hashedPassword;

    //insert User
    await User.create(newUser);

    return res.status(201).send({ message: "New user added" });
  }
);

// ? login
router.post(
  "/login",
  validateReqBody(loginValidationSchema),
  async (req, res) => {
    // extract login credentials
    const data = req.body;

    // find user by email
    const user = await User.findOne({ email: data.email });

    // if user nit found throw error
    if (!user) {
      return res.status(404).send({ message: "Invalid credentials" });
    }

    // check password

    const plainPassword = data.password;
    const hashedPassword = user.password;
    const valid = await bcrypt.compare(plainPassword, hashedPassword);

    if (!valid) {
      return res.status(404).send({ message: "Invalid Credentials" });
    }

    return res.status(200).send({ message: "Successful" });
  }
);

export default router;
