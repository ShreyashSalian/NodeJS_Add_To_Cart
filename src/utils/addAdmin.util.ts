import { User } from "../models/user.model";
import { adminUserList } from "./adminUserList";

export const addUserAdmin = async (): Promise<void> => {
  try {
    for (const user of adminUserList) {
      const userExist = await User.findOne({
        $or: [
          {
            email: user.email,
          },
          {
            contactNumber: user.contactNumber,
          },
        ],
      });
      if (!userExist) {
        const createdUser = await User.create({
          email: user.email,
          fullName: user.fullName,
          password: user.password,
          contactNumber: user.contactNumber,
          role: user.role,
          isEmailVerified: true,
        });
        console.log(`Admin user ${user.fullName} added successfully.`);
        console.log(createdUser._id);
      }
    }
  } catch (err) {
    console.error("Error adding admin users:", err);
  }
};
