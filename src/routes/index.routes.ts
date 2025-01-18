import express from "express";
import userRoutes from "./user.routes";
import authRoutes from "./auth.routes";

const indexRoutes = express.Router();
indexRoutes.use("/api/v1/users", userRoutes);
indexRoutes.use("/api/v1/auth", authRoutes);

indexRoutes.get(
  "/api/v1",
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(200).json({ message: "Ther server is running properly." });
  }
);
export default indexRoutes;