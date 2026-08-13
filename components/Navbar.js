import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import Link from "next/link";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState(""); // State for alert message
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Ensure the email ends with "@psu.edu"
        /*
        if (!currentUser.email.endsWith("@psu.edu")) {
          setAlertMessage("Only PSU students with @psu.edu emails can access this site.");
          setTimeout(() => setAlertMessage(""), 800); 
          await signOut(auth);
          setUser(null);
          setUserName(null);
          router.push("/auth/login"); // Redirect to login
          return;
        }*/

        try {
          // Fetch user data from Firestore
          const userRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            setUser(currentUser);
            setUserName(userDoc.data().name);
          } else {
            setAlertMessage("User not found in the system. Please sign up first.");
            setTimeout(() => setAlertMessage(""), 10000); // Hide alert after 10 seconds
            await signOut(auth);
            setUser(null);
            setUserName(null);
            router.push("/auth/signup");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
          setUserName(null);
        }
      } else {
        setUser(null);
        setUserName(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const linkClass = "text-sm font-medium text-blue-100 transition-colors hover:text-white";

  return (
    <nav className="relative flex items-center justify-between bg-blue-950 px-6 py-3 shadow-sm">
      <Link href="/" className="text-lg font-bold tracking-tight text-white">
        PSU Marketplace
      </Link>

      {loading ? (
        <span className="text-sm text-blue-200">Loading…</span>
      ) : user ? (
        <div className="flex items-center gap-5">
          <Link href="/" className={linkClass}>Home</Link>
          <Link href="/sell" className={linkClass}>Sell</Link>
          <Link href="/profile" className={linkClass}>Profile</Link>
          <Link href="/cart" className={linkClass}>Cart</Link>

          <span className="hidden text-sm text-blue-200 sm:inline">
            Welcome, {userName || "User"}
          </span>

          <button
            onClick={async () => {
              if (window.confirm("Are you sure you want to log out?")) {
                await signOut(auth);
                setUser(null);
                setUserName(null);
                router.push("/auth/login");
              }
            }}
            className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-5">
          <Link href="/auth/login" className={linkClass}>Login</Link>
          <Link href="/auth/signup" className={linkClass}>Sign Up</Link>
        </div>
      )}

      {/* Alert Message (Fades after 10 seconds) */}
      {alertMessage && (
        <div className="absolute left-1/2 top-16 -translate-x-1/2 rounded-md bg-red-600 px-4 py-2 text-white shadow-lg transition-opacity duration-1000 fade-out">
          {alertMessage}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
