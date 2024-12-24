import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sofa, ShoppingCart, LogIn, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Sofa className="w-8 h-8" />
            <span className="text-xl font-bold">VN Furniture</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-black">
              Home
            </Link>
            {user ? (
              <>
                {user.email === 'admin@example.com' && (
                  <Link to="/admin" className="text-gray-700 hover:text-black">
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-700 hover:text-black"
                >
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center space-x-1 text-gray-700 hover:text-black"
                >
                  <LogIn size={20} />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center space-x-1 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800"
                >
                  Sign Up
                </Link>
              </>
            )}
            <button className="relative">
              <ShoppingCart
                size={24}
                className="text-gray-700 hover:text-black"
              />
              <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                0
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
