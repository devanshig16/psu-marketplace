import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
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
        setIsSeller(false); // Reset seller status on logout
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

  

  // This function will be called when the user returns from Stripe after completing onboarding
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("userId");

    if (userId) {
      // Send a request to update the user's seller status
      fetch(`/api/update-seller-status?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.message) {
            setIsSeller(true);
          }
        })
        .catch((error) => {
          console.error("Error updating seller status:", error);
        });
    }
  }, []);

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const closeEditModal = () => {
    setEditingProduct(null);
  };

  const handleDelete = async (product) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "products", product.id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
    setLoading(false);
  };

  const stripeOauthUrl = `https://connect.stripe.com/oauth/authorize?redirect_uri=https://connect.stripe.com/hosted/oauth&client_id=ca_Rqvf9sjrcNvQTcd0RwQr1oWKllwPhKzh&state=onbrd_RsXAA64TQLFpKcMy28zwo01CQp&response_type=code&scope=read_write&stripe_user[country]=US`;

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

      {isSeller ? (
        <div className="mt-4 text-green-800">
          <p>You are a verified seller! You can now list products.</p>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-red-500">No Stripe account linked.</p>
          <a
            href={stripeOauthUrl} // Directly use the hardcoded Stripe OAuth URL
            className="text-blue-500 underline mt-2 block"
          >
            Become a Seller (Connect to Stripe)
          </a>
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
