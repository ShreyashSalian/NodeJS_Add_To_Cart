import mongoose from "mongoose";
import { addUserAdmin } from "../utils/addAdmin.util";

const connectDB = async (): Promise<void> => {
  try {
    // process.env.NODE_ENV === "development"
    //   ? `${process.env.LOCAL_PATH}/${process.env.DATABASE_NAME}`
    //   : `${process.env.LIVE_PATH}/${process.env.DATABASE_NAME}`;
    // `mongodb://mongodb-container:27017/${process.env.DATABASE_NAME}`// for docker we need to include the container name

    const connection = await mongoose.connect(
      // `${process.env.LOCAL_PATH}/${process.env.DATABASE_NAME}`
      "mongodb://mongodb-container:27017/${process.env.DATABASE_NAME"
    );
    console.log(`Connected to database : ${connection.connection.host}`);

    //Add the admin user
    addUserAdmin();
  } catch (error: any) {
    console.log(`Can not connect to mongodb`, error);
    process.exit(1);
  }
};
export default connectDB;
