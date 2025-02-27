import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider, db } from "../../firebase"; // Ensure the correct import path for db
import { setDoc, doc } from "firebase/firestore"; // Add this import for Firestore functions
import { useRouter } from "next/router";

const SignUp = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setLoading(true); // Prevent multiple clicks

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user already exists in Firestore
      // Assuming that "users" collection exists in Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
      }, { merge: true });

      router.push("/"); // Redirect after successful Google sign-up
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-200">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-black">Sign Up</h2>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`w-full px-6 py-2 rounded-lg mt-4 ${loading ? "bg-gray-400" : "bg-red-500 text-white"}`}
        >
          {loading ? "Signing up..." : "Sign up with Google"}
        </button>

        <p className="mt-3 text-center text-sm text-black">
          Already have an account? <a href="/auth/login" className="text-blue-600">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
