import express from 'express';
import { isBuyer } from '../middleware/authentication.middleware.js';
import validateReqBody from '../middleware/validate.req.body.js';
import { addCartItemValidationSchema } from './cart.validation.js';
import checkMongoIdValidity from '../utils/mongoid.validity.js';
import Product from '../product/product.model.js';
import Cart from './cart.model.js';
import validateMongoIdFromParams from '../middleware/validate.mongoid.js';
import { paginationData } from '../product/product.validation.js';

const router = express.Router();

//? add item to cart
router.post(
  '/add/item',
  isBuyer,
  validateReqBody(addCartItemValidationSchema),
  (req, res, next) => {
    //validate product id from req.body
    const { productId } = req.body;

    // check mongo
    const isValidObjectId = checkMongoIdValidity(productId);

    //throw error
    if (!isValidObjectId) {
      return res.status(401).send({ message: 'Invalid mongoId' });
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
      return res.status(404).send({ message: 'Product not found' });
    }

    //check if quantity does not exceed product quantity
    if (orderQuantity > product.quantity) {
      return res.status(403).send({ message: 'Product is outnumbered' });
    }

    // if order quantity exceed throw error

    // add to cart

    Cart.create({
      buyerId: req.loggedInUserId,
      productId,
      orderQuantity,
    });

    //send res

    return res.status(201).send({ message: 'Added to cart successfully' });
  }
);

//? list cart item

// router.post(
//   '/list',
//   isBuyer,
//   validateReqBody(paginationData),
//   async (req, res) => {
//     //extract pagination data
//     const { page, limit, searchText } = req.body;

//     //calculate skip

//     const skip = (page - 1) * limit;

//     //condition

//     let match = { buyerId: req.loggedInUserId };

//     if (searchText) {
//       match.name = { $regex: searchText, $options: 'i' };
//     }
//     console.log(match);

//     const cartList = await Cart.aggregate([
//       { $match: match },
//       { $skip: skip },
//       { $limit: limit },
//       {
//         $project: {
//           name: 1,
//           price: 1,
//           brand: 1,
//           image: 1,
//           description: { $substr: ['$description', 0, 200] }, //to limit the data being displayed
//         },
//       },
//     ]);
//     return res.status(200).send({ message: 'Cart list', cartList });
//   }
// );
router.post(
  '/list',
  isBuyer,
  validateReqBody(paginationData),
  async (req, res) => {
    // extract pagination data
    const { page, limit, searchText } = req.body;

    // calculate skip
    const skip = (page - 1) * limit;

    // condition
    let match = { buyerId: req.loggedInUserId };

    if (searchText) {
      match.name = { $regex: searchText, $options: 'i' };
    }
    console.log(match);

    const cartList = await Cart.aggregate([
      { $match: match },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'products', // collection name in the database
          localField: 'productId', // field from the Cart collection
          foreignField: '_id', // field from the Product collection
          as: 'productDetails', // alias for the results
        },
      },
      {
        $unwind: '$productDetails', // to deconstruct the array
      },
      {
        $project: {
          name: '$productDetails.name',
          price: '$productDetails.price',
          brand: '$productDetails.brand',
          category: '$productDetails.category',
          freeShipping: '$productDetails.freeShipping',
          description: { $substr: ['$productDetails.description', 0, 200] }, // to limit the data being displayed
        },
      },
    ]);

    return res.status(200).send({ message: 'Cart list', cartList });
  }
);

// ? flush cart/ remove all items from cart
router.delete('/flush', isBuyer, async (req, res) => {
  //extract buyerId from req.loggedInUserId
  const buyerId = req.loggedInUserId;

  // remove all items from cart for that buyer
  await Cart.deleteMany({ buyerId });

  //send res
  return res.status(200).send({ message: 'Cart cleared' });
});

//? remove single item from cart
router.delete(
  '/item/delete/:id', //id has cartId
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
      return res.status(403).send({ message: 'You are not the owner' });
    }
    // delete cart
    await Cart.deleteOne({ _id: cartId, buyerId: req.loggedInUserId });
  }
);

export default router;
