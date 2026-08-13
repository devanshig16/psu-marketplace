import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import ProductCard from "../components/ProductCard";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState(""); // State for category filter
  const [priceFilter, setPriceFilter] = useState(""); // State for price filter
  const [categories, setCategories] = useState(["Electronics", "Furniture", "Clothing", "Toys", "Other"]); // Example categories
  const [priceRanges, setPriceRanges] = useState([
    { label: "Under $50", value: "under50" },
    { label: "$50 - $100", value: "50-100" },
    { label: "$100 - $200", value: "100-200" },
    { label: "$200 - $500", value: "200-500" },
    { label: "Above $500", value: "above500" },
  ]); // Price ranges
  const router = useRouter();

  // Fetch all products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsArray);
        setFilteredProducts(productsArray); // Initially set all products
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on category and price range
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (categoryFilter) {
      filtered = filtered.filter((product) => product.category === categoryFilter);
    }

    // Filter by price range
    if (priceFilter) {
      switch (priceFilter) {
        case "under50":
          filtered = filtered.filter((product) => product.price < 50);
          break;
        case "50-100":
          filtered = filtered.filter((product) => product.price >= 50 && product.price <= 100);
          break;
        case "100-200":
          filtered = filtered.filter((product) => product.price >= 100 && product.price <= 200);
          break;
        case "200-500":
          filtered = filtered.filter((product) => product.price >= 200 && product.price <= 500);
          break;
        case "above500":
          filtered = filtered.filter((product) => product.price > 500);
          break;
        default:
          break;
      }
    }

    // Set the filtered products
    setFilteredProducts(filtered);
  }, [categoryFilter, priceFilter, products]);

  // Handle category filter change
  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  // Handle price range filter change
  const handlePriceChange = (e) => {
    setPriceFilter(e.target.value);
  };

  return (
    <div className="container mx-auto p-4 pb-16">
      <h1 className="text-2xl font-bold text-gray-900">Latest Listings</h1>

      {/* Filter Section */}
      <div className="mt-4 flex flex-wrap gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
            Category
          </label>
          <select
            value={categoryFilter}
            onChange={handleCategoryChange}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
            Price
          </label>
          <select
            value={priceFilter}
            onChange={handlePriceChange}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
          >
            <option value="">All Price Ranges</option>
            {priceRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Displaying filtered products */}
      {filteredProducts.length > 0 ? (
        <motion.div
          layout
          className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3"
        >
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <p className="text-lg font-medium text-gray-700">No listings match those filters yet</p>
          <p className="mt-1 text-sm text-gray-400">Try a different category or price range.</p>
        </div>
      )}
    </div>
  );
};

export default Home;
