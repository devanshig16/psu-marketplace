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
        if (!currentUser.email.endsWith("@psu.edu")) {
          setAlertMessage("Only PSU students with @psu.edu emails can access this site.");
          setTimeout(() => setAlertMessage(""), 10000); // Hide alert after 10 seconds
          await signOut(auth);
          setUser(null);
          setUserName(null);
          router.push("/auth/login"); // Redirect to login
          return;
        }

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

  return (
    <nav className="text-white bg-blue-900 p-4 flex justify-between items-center relative">
      <Link href="/" className="text-xl font-bold">PSU Marketplace</Link>

      {loading ? (
        <span>Loading...</span>
      ) : user ? (
        <div className="flex gap-4">
          <Link href="/">Home</Link>
          <Link href="/sell">Sell</Link>
          <Link href="/profile">Profile</Link>
          <Link href="/cart">Cart</Link>

          <span className="mr-4">Welcome, {userName || "User"}</span>

          <button
            onClick={async () => {
              if (window.confirm("Are you sure you want to log out?")) {
                await signOut(auth);
                setUser(null);
                setUserName(null);
                router.push("/auth/login");
              }
            }}
            className="bg-blue-200 text-black px-3 py-1 rounded-md"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex gap-4">
          <Link href="/auth/login">Login</Link>
          <Link href="/auth/signup">Sign Up</Link>
        </div>
      )}

      {/* Alert Message (Fades after 10 seconds) */}
      {alertMessage && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-md transition-opacity duration-1000 fade-out">
          {alertMessage}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
