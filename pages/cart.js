import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useUser } from "../UserContext"; // Assuming you're using a UserContext
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
    <div className="container mx-auto max-w-2xl p-4 pb-16">
      <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>

      {cart.length === 0 ? (
        <p className="mt-8 text-center text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="mt-4">
          <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm">
            <AnimatePresence initial={false}>
              {cart.map((product) => (
                <motion.li
                  key={product.productId}
                  initial={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between overflow-hidden p-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{product.title}</p>
                      <p className="text-sm text-gray-500">
                        ${(product.price * product.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <button
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    onClick={() => handleRemoveItem(product.productId)}
                  >
                    Remove
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Total: ${totalPrice.toFixed(2)}
            </h2>
            <button
              onClick={handleCheckout}
              className="rounded-lg bg-blue-950 px-5 py-2.5 font-medium text-white transition-colors hover:bg-blue-900"
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
