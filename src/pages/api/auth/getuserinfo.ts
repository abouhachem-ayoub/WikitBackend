import { NextApiRequest, NextApiResponse } from "next";
import { readData } from "@/components/FirebaseQueries/FirebaseConnect"; // Adjust the path to your database query functions
import cors, { runMiddleware } from '@/../utils/cors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await runMiddleware(req, res, cors);
    if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Fetch user data from the database
    const result = await readData({ id: userId });

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract user information
    const user = result[0];
    const userInfo = {
      firstName: user.firstName,
      lastName: user.lastName,
      pseudo: user.pseudo,
      password: user.password, // Ensure this is handled securely
      phone: user.phone,
      email: user.email,
      emailVerified: user.emailVerified || null, // Handle optional field
      id: user.id, // Include user ID if needed
    };

    return res.status(200).json({ user: userInfo });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}