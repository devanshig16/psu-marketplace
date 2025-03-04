import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { userId } = req.query; // userId from the query string
    
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const user = userDocSnap.data();
        
        if (user.stripeAccountId) {
          // Check if the Stripe account is fully onboarded
          const account = await stripe.accounts.retrieve(user.stripeAccountId);

          if (account.capabilities.transfers === "active") {
            // Update Firestore to mark the user as a seller
            await setDoc(userDocRef, { seller: "true" }, { merge: true });

            // Respond with success
            return res.status(200).json({ message: "Seller status updated successfully!" });
          } else {
            return res.status(400).json({ error: "Stripe account is not fully onboarded yet." });
          }
        } else {
          return res.status(400).json({ error: "Stripe account not found." });
        }
      } else {
        return res.status(400).json({ error: "User not found." });
      }
    } catch (error) {
      console.error("Error updating seller status:", error);
      return res.status(500).json({ error: error.message });
    }
  }
}
