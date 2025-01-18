interface AdminUser {
  fullName: string;
  email: string;
  password: string;
  role: string;
  contactNumber: string;
}

//Admin list----------------
export const adminUserList: AdminUser[] = [
  {
    fullName: "ShreyashSalian",
    email: "admin@gmail.com",
    password: "Admin@123",
    role: "admin",
    contactNumber: "1234567890",
  },
  {
    fullName: "Admin Admin",
    email: "admin123@gmail.com",
    password: "Admin@123",
    role: "admin",
    contactNumber: "987654321",
  },
];
