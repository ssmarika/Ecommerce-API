import express from "express";
import connectDB from "./database-connection/db.connect.js";
import UserRoutes from "./user/user.controller.js";
import ProductRoutes from "./product/product.controller.js";
import CartRoutes from "./cart/cart.controller.js";
import cors from "cors";

const app = express();

//cross origin resource sharing
// to allow request from frontend
app.use(
  cors({
    origin: "*", //allow request from all domain
  })
);
// to make app understand json
app.use(express.json());

//connect db
await connectDB();

//register routes
app.use("/user", UserRoutes);
app.use("/product", ProductRoutes);
app.use("/cart", CartRoutes);

// enable CORS

// handle global error

// port and connection
const PORT = process.env.PORT;
// env factor from .env file
// .env stores private data

app.listen(PORT, () => {
  console.log(`App is listening to ${PORT}`);
});
