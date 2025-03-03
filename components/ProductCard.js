import Link from "next/link";

export default function ProductCard({ product }) {
  return (
    <div className="border p-4 rounded-lg shadow-md bg-white">
      <img src={product.image} alt={product.title} className="w-20 h-20 object-cover rounded-md" />
      <h2 className="text-lg font-bold mt-2">{product.title}</h2>
      <p className="text-gray-600">${product.price}</p>
      <Link href={`/product/${product.id}`}>
        <button className="mt-2 bg-blue-600 text-white py-1 px-4 rounded-md">
          View Details
        </button>
      </Link>
    </div>
  );
}

  