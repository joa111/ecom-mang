import React, { useState, useEffect } from "react";
import { ShoppingCart, Check, Minus, Plus } from "lucide-react";
import { supabase } from "../supabaseClient";
import Header from "../Header";
import { toast, Toaster } from "react-hot-toast";
import { useAuth } from "../AuthContext";

const ProductList = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [sortOption, setSortOption] = useState("latest");
  const [cart, setCart] = useState([]);

  // Fetch initial cart from Supabase
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) return; // Skip if the user is not logged in

      const { data, error } = await supabase
        .from("cart")
        .select("product_id, quantity, products(id, name, price, image_url, stock_quantity)")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching cart:", error);
        return;
      }

      // Map server response to cart format
      setCart(
        data.map((item) => ({
          id: item.products.id,
          name: item.products.name,
          price: item.products.price,
          image_url: item.products.image_url,
          stock_quantity: item.products.stock_quantity,
          quantity: item.quantity,
        }))
      );
    };

    fetchCart();
  }, [user]);

  // Sync cart to Supabase whenever it changes
  useEffect(() => {
    if (!user || cart.length === 0) return;

    const syncCart = async () => {
      for (const item of cart) {
        const { error } = await supabase
          .from("cart")
          .upsert(
            {
              user_id: user.id,
              product_id: item.id,
              quantity: item.quantity,
            },
            { onConflict: ["user_id", "product_id"] }
          );

        if (error) {
          console.error("Error syncing cart item:", error);
        }
      }
    };

    syncCart();
  }, [cart, user]);

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const categoriesResponse = await supabase.from("categories").select("name");
        let query = supabase.from("products").select("*, categories(name)");

        if (categoryFilter !== "All Categories") {
          query = query.eq("categories.name", categoryFilter);
        }

        switch (sortOption) {
          case "price_asc":
            query = query.order("price", { ascending: true });
            break;
          case "price_desc":
            query = query.order("price", { ascending: false });
            break;
          default:
            query = query.order("created_at", { ascending: false });
        }

        const [productsResponse, categoriesData] = await Promise.all([query, categoriesResponse]);

        if (productsResponse.error) throw productsResponse.error;

        setProducts(productsResponse.data || []);
        setCategories(["All Categories", ...categoriesData.data.map((cat) => cat.name)]);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryFilter, sortOption]);

  // Cart Management
  const addToCart = (product) => {
    if (!user) {
      toast.error("Please log in to add items to your cart");
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    const existingItem = cart.find((item) => item.id === productId);

    if (existingItem.quantity > 1) {
      setCart(
        cart.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      );
    } else {
      setCart(cart.filter((item) => item.id !== productId));
    }
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalCartPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-teal-600">Loading products...</div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <Header cartItemCount={totalCartItems} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
          <h2 className="text-2xl font-bold text-black">Our Products</h2>
          <div className="flex gap-4">
            <select
              className="border p-2 rounded-md text-black focus:border-teal-600 focus:ring-teal-600"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              className="border p-2 rounded-md text-black focus:border-teal-600 focus:ring-teal-600"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="latest">Sort by: Latest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => {
            const cartItem = cart.find((item) => item.id === product.id);

            return (
              <div
                key={product.id}
                className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                <div className="p-4 bg-gray-50">
                  <img
                    src={product.image_url || "/api/placeholder/300/300"}
                    alt={product.name}
                    className="w-full h-48 object-contain"
                  />
                </div>

                {/* Product Details */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-black">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {product.categories?.name || "Uncategorized"}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-teal-600">
                      ₹{product.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Cart Controls */}
                  <div className="flex items-center justify-between mt-4">
                    <span
                      className={`text-sm ${
                        product.stock_quantity > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                    </span>

                    {product.stock_quantity > 0 && (
                      <div className="flex items-center space-x-2">
                        {cartItem ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => removeFromCart(product.id)}
                              className="bg-black text-white p-1 rounded"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span>{cartItem.quantity}</span>
                            <button
                              onClick={() => addToCart(product)}
                              className="bg-black text-white p-1 rounded"
                              disabled={
                                cartItem.quantity >= product.stock_quantity
                              }
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-6 h-6 text-teal-600" />
                <span>{totalCartItems} Items</span>
              </div>
              <span className="font-bold text-teal-600">
                ₹{totalCartPrice.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductList;
