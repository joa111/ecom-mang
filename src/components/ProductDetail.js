import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { ShoppingCart, Heart, Share2 } from 'lucide-react';

const ProductDetail = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Sample product data - in a real app, this would come from an API
  const product = {
    id: 1,
    name: 'Wireless Earbuds Pro',
    price: 99.99,
    description: 'High-quality wireless earbuds with active noise cancellation and premium sound quality.',
    images: [
      '/api/placeholder/600/600',
      '/api/placeholder/600/600',
      '/api/placeholder/600/600'
    ],
    specs: [
      'Active Noise Cancellation',
      'Up to 24 hours battery life',
      'Wireless charging case',
      'Water resistant'
    ],
    inStock: true,
    stockCount: 10
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="mb-4">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full rounded-lg"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {product.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} ${index + 1}`}
                className={`w-full rounded-lg cursor-pointer border-2 ${
                  selectedImage === index ? 'border-black' : 'border-transparent'
                }`}
                onClick={() => setSelectedImage(index)}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <div className="text-2xl font-bold mb-6">${product.price}</div>
          
          <p className="text-gray-600 mb-6">{product.description}</p>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Key Features:</h3>
            <ul className="list-disc pl-6">
              {product.specs.map((spec, index) => (
                <li key={index} className="text-gray-600">{spec}</li>
              ))}
            </ul>
          </div>

          <div className="flex gap-4 items-center mb-6">
            <div className="border rounded-md flex items-center">
              <button
                className="px-4 py-2 hover:bg-gray-100"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <span className="px-4 py-2">{quantity}</span>
              <button
                className="px-4 py-2 hover:bg-gray-100"
                onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
              >
                +
              </button>
            </div>
            <span className="text-gray-600">
              {product.stockCount} items available
            </span>
          </div>

          <div className="flex gap-4 mb-6">
            <button className="flex-1 bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
            <button className="p-3 border rounded-md hover:bg-gray-100">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-3 border rounded-md hover:bg-gray-100">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-600">
                Free shipping on orders over $150. Orders typically arrive within 3-5 business days.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;