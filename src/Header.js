import React, { useState, useContext } from "react";
import { ShoppingCart, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { CartContext } from "./CartContext";
import styles from "./Header.module.css";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, role, signOut } = useAuth();
  const { totalCartItems } = useContext(CartContext);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      setDropdownOpen(false);
      const result = await signOut();
      if (!result.error) {
        navigate('/');
      }
    } catch (error) {
      console.error('Sign out error in Header:', error);
    }
  };

  return (
    <header className={`${styles.header} bg-white shadow-sm sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          <h1 className="text-2xl font-bold text-teal-600">
            Mang <span className="text-gray-800">Store</span>
          </h1>
        </Link>
        <nav className="flex items-center gap-6">
          <Link to="/" className="hover:text-gray-600">Home</Link>
          <Link to="/productlist" className="hover:text-gray-600">Shop</Link>
          <Link to="/shoppingcart" className="hover:text-gray-600 relative">
            <ShoppingCart className="w-6 h-6" />
            {totalCartItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalCartItems}
              </span>
            )}
          </Link>
          <div className="relative">
            <User className="w-6 h-6 hover:text-gray-600 cursor-pointer" onClick={toggleDropdown} />
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10" onMouseLeave={closeDropdown}>
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-700">{user.email}</div>
                    {role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 hover:bg-gray-100" onClick={closeDropdown}>Admin Dashboard</Link>
                    )}
                    <button onClick={handleSignOut} className="w-full flex items-center px-4 py-2 text-left hover:bg-gray-100">
                      <LogOut className="mr-2 w-4 h-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-4 py-2 hover:bg-gray-100" onClick={closeDropdown}>Sign In</Link>
                    <Link to="/signup" className="block px-4 py-2 hover:bg-gray-100" onClick={closeDropdown}>Sign Up</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
