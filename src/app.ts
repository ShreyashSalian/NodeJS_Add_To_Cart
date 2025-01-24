import express from "express";
import dotnev from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import connectDB from "./database/connect";

import indexRoutes from "./routes/index.routes";
import i18n from "./i18n";
dotnev.config();

const app = express();
const port: string | number = process.env.PORT || 4000;
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: "GET,POST,PUT,DELETE,PATCH,HEAD",
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(path.resolve(), "public")));
app.use("/images", express.static("public/images"));
app.use(cookieParser());
app.use(i18n.init);
// app.use((req, res, next) => {
//   console.log("Locale:", req.getLocale()); // Should log the current locale (e.g., 'en')
//   console.log("res.__ exists:", typeof res.__ === "function"); // Should log `true`
//   next();
// });

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`The app is running at : http://localhost:${port}`);
    });
  })
  .catch(() => {
    console.log("Error while connecting to the database");
  });

app.use(indexRoutes);
