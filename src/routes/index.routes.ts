import express from "express";
import userRoutes from "./user.routes";
import authRoutes from "./auth.routes";
import categoryRoutes from "./category.routes";
import productRoutes from "./product.routes";
import cartRoutes from "./cart.routes";

const indexRoutes = express.Router();
indexRoutes.use("/api/v1/users", userRoutes);
indexRoutes.use("/api/v1/auth", authRoutes);
indexRoutes.use("/api/v1/categories", categoryRoutes);
indexRoutes.use("/api/v1/products", productRoutes);
indexRoutes.use("/api/v1/carts", cartRoutes);

indexRoutes.get(
  "/api/v1",
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(200).json({ message: "Ther server is running properly." });
  }
);
export default indexRoutes;
