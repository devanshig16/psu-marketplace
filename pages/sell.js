import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid"; // Import uuid for unique ID generation

const Sell = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [user, setUser] = useState(null); // Store the logged-in user

  useEffect(() => {
    // Set the current logged-in user when the component mounts
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchUserListings(user.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Function to fetch the logged-in user's listings
  const fetchUserListings = async (userId) => {
    const q = query(collection(db, "products"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    setListings(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // Preview the image before upload
    } else {
      alert("Please upload a valid image.");
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview); // Release the object URL
      }
    };
  }, [imagePreview]);

  const handleImageUpload = async () => {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url; // Cloudinary returns the image URL
  };

  const handleSubmitButton = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("You need to be logged in to sell a product.");
        setLoading(false);
        return;
      }
  
      // Upload image to Cloudinary and get the URL
      const imageUrl = await handleImageUpload();
  
      // Generate a unique product ID using UUID
      const productId = uuidv4(); // Generates a unique ID for each product
  
      // Save the product with the location coordinates and product ID to Firestore
      await addDoc(collection(db, "products"), {
        productId, // Use the generated product ID
        title,
        price: parseFloat(price),
        description,
        imageUrl, // Save Cloudinary image URL in Firestore
        location,
        userId: user.uid, // Store the userId with the product
        sellerName: user.displayName || "Unnamed Seller", // Store the user's name
        sellerEmail: user.displayEmail || "Unkown",
        createdAt: new Date(),
      });
  
      alert("Product Listed!");
      setTitle("");
      setPrice("");
      setDescription("");
      setLocation("");
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error listing product:", error);
      alert("Error listing product.");
    }
    setLoading(false);
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    // Check for empty fields before calling the submission function
    if (!title.trim() || !price.trim() || !description.trim() || !image || !location.trim()) {
      alert("All fields required");
      return;
    }

    // Call the function to handle product submission
    handleSubmitButton();
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-black">Sell a Product</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded mt-2 text-black"
          required
        />
        <input
          type="number"
          placeholder="Price ($)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-2 border rounded mt-2 text-black"
          required
        />
        <input
          type="text"
          placeholder="Location (City/Address)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-2 border rounded mt-2 text-black"
          required
        />
        <input
          type="file"
          onChange={handleImageChange}
          className="w-full mt-2 text-black"
          required
        />

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="mt-2 w-full h-40 object-cover rounded"
          />
        )}

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded mt-2 text-black"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 mt-4 rounded-lg"
          disabled={loading}
        >
          {loading ? "Listing..." : "Sell Product"}
        </button>
      </form>

      
    </div>
  );
};

export default Sell;
