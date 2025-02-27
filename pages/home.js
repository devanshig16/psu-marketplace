import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const Home = () => {
  const [products, setProducts] = useState([]);
  const router = useRouter(); // Moved inside the component

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsArray);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  

  const GetMoreInfo = (product) => {
    // Navigate to the dynamic product detail page
    router.push(`/product/${product.id}`);
  };
  

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-black">Latest Listings</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {products.length > 0 ? (
          products.map((product) => (
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
                className="w-full bg-black text-white p-2 mt-4 rounded-lg"
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
