import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db } from "../../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useUser } from "/pages/context/UserContext"; // Assuming you're using a UserContext

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const router = useRouter();
  const { id } = router.query; // Get product id from the URL
  const user = useUser(); // Access the current user from context

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (id) {
        try {
          const docRef = doc(db, "products", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProduct(docSnap.data());
          } else {
            console.error("No product found!");
          }
        } catch (error) {
          console.error("Error fetching product details:", error);
        }
      }
    };

    fetchProductDetails();
  }, [id]);

  const BuyProduct = async (product) => {
    if (!user) {
      alert("You need to be logged in to buy this product.");
      return;
    }

    try {
      // Reference to the user's cart in Firestore
      const cartRef = doc(db, "carts", user.uid); // Use the user's UID as the document ID for their cart

      // Fetch the current cart data for the user
      const cartDoc = await getDoc(cartRef);

      // If the cart doesn't exist, create a new one
      if (!cartDoc.exists()) {
        await setDoc(cartRef, {
          userId: user.uid,
          items: [{ ...product, quantity: 1 }],
        });
      } else {
        // If the cart exists, update it by adding the product
        const currentCart = cartDoc.data();
        const updatedItems = [...currentCart.items, { ...product, quantity: 1 }];
        await setDoc(cartRef, {
          userId: user.uid,
          items: updatedItems,
        });
      }

      alert("Added to Cart!");
      router.push("/cart"); // Navigate to the cart page
    } catch (error) {
      console.error("Error adding product to cart:", error);
      alert("Failed to add product to cart.");
    }
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-black">{product.title}</h1>
      <img
        src={product.imageUrl}
        alt={product.title}
        className="w-full h-80 object-cover rounded"
      />
      <p className="text-black mt-4">{product.description}</p>
      <p className="text-black mt-4">Price: ${product.price}</p>
      <p className="text-black mt-4">{product.location}</p>
      <button
        type="button"
        className="w-full bg-black text-white p-2 mt-4 rounded-lg"
        onClick={() => BuyProduct(product)}
      >
        Buy
      </button>
    </div>
  );
};

export default ProductDetail;
