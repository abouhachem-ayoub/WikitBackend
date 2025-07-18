// In your backend root handler or create pages/index.tsx
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { mode, oobCode, continueUrl } = req.query;

  if (mode === 'verifyEmail' && oobCode && continueUrl) {
    // Extract email from continueUrl
    const url = new URL(continueUrl as string);
    const email = url.searchParams.get('email');
    
    // Redirect to your verify-email API with the parameters
    return res.redirect(302, `/api/auth/verify-email?oobCode=${oobCode}&email=${email}`);
  }

  // Default response
  res.status(200).json({ message: 'Firebase action handler' });
}