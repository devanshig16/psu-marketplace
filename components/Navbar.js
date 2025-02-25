import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import Link from "next/link";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState(null); // Set to null initially
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().name);
          } else {
            setUserName("User"); // Fallback if no name found
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserName("User");
        }
      } else {
        setUserName(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // DOUBT- DOESNT SHOW NAME ONLY WELCOME USER

  return (
    <nav className="bg-primary text-white p-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">PSU Marketplace</Link>
      {user ? (
        <div className="flex gap-4">
          <Link href="/">Home</Link>
          <Link href="/sell">Sell</Link>
          <Link href="/profile">Profile</Link>
          <span className="mr-4">Welcome, {userName ?? "Loading..."}</span>
          <button
            onClick={() => {
              signOut(auth);
              router.push("/");
            }}
            className="bg-red-500 text-white px-3 py-1 rounded-md"
          >
            Logout
          </button>
        </div>
      ) : null }
    </nav>
  );
};

export default Navbar;
