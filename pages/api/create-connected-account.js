export default async function handler(req, res) {
    try {
      const account = await stripe.accounts.create({
        type: "express", // "standard" or "custom" are other options
        country: "US",  // Change this based on your needs
        email: req.body.email, // Get seller's email from frontend
        capabilities: {
          transfers: { requested: true },
        },
      });
  
      res.status(200).json({ accountId: account.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  