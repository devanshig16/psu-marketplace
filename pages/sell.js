import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Sell() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !price || !description || !image) return alert("All fields required!");

    await addDoc(productsCollection, {
      title,
      price: parseFloat(price),
      description,
      image,
      createdAt: new Date(),
    });

    alert("Product Listed!");
  };


  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-black">Sell a Product</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded mt-2 text-black" required />
        <input type="number" placeholder="Price ($)" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-2 border rounded mt-2 text-black" required />
        <input type="file" onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))} className="w-full mt-2 text-black" required />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded mt-2 text-black" required />
        <button type="submit" className="w-full bg-green-600 text-white p-2 mt-4 rounded-lg ">Sell Product</button>
      </form>
    </div>
  );
}
