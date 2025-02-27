import { useState } from "react";
import { auth, provider, signInWithPopup, signOut } from "/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  if (storedUser) {
    setUser(storedUser);
  }
}, []);

const handleGoogleSignIn = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    console.error("Google Sign-In Error:", error);
  }
};

const handleSignOut = () => {
  signOut(auth)
    .then(() => {
      setUser(null);
      localStorage.removeItem("user");
    })
    .catch((error) => console.error("Sign Out Error:", error));
};
export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      alert("Success!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-primary">{isLogin ? "Login" : "Sign Up"}</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="mt-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded-md mt-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded-md mt-2"
          required
        />
        <button type="submit" className="w-full bg-primary text-white p-2 mt-4 rounded-md">
          {isLogin ? "Login" : "Sign Up"}
        </button>
      </form>
      <p className="text-center mt-4">
        {isLogin ? "Don't have an account?" : "Already have an account?"}
        <span onClick={() => setIsLogin(!isLogin)} className="text-secondary cursor-pointer ml-2">
          {isLogin ? "Sign Up" : "Login"}
        </span>
      </p>
    {!user ? (
      <button
        onClick={handleGoogleSignIn}
        className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600"
      >
        Sign in with Google
      </button>
    ) : (
      <div className="text-center">
        <h2 className="text-xl">Welcome, {user.displayName}</h2>
        <img
          src={user.photoURL}
          alt="Profile"
          className="rounded-full w-24 h-24 mx-auto my-4"
        />
        <button
          onClick={handleSignOut}
          className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900"
        >
          Sign Out
        </button>
      </div>
    )}
    </div>
  );
}
