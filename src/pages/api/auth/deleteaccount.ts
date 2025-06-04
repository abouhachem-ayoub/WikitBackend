import { NextApiRequest, NextApiResponse } from "next";
import { deleteAccount } from "@/components/FirebaseQueries/FirebaseConnect";
import jwt from "jsonwebtoken";
const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1]; // Extract the token
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
       if (!secret) {
                   return res.status(401).json({ message: "something went very wrong." });
           }
           const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
           // Access the userId from the decoded token
           const userId = decoded.userId;

    // Call the deleteAccount function
    await deleteAccount(userId);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: error.message || "Failed to delete account" });
  }
}