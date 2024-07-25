import express from "express";
import {
  isUser,
  isSeller,
  isBuyer,
} from "../middleware/authentication.middleware.js";
import validateReqBody from "../middleware/validate.req.body.js";
import Product from "./product.model.js";
import {
  addProductValidationSchema,
  paginationData,
} from "./product.validation.js";
import validateMongoIdFromParams from "../middleware/validate.mongoid.js";
import checkMongoIdsEquality from "../utils/mongo.id.equality.js";

const router = express.Router();

//? list all product
//different list for the buyer and seller

router.get("/list", isUser, async (req, res) => {
  const productDetails = await Product.find();
  return res.status(200).send({ message: "list", productDetails });
});

//? add a product
// only the seller can add the product

router.post(
  "/add",
  isSeller,
  validateReqBody(addProductValidationSchema),
  async (req, res) => {
    // extract new product from req.body
    const newProduct = req.body;

    newProduct.sellerId = req.loggedInUserId;

    // save product
    await Product.create(newProduct);

    // send res
    return res.status(201).send({ message: "Product added successfully." });
  }
);

//? delete and edit
// the seller who is also the owner can do this
// id here is the product id
router.delete(
  "/delete/:id",
  isSeller,
  validateMongoIdFromParams,
  async (req, res) => {
    // extract product id from req.params
    const productId = req.params.id;

    // find using productId
    const product = await Product.findById(productId);

    // if not product, throw error
    if (!product) {
      return res.status(404).send({ message: "Product does not exist" });
    }

    // check if loggedIn is owner of the product

    const isProductOwner = checkMongoIdsEquality(
      product.sellerId,
      req.loggedInUserId
    );

    // if not owner, throw error
    if (!isProductOwner) {
      return res
        .status(403)
        .send({ message: "You are not the owner of the product" });
    }

    //delete product
    await Product.findByIdAndDelete(productId);

    //send res
    return res.status(200).send({ message: "Deleted" });
  }
);

//? edit product
router.put(
  "/edit/:id",
  isSeller,
  validateMongoIdFromParams,
  validateReqBody(addProductValidationSchema),
  async (req, res) => {
    // extract product id from req.params
    const productId = req.params.id;

    // find using productId
    const product = await Product.findById(productId);

    // if not product, throw error
    if (!product) {
      return res.status(404).send({ message: "Product does not exist" });
    }

    // check if loggedIn is owner of the product

    const isProductOwner = checkMongoIdsEquality(
      product.sellerId,
      req.loggedInUserId
    );

    // if not owner, throw error
    if (!isProductOwner) {
      return res
        .status(403)
        .send({ message: "You are not the owner of the product" });
    }

    //edit product
    const newProduct = req.body;
    await Product.updateOne({ _id: productId }, { $set: { ...newProduct } });

    //send res
    return res.status(200).send({ message: "Edited successfully" });
  }
);

//? get product details
router.get(
  "/detail/:id",
  isUser,
  validateMongoIdFromParams,
  async (req, res) => {
    // extract product id from the req params
    const productId = req.params.id;

    // find product using product id
    const product = await Product.findById(productId);

    // if not product throw error
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    //send res
    return res.status(200).send({ message: "product detail", product });
  }
);

//? list product by seller

router.post(
  "/seller/list",
  isSeller,
  validateReqBody(paginationData),
  async (req, res) => {
    //extract pagination data
    const { page, limit, searchText } = req.body;

    //calculate skip

    const skip = (page - 1) * limit;

    //condition

    let match = { sellerId: req.loggedInUserId };

    if (searchText) {
      match.name = { $regex: searchText, $options: "i" };
    }
    console.log(match);

    const products = await Product.aggregate([
      { $match: match },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          name: 1,
          price: 1,
          brand: 1,
          image: 1,
          description: { $substr: ["$description", 0, 200] }, //to limit the data being displayed
        },
      },
    ]);
    return res.status(200).send({ message: "Seller list", products });
  }
);

//? list product by buyer
router.post(
  "/buyer/list",
  isBuyer,
  validateReqBody(paginationData),
  async (req, res) => {
    const { page, limit } = req.body;

    const skip = (page - 1) * limit;

    const product = await Product.aggregate([
      { $match: {} },
      { $skip: skip },
      { $limit: limit },
      { $project: { name: 1, brand: 1, price: 1, freeShipping: 1 } },
    ]);
    return res.status(200).send({ Message: "List", product });
  }
);

export default router;
