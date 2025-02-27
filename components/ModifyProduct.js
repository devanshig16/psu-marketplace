import { useState } from "react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

const ModifyProduct = ({ product, onClose }) => {
  const [title, setTitle] = useState(product.title);
  const [price, setPrice] = useState(product.price);
  const [description, setDescription] = useState(product.description);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(URL.createObjectURL(file)); // Preview the new image
  };

  const handleImageUpload = async () => {
    if (!image) return product.imageUrl; // No new image, use the existing image URL

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const imageUrl = await handleImageUpload();

    try {
      const productRef = doc(db, "products", product.id);
      await updateDoc(productRef, {
        title,
        price: parseFloat(price),
        description,
        imageUrl, // Update the image URL in Firestore
      });

      alert("Product updated!");
      onClose(); // Close the modal after successful update
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error updating product.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-black">Modify Product</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-black w-full p-2 mt-2"
          required
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="text-black w-full p-2 mt-2"
          required
        />
        <input
          type="file"
          onChange={handleImageChange}
          className="text-black w-full mt-2"
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="mt-2 w-full h-40 object-cover rounded"
          />
        )}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="text-black w-full p-2 mt-2"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 mt-4 rounded-lg"
        >
          Update Product
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-gray-500 text-white p-2 mt-2 rounded-lg"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default ModifyProduct;
