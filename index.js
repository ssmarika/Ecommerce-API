import express from "express";
import connectDB from "./database-connection/db.connect.js";
import UserRoutes from "./user/user.controller.js";

const app = express();

// to make app understand json
app.use(express.json());

//connect db
await connectDB();

//register routes
app.use("/user", UserRoutes);

// enable CORS

// handle global error

// port and connection
const PORT = process.env.PORT;
// env factor from .env file
// .env stores private data

app.listen(PORT, () => {
  console.log(`App is listening to ${PORT}`);
});
