import mongoose from "mongoose";
import { addUserAdmin } from "../utils/addAdmin.util";

const connectDB = async (): Promise<void> => {
  try {
    const DB_URL =
      process.env.NODE_ENV === "development"
        ? `${process.env.LOCAL_PATH}/${process.env.DATABASE_NAME}`
        : `${process.env.LIVE_PATH}/${process.env.DATABASE_NAME}`;
    const connection = await mongoose.connect(DB_URL);
    console.log(`Connected to database : ${connection.connection.host}`);

    //Add the admin user
    addUserAdmin();
  } catch (error: any) {
    console.log(`Can not connect to mongodb`, error);
    process.exit(1);
  }
};
export default connectDB;
