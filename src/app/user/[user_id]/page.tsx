'use client';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ProfilePage = ({ params }: { params: { user_id: string } }) => {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; emailVerified: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
        const token = localStorage.getItem("token"); // Retrieve the token from localStorage
        if (!token) {
            // Redirect to login if no token is found
            router.push("/login");
            return;
          }
      try {
        const response = await fetch(`/api/user/${params.user_id}`, {
            headers: {
              Authorization: `Bearer ${token}`, // Send the token in the Authorization header
            },
          });        if (!response.ok) {
          if (response.status === 404) {
            setError("User not found");
          } else {
            throw new Error("Failed to fetch user data");
          }
          return;
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error(error);
        setError("An error occurred while fetching user data");
      }
    };

    fetchUserData();
  }, [params.user_id]);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="min-w-md max-w-lg mx-auto bg-white shadow-md rounded px-8 py-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome, {user.email}!</h2>
      {user.emailVerified ? (
        <p>Your email is verified. You can now access all features.</p>
      ) : (
        <p className="text-yellow-500">
          Your email is not verified. Please check your inbox to verify your email and unlock all
          features.
          <br />
          <a
            href="/api/auth/verify-email"
            className="text-blue-500 hover:underline"
            onClick={(e) => {
              e.preventDefault();
              // Logic to resend verification email
              fetch("/api/auth/send_verification_email", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ email: user.email,userid: params.user_id }),
              })
                .then((res) => {
                  if (res.ok) {
                    alert("Verification email resent. Please check your inbox.");
                  } else {
                    alert("Failed to resend verification email.");
                  }
                })
                .catch((err) => console.error(err));
            }}
       >Click here to send verification e-mail</a>
       </p>
    
      )}
      </div>
  );
}
      

export default ProfilePage;