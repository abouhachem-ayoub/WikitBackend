import { NextApiRequest, NextApiResponse } from "next";
import cors, { runMiddleware } from '@/../utils/cors';
import { readData } from "@/components/FirebaseQueries/FirebaseConnect";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors);
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.body;
  if (!email) {
    console.log('no pseudo found')
    return res.status(400).json({ message: "pseudo not found" });
  }
  try {
    //const result = await executeQuery('SELECT * FROM userInfo WHERE email = ?', [email]);
    const result = await readData({email:email})
    if (result.length ===0){
        return res.status(200).json({ message: "available",exists:false})
    }
    else {
        return res.status(200).json({ message: "not available",exists:true})
    }
    }
   catch (error) {
    console.error("something went wrong:", error);
    return res.status(401).json({ message: "Could not reach the database" });
  }
}