import Link from "next/link";
import { motion } from "framer-motion";

export default function ProductCard({ product }) {
  const image = product.imageUrl || product.image;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
    >
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {image ? (
            <img
              src={image}
              alt={product.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              No image
            </div>
          )}
          {product.category && (
            <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-blue-950 shadow-sm backdrop-blur">
              {product.category}
            </span>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h2 className="line-clamp-1 font-semibold text-gray-900">{product.title}</h2>
            <span className="whitespace-nowrap text-lg font-bold text-blue-950">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">{product.description}</p>
          )}
          {product.location && (
            <p className="mt-2 text-xs text-gray-400">{product.location}</p>
          )}
        </div>
      </Link>

      <div className="px-4 pb-4">
        <Link
          href={`/product/${product.id}`}
          className="block w-full rounded-lg bg-blue-950 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-900"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
}
