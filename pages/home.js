import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

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

  const GetMoreInfo = (product) => {
    // Navigate to the dynamic product detail page
    router.push(`/product/${product.id}`);
  };

  // Handle category filter change
  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  // Handle price range filter change
  const handlePriceChange = (e) => {
    setPriceFilter(e.target.value);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-black">Latest Listings</h1>
  
      {/* Filter Section */}
      <div className="flex space-x-4 mt-4">
        {/* Category Filter Dropdown */}
        <div className="flex-1">
          <label className="text-black font-medium mb-2">Filter by Category   </label>
          <select
            value={categoryFilter}
            onChange={handleCategoryChange}
            className="w-auto p-2 border border-gray-300 text-black rounded-lg shadow-md mt-2"  
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
  
        {/* Price Range Filter Dropdown */}
        <div className="flex-1">
          <label className="text-black font-medium mb-2">Filter by Price   </label>
          <select
            value={priceFilter}
            onChange={handlePriceChange}
            className="w-auto p-2 border border-gray-300 text-black  rounded-lg shadow-md mt-2"  
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="bg-white p-4 rounded-lg shadow-md">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-40 object-cover rounded"
              />
              <h2 className="text-black font-bold mt-2">{product.title}</h2>
              <p className="text-black">${product.price}</p>
              <p className="text-black">{product.description}</p>
              <button
                type="button"
                className="w-full bg-blue-900 text-white p-2 mt-4 rounded-lg"
                onClick={() => GetMoreInfo(product)}
              >
                More Info
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-black">No products available</p>
        )}
      </div>
    </div>
  );
  
  
  
};

export default Home;
