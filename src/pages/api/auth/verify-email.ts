import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { readData, updateData } from "@/components/FirebaseQueries/FirebaseConnect";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ message: "Invalid token" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { email: string };
    const { email } = decoded;
    console.log("Decoded email:", email);

    // Update the user's emailVerified status in the database
    /*const result = await executeQuery(
      "UPDATE userInfo SET emailVerified = ? WHERE email = ?",
      [new Date().toISOString().slice(0, 19).replace('T', ' '), email]
    );*/
    const temp = await readData({email:email});
    const userid = temp[0].id;
    console.log(userid);
    const result = updateData(userid,[
      'emailVerified'],[new Date().toISOString().slice(0, 19).replace('T', ' ')]);
    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }
    /*const result2 = await executeQuery(
        "Select userId from userInfo WHERE email = ?",
        [email]
      );*/
      const result2 = await readData({email:email})
        if (result2.length < 0) {
            return res.status(400).json({ message: "Something went wrong, try again later or contact the website admin!" });
        }
        return res.redirect(302, `https://wikitime-frontend.vercel.app/`);

  } catch (error) {
    console.error("Verification error:", error);
    return res.status(400).json({ message: "Invalid or expired token" });
  }
}