'use server';
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import cors, { runMiddleware } from '@/../utils/cors';
import { getUser } from "@/components/FirebaseQueries/FirebaseConnect";

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
   
    const userId = user_id?.toString()
    console.log('user id is : ',userId)
    /*const result = await executeQuery(
      "SELECT email, emailVerified, firstName, lastName, pseudo,password,phoneNumber FROM userInfo WHERE userId = ?",
        [userId]
    );*/
    const result = await getUser(userId||'');
    console.log("Query result:", result);
    console.log(user_id);
    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}