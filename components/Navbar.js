import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import Link from "next/link";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState(null); // Initially null
  const [loading, setLoading] = useState(true); // Loading state to handle user data fetch
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setUserName(userDoc.data().name); // Set name from Firestore
          } else {
            setUserName("User"); // Fallback name if not found
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserName("User"); // Fallback in case of error
        } finally {
          setLoading(false); // Stop loading after fetching user data
        }
      } else {
        setUserName(null); // Reset name if no user is logged in
        setLoading(false); // Stop loading when there's no user
      }
    });

    return () => unsubscribe(); // Cleanup the auth state listener
  }, []);

  return (
    <nav className="bg-primary text-white p-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">PSU Marketplace</Link>
      
      {user ? (
        <div className="flex gap-4">
          <Link href="/">Home</Link>
          <Link href="/sell">Sell</Link>
          <Link href="/profile">Profile</Link>
          <Link href="/cart">Cart</Link>
          
          <span className="mr-4">
            {loading ? "Loading..." : `Welcome, ${userName || "User"}`}
          </span>
          
          <button
            onClick={() => {
              signOut(auth);
              router.push("/"); // Redirect after logout
            }}
            className="bg-red-500 text-white px-3 py-1 rounded-md"
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
    </nav>
  );
};

export default Navbar;
