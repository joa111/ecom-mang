import React, { useState, useEffect, useRef } from "react";
import {
  Package,
  CreditCard,
  Headphones,
  DollarSign,
  ChevronRight,
  Heart,
  ShoppingCart,
  Eye,
  Star,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card, CardContent } from "./components/ui/card";
import { supabase } from "./supabaseClient";
import Header from "./Header";
import Footer from "./Footer";
import "./App.css";
import styles from "./Homepage.module.css";
import heroImage from "./assets/hero.jpg";

const ProductCard = ({ product, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative group"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.03 }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-64 object-cover"
          />
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center space-x-4"
            >
              <button
                onClick={() => onQuickView(product)}
                className="bg-white p-2 rounded-full hover:bg-gray-100"
              >
                <Eye className="w-6 h-6" />
              </button>
              <button className="bg-white p-2 rounded-full hover:bg-gray-100">
                <ShoppingCart className="w-6 h-6" />
              </button>
              <button className="bg-white p-2 rounded-full hover:bg-gray-100">
                <Heart className="w-6 h-6" />
              </button>
            </motion.div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg">{product.name}</h3>
          <div className="flex justify-between items-center mt-2">
            <span className="text-teal-600 font-semibold">
              ₹{product.price}
            </span>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < product.rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const QuickViewModal = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-lg w-full max-w-4xl flex flex-col md:flex-row p-4 md:p-8"
      >
        <div className="w-full md:w-1/2 mb-4 md:mb-0">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>
        <div className="w-full md:w-1/2 flex flex-col">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{product.name}</h2>
          <p className="text-gray-600 mb-4 text-sm md:text-base">{product.description}</p>
          <div className="flex items-center mb-4">
            <span className="text-xl md:text-2xl text-teal-600 font-bold mr-4">
              ₹{product.price}
            </span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 md:w-5 h-4 md:h-5 ${
                    i < product.rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-gray-600 text-sm">
                ({product.reviewCount} reviews)
              </span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <button className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 text-sm md:text-base">
              Add to Cart
            </button>
            <button
              onClick={onClose}
              className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100 text-sm md:text-base"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
const ParallaxSection = ({ children, offset = 50 }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [-Math.min(offset, 50), Math.min(offset, 50)]
  );

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className="relative w-full"
    >
      {children}
    </motion.div>
  );
};

const Homepage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*");

        // Featured Products
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("featured", true)
          .limit(4);

        if (categoriesError || productsError) {
          console.error("Fetch error:", categoriesError || productsError);
          return;
        }

        setCategories(categoriesData || []);
        setFeaturedProducts(productsData || []);
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: <Package className="w-8 h-8 text-teal-600" />,
      title: "Free Shipping",
      description: "Free shipping for order above ₹1500",
    },
    {
      icon: <DollarSign className="w-8 h-8 text-teal-600" />,
      title: "Money Guarantee",
      description: "Within 30 days for an exchange",
    },
    {
      icon: <Headphones className="w-8 h-8 text-teal-600" />,
      title: "Online Support",
      description: "24 hours a day, 7 days a week",
    },
    {
      icon: <CreditCard className="w-8 h-8 text-teal-600" />,
      title: "Flexible Payment",
      description: "Pay with multiple credit cards",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />

      <ParallaxSection>
        <section className={`${styles.hero} relative overflow-hidden`}>
          <div className={`${styles.heroContent} relative z-10`}>
            <div className={styles.textContainer}>
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className={styles.title}
              >
                MANG
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={styles.subtitle}
              >
                Elevate Your Fitness Journey
              </motion.p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`${styles.ctaButton} group flex items-center`}
              >
                Explore Collection
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
            <div className={styles.imageContainer}>
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                src={heroImage}
                alt="Fitness Apparel"
                className={`${styles.heroImage} shadow-lg`}
              />
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            className="absolute inset-0 bg-gradient-to-r from-teal-100 to-blue-100 z-0"
          />
        </section>
      </ParallaxSection>

      <ParallaxSection offset={30}>
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold">Shop by Categories</h3>
            <a
              href="/categories"
              className="text-gray-600 hover:text-black flex items-center group"
            >
              Show All
              <ChevronRight className="ml-1 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {isLoading
              ? Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse bg-gray-200 h-72 rounded-lg"
                    />
                  ))
              : categories.map((category, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                  >
                    <Card className="hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-2">
                      <CardContent className="p-6">
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-full h-48 object-contain mb-4 rounded-lg transition-transform duration-300 hover:scale-105"
                        />
                        <h4 className="text-xl text-center font-semibold">
                          {category.name}
                        </h4>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
          </div>
        </section>
      </ParallaxSection>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold">Featured Products</h3>
          <a
            href="/products"
            className="flex items-center text-gray-600 hover:text-black"
          >
            View All Products
            <ChevronRight className="ml-1" />
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {isLoading
            ? Array(4)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse bg-gray-200 h-72 rounded-lg"
                  />
                ))
            : featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setSelectedProduct}
                />
              ))}
        </div>
      </section>

      {selectedProduct && (
        <QuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      <ParallaxSection offset={20}>
        <section className="max-w-7xl mx-auto px-4 py-12 bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center p-6 rounded-lg hover:bg-gray-50 transition-all duration-300 ease-in-out"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </ParallaxSection>

      <Footer />
    </div>
  );
};

export default Homepage;
