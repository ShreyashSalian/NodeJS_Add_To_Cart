import express from "express";
import dotenv from "dotenv";
dotenv.config();
import userRoutes from "./user.routes";
import authRoutes from "./auth.routes";
import categoryRoutes from "./category.routes";
import productRoutes from "./product.routes";
import cartRoutes from "./cart.routes";
import customerAddressRoutes from "./customerAddress.routes";
import orderRoutes from "./order.Routes";
import paymentRoutes from "./payment.routes";
import ratingRoutes from "./rating.routes";

const indexRoutes = express.Router();
indexRoutes.use("/api/v1/users", userRoutes);
indexRoutes.use("/api/v1/auth", authRoutes);
indexRoutes.use("/api/v1/categories", categoryRoutes);
indexRoutes.use("/api/v1/products", productRoutes);
indexRoutes.use("/api/v1/carts", cartRoutes);
indexRoutes.use("/api/v1/customer-address", customerAddressRoutes);
indexRoutes.use("/api/v1/orders", orderRoutes);
indexRoutes.use("/api/v1/payments", paymentRoutes);
indexRoutes.use("/api/v1/rating", ratingRoutes);
// indexRoutes.rend("/api/v1/payment",(req: express.Request, res: express.Response) =>{
//   publishableKey: process.env.STRIPE_SECRET,
// });
indexRoutes.get(
  "/api/v1/paymentData",
  (req: express.Request, res: express.Response) => {
    res.render("payment", {
      publishableKey: process.env.STRIPE_SECRET,
    });
  }
);

indexRoutes.get(
  "/api/v1",
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(200).json({ message: "Ther server is running properly." });
  }
);
export default indexRoutes;
