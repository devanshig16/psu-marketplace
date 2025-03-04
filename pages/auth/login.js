import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase"; // Make sure the import path is correct
import { useRouter } from "next/router";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setLoading(true); // Prevent multiple clicks

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

     

      // Redirect to home page after successful login
      router.push("/home");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      setLoading(false);
    }
  };

  return (
    <div
      className="flex justify-center items-center h-screen"
      style={{
        backgroundImage: "url('/images/steve-wrzeszczynski-TW9sIUdrxjA-unsplash.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold text-center text-black">Login</h1>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`w-full px-6 py-2 rounded-lg mt-4 ${loading ? "bg-gray-400" : "bg-blue-800 text-white"}`}
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>

        <p className="mt-3 text-center text-sm text-black">
          Don't have an account? <a href="/auth/signup" className="text-blue-600">Sign up here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
