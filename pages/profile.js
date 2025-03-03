import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot, doc, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import ModifyProduct from "../components/ModifyProduct"; // Edit modal component

export default function Profile() {
  
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [sellerAccountId, setSellerAccountId] = useState(null); // Store Stripe account ID
  const [isSeller, setIsSeller] = useState(false); // Check if the user is a seller

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        fetchUserListings(user.uid);
        fetchSellerAccountId(user.uid); // Fetch Stripe account ID
        checkSellerStatus(user.uid); // Check if user is a seller
      } else {
        setUser(null);
        setSellerAccountId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserListings = async (userId) => {
    const q = query(collection(db, "products"), where("userId", "==", userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(userProducts);
    });

    return () => unsubscribe();
  };

  // Fetch the seller's Stripe Account ID from Firestore
  const fetchSellerAccountId = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.stripeAccountId) {
          setSellerAccountId(data.stripeAccountId);
        } else {
          setSellerAccountId(null);
        }
      }
    } catch (error) {
      console.error("Error fetching Stripe account ID:", error);
    }
  };

  // Check if the user is a seller (seller field as a string)
  const checkSellerStatus = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setIsSeller(data.seller === "true"); // Check seller status as a string
      }
    } catch (error) {
      console.error("Error checking seller status:", error);
    }
  };

  // Onboard the user with Stripe
  const onboardSeller = async () => {
    try {
      const response = await fetch("/api/create-onboarding-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }), // Send userId
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe onboarding
      } else {
        console.error("Error fetching onboarding link", data.error);
      }
    } catch (error) {
      console.error("Onboarding error:", error);
    }
  };

  // Update Firestore after Stripe onboarding to set seller to "true"
  const updateSellerStatus = async () => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { seller: "true" }, { merge: true }); // Set seller as a string "true"
      setIsSeller(true); // Update local state to reflect seller status
    } catch (error) {
      console.error("Error updating seller status:", error);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold">Your Profile</h1>
      {user ? (
        <div>
          <h2 className="text-xl mt-4">Welcome, {user.displayName || "User"}</h2>
          <p className="text-sm text-gray-600">Email: {user.email}</p>
        </div>
      ) : (
        <p className="text-sm text-red-500">Please log in to view your profile.</p>
      )}
  
      {/* If the user is not a seller, show the onboarding button */}
      {!isSeller ? (
        <div className="mt-4">
          <p className="text-sm text-red-500">You need to onboard with Stripe to become a seller.</p>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={onboardSeller}
          >
            Onboard with Stripe
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-green-500">You're now a seller! You can list products.</p>
        </div>
      )}
  
      <h2 className="text-2xl font-bold mt-8">Your Listings</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="bg-white p-4 rounded-lg shadow-md">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-40 object-cover rounded"
              />
              <h2 className="text-black font-bold">{product.title}</h2>
              <p className="text-black">${product.price}</p>
              <p className="text-sm text-black">{product.description}</p>
              <button
                onClick={() => handleEdit(product)}
                className="bg-blue-500 text-white p-2 mt-2 rounded"
                disabled={loading}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(product)}
                className="bg-red-500 text-white p-2 mt-2 rounded ml-2"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">You haven't listed any products yet.</p>
        )}
      </div>
  
      {editingProduct && (
        <ModifyProduct
          product={editingProduct}
          onClose={closeEditModal}
          onProductUpdated={(updatedProduct) => {
            setProducts((prevProducts) =>
              prevProducts.map((prod) =>
                prod.id === updatedProduct.id ? updatedProduct : prod
              )
            );
            closeEditModal();
          }}
        />
      )}
    </div>
  );
}
