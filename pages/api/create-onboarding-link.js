import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // Fetch user document from Firestore
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    let stripeAccountId = userDocSnap.exists() ? userDocSnap.data().stripeAccountId : null;

    // If user doesn't have a Stripe account, create one
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        email: userDocSnap.data().email,
        capabilities: { transfers: { requested: true } },
      });

      stripeAccountId = account.id;

      // Save Stripe account ID to Firestore
      await setDoc(userDocRef, { stripeAccountId }, { merge: true });
    }

    // Generate onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: "https://yourwebsite.com/retry",
      return_url: `https://yourwebsite.com/profile?userId=${userId}`, // Redirect back to profile page with userId
      type: "account_onboarding",
    });

    res.status(200).json({ url: accountLink.url });
  } catch (error) {
    console.error("Error creating onboarding link:", error);
    res.status(500).json({ error: error.message });
  }
}
