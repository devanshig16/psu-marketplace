import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { cart } = req.body;
    
    if (!cart || cart.length === 0) {
      console.error("Cart is empty or missing:", cart);
      return res.status(400).json({ error: "Cart cannot be empty" });
    }

    console.log("Received cart:", cart);

    const line_items = cart.map((product) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.title,
          images: [product.imageUrl],
        },
        unit_amount: Math.round(product.price * 100), // Convert to cents
      },
      quantity: 1,
    }));

    console.log("Formatted line items:", line_items);

    // Ensure the base URL is set correctly
    const baseUrl = "https://psu-marketplace.vercel.app"; // Fallback URL in case the env variable is not set

    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      console.error("Invalid base URL:", baseUrl);
      return res.status(500).json({ error: "Invalid base URL" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/cart`,
    });

    console.log("Stripe session created:", session);

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};
