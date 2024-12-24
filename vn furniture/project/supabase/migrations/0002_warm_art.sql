/*
  # Add cart and profile features

  1. New Tables
    - `profiles` for user profile information
    - `cart_items` for shopping cart functionality
  
  2. Updates
    - Add new categories to products table
    
  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  full_name text,
  address text,
  phone text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  product_id uuid REFERENCES products NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Cart policies
CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into own cart"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from own cart"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update existing products to a valid category before adding constraint
UPDATE products SET category = 'Furniture' WHERE category NOT IN (
  'Sofa',
  'Furniture',
  'Furniture Cushion',
  'Cot headboard cushion',
  'Home appliances',
  'Sofa Repair and service',
  'Electronics',
  'Kitchenware',
  'Tv stand',
  'Cupboard',
  'Utensils',
  'Curtains'
);

-- Now add the constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products ADD CONSTRAINT products_category_check 
  CHECK (category IN (
    'Sofa',
    'Furniture',
    'Furniture Cushion',
    'Cot headboard cushion',
    'Home appliances',
    'Sofa Repair and service',
    'Electronics',
    'Kitchenware',
    'Tv stand',
    'Cupboard',
    'Utensils',
    'Curtains'
  ));