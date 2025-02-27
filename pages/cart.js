import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useUser } from "/pages/context/UserContext"; // Assuming you're using a UserContext
import { loadStripe } from "@stripe/stripe-js";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const router = useRouter();
  const user = useUser(); // Assuming you have user context

  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        try {
          const cartRef = doc(db, "carts", user.uid); // Use the user's UID as the document ID for their cart
          const cartDoc = await getDoc(cartRef);

          if (cartDoc.exists()) {
            const cartData = cartDoc.data().items;
            setCart(cartData);

            // Calculate the total price of the cart
            const total = cartData.reduce((sum, product) => sum + product.price * product.quantity, 0);
            setTotalPrice(total);
          } else {
            console.log("No cart found.");
          }
        } catch (error) {
          console.error("Error fetching cart:", error);
        }
      }
    };

    if (user) {
      fetchCart();
    }
  }, [user]);

  const handleRemoveItem = async (productId) => {
    try {
      if (user) {
        const cartRef = doc(db, "carts", user.uid);
        const cartDoc = await getDoc(cartRef);

        if (cartDoc.exists()) {
          const currentCart = cartDoc.data();
          const updatedItems = currentCart.items.filter(product => product.productId !== productId);
          
          // Update the cart in Firestore
          await setDoc(cartRef, {
            userId: user.uid,
            items: updatedItems,
          });

          // Update local state
          setCart(updatedItems);

          // Recalculate total price
          const total = updatedItems.reduce((sum, product) => sum + product.price * product.quantity, 0);
          setTotalPrice(total);
        }
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleCheckout = async () => {
    try {
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      if (!stripe) {
        console.error("Stripe failed to initialize.");
        return;
      }
  
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error from API:", errorData);
        return;
      }
  
      const session = await response.json();
      console.log("Stripe session:", session); // Debugging
  
      if (!session.id) {
        console.error("Session ID not found.");
        return;
      }
  
      const result = await stripe.redirectToCheckout({ sessionId: session.id });
  
      if (result.error) {
        console.error("Stripe redirect error:", result.error.message);
      }
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-black">Your Cart</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          <ul>
            {cart.map((product) => (
              <li key={product.productId} className="flex justify-between mt-4 p-4 border-b border-gray-300">
                <div className="flex items-center">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-20 h-20 object-cover mr-4"
                  />
                  <div>
                    <p className="text-black">{product.title}</p>
                    <p className="text-black">${(product.price * product.quantity).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded-lg"
                    onClick={() => handleRemoveItem(product.productId)} // Use productId here
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-between">
            <h2 className="text-xl font-semibold">Total: ${totalPrice.toFixed(2)}</h2>
            <button
              onClick={handleCheckout}
              className="bg-green-600 text-white p-2 rounded-lg"
            >
              Checkout with Stripe
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
