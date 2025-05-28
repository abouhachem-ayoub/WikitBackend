'use server';
import { NextApiRequest, NextApiResponse } from "next";
import executeQuery from "@/components/MysqlConnect/MysqlConnect";
import { parse } from "path";
import jwt from "jsonwebtoken";
import cors, { runMiddleware } from '@/../utils/cors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors);
  const { user_id } = req.query;
  console.log("User ID from query:", user_id);
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  console.log("Token from header:", token);

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
      console.log("Decoded token:", decoded);
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
   
    const userId = parseInt(user_id as string, 10); // Convert to a number if needed
        if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
        }
    const result = await executeQuery(
      "SELECT email, emailVerified, firstName, lastName, pseudo,password,phoneNumber FROM userInfo WHERE userId = ?",
        [userId]
    );
    console.log("Query result:", result);
    console.log(user_id);

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}