import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    image_url: string;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  loading: boolean;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadCartItems = async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          product:products (
            name,
            price,
            image_url
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error: any) {
      toast.error('Error loading cart');
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCartItems();
  }, [user]);

  const addToCart = async (productId: string) => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .insert([{ user_id: user.id, product_id: productId }])
        .select(`
          id,
          product_id,
          quantity,
          product:products (
            name,
            price,
            image_url
          )
        `)
        .single();

      if (error) throw error;
      
      setCartItems([...cartItems, data]);
      toast.success('Added to cart');
    } catch (error: any) {
      toast.error('Error adding to cart');
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;

      setCartItems(cartItems.filter(item => item.id !== cartItemId));
      toast.success('Removed from cart');
    } catch (error: any) {
      toast.error('Error removing from cart');
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId);

      if (error) throw error;

      setCartItems(cartItems.map(item => 
        item.id === cartItemId ? { ...item, quantity } : item
      ));
    } catch (error: any) {
      toast.error('Error updating quantity');
      console.error('Error updating quantity:', error);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + (item.product.price * item.quantity),
    0
  );

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      loading,
      total
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}