import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function FirebaseRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const { mode, oobCode, continueUrl } = router.query;

    // If we have Firebase parameters, redirect to our API handler
    if (mode === 'verifyEmail' && oobCode && continueUrl) {
      const apiUrl = `/api/firebase-handler?mode=${mode}&oobCode=${oobCode}&continueUrl=${encodeURIComponent(continueUrl as string)}`;
      window.location.href = apiUrl;
    }
  }, [router.query]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Processing email verification...</h2>
      <p>Please wait while we verify your email.</p>
    </div>
  );
}