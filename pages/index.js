import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Welcome() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        router.push("/home"); // Redirect to Home if logged in
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div
    className="flex flex-col items-center justify-center h-screen bg-cover bg-center"
    //style={{ backgroundImage: "url('/old main.png')" }}
    >
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-black">Buy, Sell, and Connect with PSU Students!</h1>
        <p className="mt-2 text-black">A safe marketplace exclusively for Penn State students.</p>

        {/* Login and Signup Buttons (removed from Navbar) */}
        <div className="mt-6 space-x-4">
          <Link href="/auth/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Login
          </Link>
          <Link href="/auth/signup" className="bg-green-500 text-white px-4 py-2 rounded-lg">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
