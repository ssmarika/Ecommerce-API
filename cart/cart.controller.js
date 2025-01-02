import express from "express";
import { isBuyer } from "../middleware/authentication.middleware.js";
import validateReqBody from "../middleware/validate.req.body.js";
import { addCartItemValidationSchema } from "./cart.validation.js";
import checkMongoIdValidity from "../utils/mongoid.validity.js";
import Product from "../product/product.model.js";
import Cart from "./cart.model.js";
import validateMongoIdFromParams from "../middleware/validate.mongoid.js";

const router = express.Router();

//? add item to cart
router.post(
  "/add/item",
  isBuyer,
  validateReqBody(addCartItemValidationSchema),
  (req, res, next) => {
    //validate product id from req.body
    const { productId } = req.body;

    // check mongo
    const isValidObjectId = checkMongoIdValidity(productId);

    //throw error
    if (!isValidObjectId) {
      return res.status(401).send({ message: "Invalid mongoId" });
    }
    next();
  },
  async (req, res) => {
    //extract cart item data from re body
    const { productId, orderQuantity } = req.body;

    // find product using productId
    const product = await Product.findById(productId);

    // if not product throw error
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    //check if quantity does not exceed product quantity
    if (orderQuantity > product.quantity) {
      return res.status(403).send({ message: "Product is outnumbered" });
    }

    // if order quantity exceed throw error

    // add to cart

    Cart.create({
      buyerId: req.loggedInUserId,
      productId,
      orderQuantity,
    });

    //send res

    return res.status(201).send({ message: "Added to cart successfully" });
  }
);

// ? flush cart/ remove all items from cart
router.delete("/flush", isBuyer, async (req, res) => {
  //extract buyerId from req.loggedInUserId
  const buyerId = req.loggedInUserId;

  // remove all items from cart for that buyer
  await Cart.deleteMany({ buyerId });

  //send res
  return res.status(200).send({ message: "Cart cleared" });
});

//? remove single item from cart
router.delete(
  "/item/delete/:id", //id has cartId
  isBuyer,
  validateMongoIdFromParams,
  async (req, res) => {
    // extract cartId from req.params
    const cartId = req.params.id;

    //check cart ownership
    const cart = await Cart.findOne({
      _id: cartId,
      buyerId: req.loggedInUserId,
    });

    //if not cart, throw error
    if (!cart) {
      return res.status(403).send({ message: "You are not the owner" });
    }
    // delete cart
    await Cart.deleteOne({ _id: cartId, buyerId: req.loggedInUserId });
  }
);

export default router;
