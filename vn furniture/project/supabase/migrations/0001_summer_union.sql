/*
  # Initial Schema Setup for Furniture Store

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `category` (text)
      - `image_url` (text)
      - `created_at` (timestamp)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `products` table
    - Add policies for:
      - Public read access
      - Admin write access
*/

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on products"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users with admin role to manage products
CREATE POLICY "Allow admin users to manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@example.com' -- Replace with actual admin email
    )
  );