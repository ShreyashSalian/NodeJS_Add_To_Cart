import express from "express";
import { verifyUser } from "../middlewares/auth.middleware";
import {
  addOrUpdateRating,
  deleteRating,
} from "../controllers/rating.controller";
const ratingRoutes = express.Router();

//Add or update rating
ratingRoutes.post("/add-or-update-rating", verifyUser, addOrUpdateRating);

//Delete the rating
ratingRoutes.post("/delete-rating", verifyUser, deleteRating);

export default ratingRoutes;
