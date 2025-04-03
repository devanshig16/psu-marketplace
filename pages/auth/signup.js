import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider, db } from "../../firebase"; // Ensure correct import path for db
import { setDoc, doc, getDoc } from "firebase/firestore"; // Import necessary Firestore functions
import { useRouter } from "next/router";

const SignUp = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setLoading(true);
  
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      // Ensure the email ends with "@psu.edu"
      //if (!user.email.endsWith("@psu.edu")) {
        //setLoading(false);
        //return;
      //}
  

      // Firestore check
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
  
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          seller: "false",
        });
        console.log("User successfully created in Firestore.");
      } else {
        console.log("User already exists in Firestore.");
      }
  
      router.push("/");
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
        <h2 className="text-2xl font-bold text-center text-black">Sign Up</h2>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`w-full px-6 py-2 rounded-lg mt-4 ${loading ? "bg-gray-400" : "bg-blue-800 text-white"}`}
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
