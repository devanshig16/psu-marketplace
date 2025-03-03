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
      const cartRef = doc(db, "carts", user.uid);

      const cartDoc = await getDoc(cartRef);

      if (!cartDoc.exists()) {
        await setDoc(cartRef, {
          userId: user.uid,
          items: [{ ...product, quantity: 1 }],
        });
      } else {
        const currentCart = cartDoc.data();
        const updatedItems = [...currentCart.items, { ...product, quantity: 1 }];
        await setDoc(cartRef, {
          userId: user.uid,
          items: updatedItems,
        });
      }

      alert("Added to Cart!");
      router.push("/cart");
    } catch (error) {
      console.error("Error adding product to cart:", error);
      alert("Failed to add product to cart.");
    }
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">
        <div className="lg:flex items-center p-6">
          {/* Left: Image Section */}
          <div className="lg:w-1/2">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover rounded-lg shadow-lg transform transition duration-500 hover:scale-105"
            />
          </div>

          {/* Right: Product Details Section */}
          <div className="lg:w-1/2 lg:pl-12 mt-6 lg:mt-0">
            <h1 className="text-4xl font-extrabold text-gray-900">{product.title}</h1>
            <p className="text-xl text-gray-600 mt-4">{product.description}</p>

            <div className="mt-6">
              {/* Price */}
              <p className="text-3xl font-semibold text-gray-900">${product.price}</p>

              {/* Location */}
              <p className="text-lg text-gray-500 mt-2">{product.location}</p>

              {/* Category */}
              <p className="text-lg text-gray-500 mt-2">{product.category}</p>

              {/* Condition */}
              <p className="text-lg text-gray-500 mt-2">Condition: {product.condition}</p>

              {/* Condition Explanation */}
              {product.conditionExplanation && (
                <p className="text-lg text-gray-500 mt-2">
                  Condition Explanation: {product.conditionExplanation}
                </p>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              className="mt-8 w-full bg-gradient-to-r from-black to-gray-800 text-white py-3 rounded-lg hover:bg-black focus:outline-none transition ease-in-out duration-300 shadow-md transform transition duration-200 hover:scale-105"
              onClick={() => BuyProduct(product)}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
