import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiX, FiUpload } from 'react-icons/fi';
import imageCompression from 'browser-image-compression';
import '../Products/Allproduct.css'; // Ensure this path is correct
import 'react-toastify/dist/ReactToastify.css'; 
const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null); // Used for editing existing approved products
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Form states for adding/editing
  const [formData, setFormData] = useState({
    name: '',
    stock: '',
    original_price: '',
    discount_price: '',
    description: '',
    image: null
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products/'); // This fetches only APPROVED products
      // Ensure image URLs are complete and handle relative vs. absolute paths
      const productsWithFullImageUrls = res.data.map(product => {
        let imageUrl = product.image;
        // Check if the image path is already a full URL (starts with http or https)
        if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
          // If it's a relative path, prepend the base API URL
          imageUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}${imageUrl}`;
        }
        return {
          ...product,
          image: imageUrl
        };
      });
      setProducts(productsWithFullImageUrls);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error("Error fetching products:", error); // Log the error for debugging
    }
  };

  // Image handling with auto-conversion to WebP
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate image type
    if (!file.type.match('image.*')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      setIsLoading(true);
      
      // Compress and convert image
      const options = {
        maxSizeMB: 1, // Max file size
        maxWidthOrHeight: 1024, // Max width/height
        useWebWorker: true,
        fileType: 'image/webp' // Convert to WebP
      };

      const compressedFile = await imageCompression(file, options);
      
      // *** IMPORTANT FIX: Ensure the compressed file has a .webp extension in its name ***
      // Create a new File object with the corrected name
      const webpFileName = file.name.split('.').slice(0, -1).join('.') + '.webp';
      const fileWithCorrectName = new File([compressedFile], webpFileName, { type: 'image/webp' });

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(fileWithCorrectName); // Read the file with correct name
      
      setImageFile(fileWithCorrectName); // Set the file with correct name for upload
    } catch (error) {
      toast.error('Error processing image');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.stock || !formData.original_price) {
      toast.error('Please fill all required fields: Product Name, Stock, Original Price.');
      return;
    }
    if (!imageFile) {
        toast.error('Please upload a product image.');
        return;
    }

    try {
      setIsLoading(true);
      
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('stock', formData.stock);
      formPayload.append('original_price', formData.original_price);
      // Ensure discount_price is a valid number, or null/empty string if not set
      formPayload.append('discount_price', formData.discount_price || ''); 
      formPayload.append('description', formData.description);
      
      if (imageFile) {
        formPayload.append('image', imageFile);
      }

      // POST to the default products endpoint. The backend ProductViewSet.create will
      // now automatically detect if it's a new product or from master, and route to PendingProduct.
      await api.post('/products/', formPayload, {
        headers: {
          // 'Content-Type': 'multipart/form-data' // Axios and FormData automatically set this header
        }
      });

      toast.success('Product submitted for admin review. It will appear in your inventory once approved.');
      resetForm();
      // No need to fetchProducts here, as it won't be in the approved list yet.
      setIsFormOpen(false);
    } catch (error) {
      console.error("Full error object:", error); // Log the entire error object
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        
        let errorMessage = 'Failed to submit product.';
        // Attempt to extract detailed error messages from DRF validation errors
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else if (Object.keys(error.response.data).length > 0) {
            // Join all validation messages
            errorMessage = Object.entries(error.response.data)
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join('; ');
          }
        }
        toast.error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
        toast.error('No response received from server. Please check your network.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
        toast.error('An unexpected error occurred: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = async () => {
    if (!currentProduct) return;

    try {
      setIsLoading(true);
      
      // For editing existing products, only stock, prices, description can be updated via this form
      const payload = {
        stock: formData.stock,
        original_price: formData.original_price,
        discount_price: formData.discount_price,
        description: formData.description
      };

      await api.patch(`/products/${currentProduct.id}/`, payload);
      
      toast.success('Product updated successfully');
      fetchProducts(); // Refresh products to show changes
      setIsFormOpen(false);
    } catch (error) {
      console.error("Full error object:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        let errorMessage = 'Failed to update product.';
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else if (Object.keys(error.response.data).length > 0) {
            errorMessage = Object.entries(error.response.data)
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join('; ');
          }
        }
        toast.error(errorMessage);
      } else {
        toast.error('Failed to update product: ' + (error.message || 'An unknown error occurred.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    // Replaced window.confirm with a custom modal/toast for consistency in Canvas environment
    toast.info(
      <div className="flex flex-col">
        <p className="font-semibold mb-2">Are you sure you want to delete this product?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={async () => {
              toast.dismiss(); // Close the info toast
              try {
                await api.delete(`/products/${id}/`);
                toast.success('Product deleted successfully');
                fetchProducts(); // Refresh products
              } catch (error) {
                console.error("Error deleting product:", error.response?.data || error);
                toast.error('Failed to delete product: ' + (error.response?.data?.detail || error.message));
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss()} // Close the info toast
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded-md text-sm"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        autoClose: false, // Keep open until explicitly dismissed
        closeButton: false,
        draggable: false,
      }
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      stock: '',
      original_price: '',
      discount_price: '',
      description: '',
      image: null
    });
    setImagePreview(null);
    setImageFile(null);
    setCurrentProduct(null);
  };

  const openEditModal = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      stock: product.stock,
      original_price: product.original_price,
      discount_price: product.discount_price || '', // Handle null/empty discount price
      description: product.description || '' // Handle null description
    });
    // Use the full image URL for preview if available, otherwise null
    setImagePreview(product.image || null); 
    setIsFormOpen(true);
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory ? 
      (product.category && product.category.name === filterCategory) : true;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter dropdown
  const categories = [...new Set(products
    .filter(product => product.category)
    .map(product => product.category.name))];

  return (
    <div className="container">
      {/* Header and Controls */}
      <div className="header-section">
        <div className="header-text">
          <h1>Product Inventory</h1>
          <p>Manage your product listings</p>
        </div>
        
        <div className="controls-group">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search products..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="search-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="category-select"
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
          
          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="add-product-btn"
          >
            <FiPlus /> Add Product
          </button>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      <div className={`modal-overlay ${isFormOpen ? 'open' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>
              {currentProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button 
              onClick={() => setIsFormOpen(false)} 
              className="modal-close-btn"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="modal-body">
            {/* Product Name (read-only in edit mode, required for new) */}
            <div className="form-group">
              <label>
                Product Name {!currentProduct && '*'}
              </label>
              {currentProduct ? (
                <input
                  type="text"
                  value={formData.name}
                  readOnly
                  className="read-only-input" // Custom class for read-only
                />
              ) : (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter product name"
                  required
                />
              )}
            </div>

            {/* Image Upload (only in add mode) */}
            {!currentProduct && (
              <div className="form-group">
                <label>
                  Product Image *
                </label>
                <div className="image-upload-wrapper">
                  <label className="upload-label">
                    <FiUpload />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {isLoading && <span className="image-upload-info">Processing image...</span>}
                </div>
                {imagePreview && (
                  <div className="image-preview-area">
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                    <p className="image-upload-info">Image will be converted to WebP format</p>
                  </div>
                )}
                <p className="image-upload-info">
                  Recommended: Square image (512-1024px), white background, clear product view
                </p>
              </div>
            )}

            {/* Current Image (in edit mode) */}
            {currentProduct && currentProduct.image && (
              <div className="form-group">
                <label>
                  Current Image
                </label>
                <img 
                  src={currentProduct.image} 
                  alt={currentProduct.name} 
                  className="image-preview" 
                  onError={(e) => {
                    e.target.onerror = null; // Prevents infinite loop if placeholder also fails
                    e.target.src = 'https://placehold.co/100x100/CCCCCC/FFFFFF?text=NO+IMG'; // Generic placeholder
                  }}
                />
                <p className="image-upload-info">Image cannot be changed here. Contact support to update.</p>
              </div>
            )}

            {/* Stock */}
            <div className="form-group">
              <label>
                Stock *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                placeholder="Enter stock quantity"
                min="0"
                required
              />
            </div>

            {/* Prices */}
            <div className="price-inputs">
              <div className="form-group">
                <label>
                  Original Price (₹) *
                </label>
                <input
                  type="number"
                  name="original_price"
                  value={formData.original_price}
                  onChange={(e) => setFormData({...formData, original_price: e.target.value})}
                  placeholder="₹0.00"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  Discount Price (₹)
                </label>
                <input
                  type="number"
                  name="discount_price"
                  value={formData.discount_price}
                  onChange={(e) => setFormData({...formData, discount_price: e.target.value})}
                  placeholder="₹0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                placeholder="Enter product description"
              />
            </div>

            {/* Form Actions */}
            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={currentProduct ? handleEditProduct : handleAddProduct}
                disabled={isLoading}
                className="submit-btn"
              >
                {isLoading ? (
                  <span className="flex-center">
                    <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {currentProduct ? 'Updating...' : 'Submitting...'}
                  </span>
                ) : (
                  currentProduct ? 'Update Product' : 'Submit for Review'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="products-table-wrapper">
        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="products-table">
              <thead>
                <tr>
                  <th>
                    Product
                  </th>
                  <th>
                    Category
                  </th>
                  <th>
                    Stock
                  </th>
                  <th>
                    Price
                  </th>
                  <th className="text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-info">
                        {product.image && (
                          <div className="product-image-container">
                            <img 
                              className="product-image-thumb" 
                              src={product.image} 
                              alt={product.name}
                              onError={(e) => {
                                e.target.onerror = null; // Prevents infinite loop if placeholder also fails
                                e.target.src = 'https://placehold.co/48x48/CCCCCC/FFFFFF?text=NO+IMG'; // Generic placeholder
                              }}
                            />
                          </div>
                        )}
                        <div className="product-details">
                          <div className="product-name">{product.name}</div>
                          <div className="product-description">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-tag">
                        {product.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td>
                      <span className={`stock-tag ${
                        product.stock > 0 ? 'in-stock' : 'out-of-stock'
                      }`}>
                        {product.stock} {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td>
                      <div className="price-display">
                        {product.discount_price > 0 && product.discount_price < product.original_price ? (
                          <>
                            <span className="original-price">₹{product.original_price}</span>
                            <span className="discount-price">₹{product.discount_price}</span>
                          </>
                        ) : (
                          <span className="regular-price">₹{product.original_price}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="actions-group">
                        <button
                          onClick={() => openEditModal(product)}
                          className="action-btn edit-btn"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="action-btn delete-btn"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-products-message">
            <svg
              className="no-products-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3>No products</h3>
            <p>
              {searchTerm || filterCategory ? 'Try changing your search or filter' : 'Get started by adding a new product.'}
            </p>
            <div>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setIsFormOpen(true);
                }}
                className="add-first-product-btn"
              >
                <FiPlus />
                New Product
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProducts;
