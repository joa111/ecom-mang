import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  CheckCircle2, 
  ImagePlus, 
  X 
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const AdminDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('categories');

  // Category form with image upload
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: null,
    imagePreview: null
  });

  // Product form with multiple image uploads
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock_quantity: '',
    images: [],
    imagePreviews: []
  });

  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  // Existing fetch methods remain the same
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data);
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data);
    }
  };

  // Image upload handler for categories
  const handleCategoryImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCategoryForm(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Image upload handler for products (multiple)
  const handleProductImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(file => URL.createObjectURL(file));
    
    setProductForm(prev => ({
      ...prev,
      images: [...prev.images, ...files],
      imagePreviews: [...prev.imagePreviews, ...previews]
    }));
  };

  // Remove image from product upload
  const removeProductImage = (index) => {
    setProductForm(prev => {
      const newImages = [...prev.images];
      const newPreviews = [...prev.imagePreviews];
      
      newImages.splice(index, 1);
      newPreviews.splice(index, 1);
      
      return {
        ...prev,
        images: newImages,
        imagePreviews: newPreviews
      };
    });
  };

  // Upload image to Supabase storage
  const uploadImage = async (file, bucket, path) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}/${uuidv4()}.${fileExt}`;
    const { error, data } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  // Handle category submission with image
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    let imageUrl = null;
    if (categoryForm.image) {
      imageUrl = await uploadImage(
        categoryForm.image, 
        'category-images', 
        'categories'
      );
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: categoryForm.name,
        description: categoryForm.description,
        image_url: imageUrl
      });

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      fetchCategories();
      setCategoryForm({ 
        name: '', 
        description: '', 
        image: null, 
        imagePreview: null 
      });
      setIsAddCategoryModalOpen(false);
    }
  };

  // Handle product submission with multiple images
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    // Upload multiple images
    const imageUrl = await Promise.all(
      productForm.images.map(image => 
        uploadImage(image, 'product-images', 'products')
      )
    );

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        category_id: productForm.category_id,
        stock_quantity: parseInt(productForm.stock_quantity),
        image_url: imageUrl
      });

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      fetchProducts();
      setProductForm({
        name: '',
        description: '',
        price: '',
        category_id: '',
        stock_quantity: '',
        images: [],
        imagePreviews: []
      });
      setIsAddProductModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-800 text-center">
          Admin Dashboard
        </h1>
        
        {/* Tabs with modern styling */}
        <div className="flex justify-center mb-8">
          <div className="bg-white shadow-md rounded-full inline-flex">
            <button
              className={`px-6 py-3 rounded-full transition-all duration-300 ${
                activeTab === 'categories' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('categories')}
            >
              Categories
            </button>
            <button
              className={`px-6 py-3 rounded-full transition-all duration-300 ${
                activeTab === 'products' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('products')}
            >
              Products
            </button>
          </div>
        </div>

        {/* Categories Section */}
        {activeTab === 'categories' && (
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="p-6 bg-gray-50 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
              <button 
                onClick={() => setIsAddCategoryModalOpen(true)}
                className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <PlusCircle className="mr-2" /> Add Category
              </button>
            </div>

            {/* Categories Table with hover effect */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4 text-left text-gray-600">Image</th>
                    <th className="p-4 text-left text-gray-600">Name</th>
                    <th className="p-4 text-left text-gray-600">Description</th>
                    <th className="p-4 text-left text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr 
                      key={category.id} 
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        {category.image_url ? (
                          <img 
                            src={category.image_url} 
                            alt={category.name} 
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ImagePlus className="text-gray-500" />
                          </div>
                        )}
                      </td>
                      <td className="p-4">{category.name}</td>
                      <td className="p-4">{category.description}</td>
                      <td className="p-4 space-x-2">
                        <button className="text-blue-500 hover:text-blue-700"><Pencil /></button>
                        <button className="text-red-500 hover:text-red-700"><Trash2 /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

{/* Products Section */}
{activeTab === 'products' && (
  <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
    <div className="p-6 bg-gray-50 flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-800">Products</h2>
      <button 
        onClick={() => setIsAddProductModalOpen(true)}
        className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
      >
        <PlusCircle className="mr-2" /> Add Product
      </button>
    </div>

    {/* Products Table with hover effect */}
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left text-gray-600">Image</th>
            <th className="p-4 text-left text-gray-600">Name</th>
            <th className="p-4 text-left text-gray-600">Category</th>
            <th className="p-4 text-left text-gray-600">Price</th>
            <th className="p-4 text-left text-gray-600">Stock</th>
            <th className="p-4 text-left text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr 
              key={product.id} 
              className="border-b hover:bg-gray-50 transition-colors"
            >
              <td className="p-4">
                {product.image_url && product.image_url.length > 0 ? (
                  <img 
                    src={product.image_url[0]} 
                    alt={product.name} 
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <ImagePlus className="text-gray-500" />
                  </div>
                )}
              </td>
              <td className="p-4">{product.name}</td>
              <td className="p-4">{product.categories?.name || 'Uncategorized'}</td>
              <td className="p-4">${product.price.toFixed(2)}</td>
              <td className="p-4">{product.stock_quantity}</td>
              <td className="p-4 space-x-2">
                <button className="text-blue-500 hover:text-blue-700"><Pencil /></button>
                <button className="text-red-500 hover:text-red-700"><Trash2 /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
        
        {/* Add Category Modal */}
        {isAddCategoryModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-[500px] p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Add New Category</h2>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="flex flex-col items-center mb-4">
                  <input 
                    type="file"
                    id="categoryImage"
                    accept="image/*"
                    onChange={handleCategoryImageUpload}
                    className="hidden"
                  />
                  <label 
                    htmlFor="categoryImage" 
                    className="cursor-pointer"
                  >
                    {categoryForm.imagePreview ? (
                      <img 
                        src={categoryForm.imagePreview} 
                        alt="Category preview" 
                        className="w-48 h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImagePlus className="text-gray-500 w-12 h-12" />
                        <span className="ml-2 text-gray-500">Upload Image</span>
                      </div>
                    )}
                  </label>
                </div>
                
                <input 
                  type="text"
                  placeholder="Category Name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required 
                />
                <textarea 
                  placeholder="Description (Optional)"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  rows="3"
                />
                <div className="flex justify-end space-x-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddCategoryModalOpen(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      {/* Add Product Modal */}
{isAddProductModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-2xl w-[600px] p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Add New Product</h2>
      <form onSubmit={handleProductSubmit} className="space-y-4">
        {/* Product Image Upload */}
        <div className="flex flex-col items-center mb-4">
          <input 
            type="file"
            id="productImages"
            accept="image/*"
            multiple
            onChange={handleProductImageUpload}
            className="hidden"
          />
          <label 
            htmlFor="productImages" 
            className="cursor-pointer w-full"
          >
            <div className="flex space-x-2 overflow-x-auto pb-4">
              {productForm.imagePreviews.length > 0 ? (
                productForm.imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={preview} 
                      alt={`Product preview ${index + 1}`} 
                      className="w-48 h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeProductImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ImagePlus className="text-gray-500 w-12 h-12" />
                  <span className="ml-2 text-gray-500">Upload Images</span>
                </div>
              )}
            </div>
          </label>
        </div>
        
        {/* Product Name */}
        <input 
          type="text"
          placeholder="Product Name"
          value={productForm.name}
          onChange={(e) => setProductForm({...productForm, name: e.target.value})}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required 
        />
        
        {/* Product Description */}
        <textarea 
          placeholder="Product Description"
          value={productForm.description}
          onChange={(e) => setProductForm({...productForm, description: e.target.value})}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          rows="3"
          required
        />
        
        {/* Category Dropdown */}
        <select
          value={productForm.category_id}
          onChange={(e) => setProductForm({...productForm, category_id: e.target.value})}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        
        {/* Price and Stock */}
        <div className="flex space-x-4">
          <input 
            type="number"
            placeholder="Price"
            value={productForm.price}
            onChange={(e) => setProductForm({...productForm, price: e.target.value})}
            className="w-1/2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            step="0.01"
            min="0"
            required 
          />
          <input 
            type="number"
            placeholder="Stock Quantity"
            value={productForm.stock_quantity}
            onChange={(e) => setProductForm({...productForm, stock_quantity: e.target.value})}
            className="w-1/2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            min="0"
            required 
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <button 
            type="button"
            onClick={() => setIsAddProductModalOpen(false)}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add Product
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
};

export default AdminDashboard;