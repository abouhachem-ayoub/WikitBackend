import { NextApiRequest, NextApiResponse } from "next";
import executeQuery from "@/components/MysqlConnect/MysqlConnect";
import jwt from "jsonwebtoken";
import cors, { runMiddleware } from '@/../utils/cors';
import { updateData } from "@/components/FirebaseQueries/FirebaseConnect";
const key = Buffer.from("MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=", "base64");
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors);
  if (req.method !== "POST") {
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
  const {phone,firstName,lastName,pseudo,userid} = req.body;
   console.log(phone,firstName,lastName,pseudo,userid);
  if (!pseudo || !firstName || !lastName) {
    return res.status(400).json({ message: "The fields are required" });
  }
  try {
    /*const result = await executeQuery(
      "update userInfo set firstName=?, lastName=? ,pseudo=?, phoneNumber=? where userId = ?",
      [firstName,lastName,pseudo,phone,userid]
    );*/
    const result = await updateData(userid,[
      'firstName',
      'lastName',
      'pseudo',
      'phone'
    ],[firstName,lastName,pseudo,phone]);
    if(!result){
            return res.status(400).json({ message: "Something went wrong!"});
    }
            return res.status(200).json({ message: "Data was updated successfully!" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}