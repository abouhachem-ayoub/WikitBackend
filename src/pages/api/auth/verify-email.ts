import { NextApiRequest, NextApiResponse } from "next";
import { readData, updateData } from "@/components/FirebaseQueries/FirebaseConnect";
import { getAuth } from 'firebase-admin/auth';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { oobCode } = req.query;

  if (!oobCode || typeof oobCode !== "string") {
    return res.status(400).json({ message: "Invalid token" });
  }

  try {
    const auth = getAuth();
    const { oobCode, email } = req.query;

    if (!email || typeof email !== "string" || !oobCode || typeof oobCode !== "string") {
      // If email is not provided, you may need to look it up another way.
      return res.status(400).json({ message: "Email is required" });
    }

    // Get the user by email and set emailVerified to true
    const userRecord = await auth.getUserByEmail(email);
    await auth.updateUser(userRecord.uid, { emailVerified: true });

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
        return res.redirect(302,process.env.FRONT_END + `?emailVerified=true&userId=${result2[0].id}&action=verifyEmail`);

  } catch (error) {
    console.error("Verification error:", error);
    return res.status(400).json({ message: "Invalid or expired token" });
  }
}