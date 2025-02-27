import { db } from "../../firebase"; // Assuming you're using Firebase for your database
import { collection, addDoc } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { title, description, price, imageUrl, location } = req.body;

    if (!title || !description || !price || !imageUrl || !location) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const docRef = await addDoc(collection(db, "products"), {
        title,
        description,
        price,
        imageUrl,
        location,
        createdAt: new Date(),
      });

      return res.status(201).json({ message: "Product created successfully", productId: docRef.id });
    } catch (error) {
      return res.status(500).json({ error: "Error creating product: " + error.message });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}

