import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import ImageDropzone from '../components/ImageDropzone';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
}

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'living room',
    image_url: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProducts();
  }, [user, navigate]);

  async function loadProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error loading products');
    } else {
      setProducts(data || []);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    if (!newProduct.image_url) {
      toast.error('Please upload an image');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('products').insert([
      {
        ...newProduct,
        price: parseFloat(newProduct.price),
        user_id: user?.id
      }
    ]);

    if (error) {
      toast.error('Error adding product');
    } else {
      toast.success('Product added successfully');
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: 'living room',
        image_url: ''
      });
      loadProducts();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Error deleting product');
    } else {
      // Delete image from storage if it exists
      if (product.image_url) {
        const imagePath = product.image_url.split('/').pop();
        if (imagePath) {
          await supabase.storage
            .from('products')
            .remove([`product-images/${imagePath}`]);
        }
      }
      toast.success('Product deleted successfully');
      loadProducts();
    }
  }

  const handleImageUploaded = (url: string) => {
    setNewProduct(prev => ({ ...prev, image_url: url }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Add New Product</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Image</label>
              <div className="mt-1">
                <ImageDropzone onImageUploaded={handleImageUploaded} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                rows={3}
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                required
                min="0"
                step="0.01"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                required
                disabled={loading}
              >
                <option value="living room">Living Room</option>
                <option value="bedroom">Bedroom</option>
                <option value="dining">Dining</option>
                <option value="office">Office</option>
              </select>
            </div>
            
            <button
              type="submit"
              className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <Plus size={20} />
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
          </form>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Product List</h2>
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-500">${product.price}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-600 hover:text-red-800"
                  disabled={loading}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}