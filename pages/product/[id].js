import { useRouter } from "next/router";

const dummyProducts = [
  { id: "1", title: "MacBook Pro", price: 1200, image: "https://via.placeholder.com/150", description: "A powerful laptop for students and professionals." },
  { id: "2", title: "PS5 Console", price: 500, image: "https://via.placeholder.com/150", description: "Next-gen gaming console with incredible performance." },
  { id: "3", title: "Calculus Textbook", price: 50, image: "https://via.placeholder.com/150", description: "Essential book for calculus courses at Penn State." },
];

export default function ProductDetails() {
  const router = useRouter();
  const { id } = router.query;

  const product = dummyProducts.find((item) => item.id === id);

  if (!product) return <p className="text-center mt-10">Product not found.</p>;

  return (
    <div className="container mx-auto mt-8 max-w-lg p-6 bg-white shadow-lg rounded-lg">
      <img src={product.image} alt={product.title} className="w-full h-60 object-cover rounded-md" />
      <h1 className="text-2xl font-bold mt-4">{product.title}</h1>
      <p className="text-gray-600 text-lg">${product.price}</p>
      <p className="mt-2 text-gray-700">{product.description}</p>
      <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg">Contact Seller</button>
    </div>
  );
}
