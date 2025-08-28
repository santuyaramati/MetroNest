import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { MapPin, Menu, X, User, LogOut, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">
              <span className="text-gray-800 dark:text-white">Metro</span>
              <span className="text-primary">Nest</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">®</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/rooms"
              className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
            >
              Find Rooms
            </Link>
            <Link
              to="/flatmates"
              className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
            >
              Find Roommates
            </Link>
            <Link
              to="/pgs"
              className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
            >
              PGs
            </Link>
            <Link
              to="/post-listing"
              className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
            >
              Post Listing
            </Link>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-gray-700 dark:text-gray-300 hover:text-primary"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                >
                  <User size={16} />
                  <span className="hidden lg:inline">Hello, {user?.name}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary"
                >
                  <LogOut size={16} className="mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
              >
                Login / Register
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/rooms"
                className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Rooms
              </Link>
              <Link
                to="/flatmates"
                className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Roommates
              </Link>
              <Link
                to="/pgs"
                className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                PGs
              </Link>
              <Link
                to="/post-listing"
                className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Post Listing
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  toggleTheme();
                  setIsMenuOpen(false);
                }}
                className="text-gray-700 dark:text-gray-300 hover:text-primary w-full justify-start"
              >
                {theme === 'dark' ? <Sun size={16} className="mr-2" /> : <Moon size={16} className="mr-2" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </Button>
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary py-2 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={16} />
                    <span>Hello, {user?.name}</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-700 dark:text-gray-300 hover:text-primary w-full justify-start"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login / Register
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
