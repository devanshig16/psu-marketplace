import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Welcome() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && router.pathname === "/") {
        router.push("/home");
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div
      className="relative flex h-screen flex-col items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/steve-wrzeszczynski-e-owFOTArBc-unsplash.jpg')" }}
    >
      <div className="absolute inset-0 bg-blue-950/40" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative rounded-2xl bg-white/95 p-10 text-center shadow-xl backdrop-blur"
      >
        <h1 className="text-3xl font-bold text-gray-900">Buy, Sell, and Connect with PSU Students!</h1>
        <p className="mt-2 text-gray-600">A safe marketplace exclusively for Penn State students.</p>

        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/auth/login"
            className="rounded-lg bg-blue-950 px-5 py-2 font-medium text-white transition-colors hover:bg-blue-900"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-lg border border-blue-950 px-5 py-2 font-medium text-blue-950 transition-colors hover:bg-blue-50"
          >
            Sign Up
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
