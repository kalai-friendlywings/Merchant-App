// SmartAddPage.jsx
import api from '../../../services/api';
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { toast } from 'react-toastify';
import styles from './SmartAddProduct.module.css';

const SmartAddProduct = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    api.get('/smart-add/categories/')
      .then((res) => setCategories(res.data))
      .catch(() => toast.error('Failed to load categories'));
  }, []);

  const handleCategorySelect = (id) => {
    setSelectedCategoryId(id);
    setSelectedProducts([]);
    api.get(`/smart-add/products/${id}/`)
      .then((res) => setProducts(res.data))
      .catch(() => toast.error('Failed to load products'));
  };

  const toggleProduct = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!selectedCategoryId || selectedProducts.length === 0) {
      toast.error('Select a category and at least one product');
      return;
    }

    api.post('/smart-add/bulk-add/', {
      category_id: selectedCategoryId,
      product_ids: selectedProducts,
    })
      .then((res) => {
        toast.success(`Successfully added ${res.data.added_count} products`);
        setProducts([]);
        setSelectedProducts([]);
      })
      .catch((err) => {
        if (err.response?.data?.product_ids) {
          toast.error(err.response.data.product_ids);
        } else {
          toast.error('Failed to add products');
        }
      });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Smart Add Products</h2>

      <div className={styles.categoryContainer}>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            className={`${styles.categoryButton} ${
              selectedCategoryId === cat.id ? styles.activeCategory : ''
            }`}
            onClick={() => handleCategorySelect(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      <div className={styles.productsGrid}>
        {products.map((product) => (
          <Card 
            key={product.id} 
            className={`${styles.productCard} ${
              selectedProducts.includes(product.id) ? styles.selectedProduct : ''
            }`}
          >
            <CardContent>
              <img 
                src={product.image} 
                alt={product.name} 
                className={styles.productImage} 
              />
              <h3 className={styles.productName}>{product.name}</h3>
              <p className={styles.productBrand}>{product.brand}</p>
              <p className={styles.productDescription}>{product.description}</p>
              <Button
                className={`${styles.productButton} ${
                  selectedProducts.includes(product.id) ? styles.removeButton : ''
                }`}
                onClick={() => toggleProduct(product.id)}
              >
                {selectedProducts.includes(product.id) ? 'Remove' : 'Add'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length > 0 && (
        <div className={styles.submitContainer}>
          <Button 
            className={styles.submitButton}
            onClick={handleSubmit}
          >
            Submit Selected Products
          </Button>
        </div>
      )}
    </div>
  );
};

export default SmartAddProduct;