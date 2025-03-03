import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, query, where, getDocs, doc, getDoc } from "firebase/firestore";
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
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false); // Track if user is a seller
  const [condition, setCondition] = useState(""); // Store the selected condition (Poor, Okay, Excellent)
  const [conditionExplanation, setConditionExplanation] = useState(""); // Store the explanation for the selected condition
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState(""); // Store custom category if "Other" is selected

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        await fetchUserListings(user.uid);
        await checkSellerStatus(user.uid); // Check if user is a seller
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch user listings
  const fetchUserListings = async (userId) => {
    const q = query(collection(db, "products"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    setListings(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  // Check if the user is a seller
  const checkSellerStatus = async (userId) => {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      setIsSeller(userData.seller === "true"); // Check if seller status is "true"
    }
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

      const imageUrl = await handleImageUpload();

      const productId = uuidv4(); // Generates a unique ID for each product

      await addDoc(collection(db, "products"), {
        productId,
        title,
        price: parseFloat(price),
        description,
        imageUrl,
        location,
        condition,
        conditionExplanation, // Store the explanation
        category: category === "Other" ? customCategory : category,
        userId: user.uid,
        sellerName: user.displayName || "Unnamed Seller",
        sellerEmail: user.displayEmail || "Unknown",
        createdAt: new Date(),
      });

      alert("Product Listed!");
      setTitle("");
      setPrice("");
      setDescription("");
      setLocation("");
      setImage(null);
      setImagePreview(null);
      setCondition("");
      setConditionExplanation("");
      setCategory("");
      setCustomCategory("");
    } catch (error) {
      console.error("Error listing product:", error);
      alert("Error listing product.");
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // If not a seller, don't allow the product to be listed
    if (!isSeller) {
      alert("You must be a verified seller to list a product.");
      return;
    }

    if (!title.trim() || !price.trim() || !description.trim() || !image || !location.trim() || !condition.trim()) {
      alert("All fields required");
      return;
    }

    handleSubmitButton();
  };

  // Handle condition selection
  const handleConditionSelect = (selectedCondition) => {
    setCondition(selectedCondition);
    setConditionExplanation(""); // Clear the explanation when changing the condition
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-semibold text-center text-black mb-6">Sell a Product</h2>
      {!isSeller && (
        <div className="text-center text-red-500 mb-4">
          You must be a verified seller to list a product.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 text-black placeholder-black"
            required
          />
        </div>
  
        {/* Price Input */}
        <div>
          <input
            type="number"
            placeholder="Price ($)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 text-black placeholder-black"
            required
          />
        </div>
  
        {/* Location Input */}
        <div>
          <input
            type="text"
            placeholder="Location (City/Address)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 text-black placeholder-black"
            required
          />
        </div>
  
        {/* Image Upload */}
        <div>
          <label className=" text-black font-medium mb-2 flex items-center">
            <span>Product Image</span>
          </label>
          <input
            type="file"
            onChange={handleImageChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-500"
            required
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-3 w-full h-40 object-cover rounded-lg shadow-md"
            />
          )}
        </div>
  
        {/* Description Textarea */}
        <div>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 text-black placeholder-black"
            required
          />
        </div>
  
        {/* Category Dropdown */}
        <div>
          <label className="block text-black font-medium mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              if (e.target.value !== "Other") setCustomCategory(""); // Reset custom category
            }}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 text-black placeholder-black"
            required
          >
            <option value="">Select Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Clothing">Clothing</option>
            <option value="Toys">Toys</option>
            <option value="Other">Other</option>
          </select>
  
          {/* Custom Category Input */}
          {category === "Other" && (
            <div className="mt-2">
              <input
                type="text"
                placeholder="Enter custom category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 text-black placeholder-black"
              />
            </div>
          )}
        </div>
  
        {/* Condition Selection */}
        <div>
          <label className="block text-black font-medium mb-2">Condition</label>
          <div className="flex justify-between items-center">
            <div
              className={`w-24 h-12 flex items-center justify-center cursor-pointer ${
                condition === "Poor" ? "bg-red-500" : "bg-gray-300"
              } rounded-lg text-black`}
              onClick={() => handleConditionSelect("Poor")}
            >
              Poor
            </div>
            <div
              className={`w-24 h-12 flex items-center justify-center cursor-pointer ${
                condition === "Okay" ? "bg-yellow-500" : "bg-gray-300"
              } rounded-lg text-black`}
              onClick={() => handleConditionSelect("Okay")}
            >
              Okay
            </div>
            <div
              className={`w-24 h-12 flex items-center justify-center cursor-pointer ${
                condition === "Excellent" ? "bg-green-500" : "bg-gray-300"
              } rounded-lg text-black`}
              onClick={() => handleConditionSelect("Excellent")}
            >
              Excellent
            </div>
          </div>
          {/* Condition Explanation */}
          {condition && (
            <div className="mt-2">
              <textarea
                placeholder={`Explain the condition of the product`}
                value={conditionExplanation}
                onChange={(e) => setConditionExplanation(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 text-black placeholder-black"
              />
            </div>
          )}
        </div>
  
        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-4 rounded-lg shadow-md hover:bg-blue-800 focus:ring-2 focus:ring-blue-500"
            disabled={loading || !isSeller}
          >
            {loading ? "Listing..." : "Sell Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Sell;
