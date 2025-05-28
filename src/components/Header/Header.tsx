'use client';
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FiUser } from "react-icons/fi";
import { useState } from "react";

const Header = () => {
  const router = useRouter();
  const { isLoggedIn, userEmail, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login"); // Redirect to login page
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  }

  return (
    <header className="bg-gray-800 text-white">
      {isLoggedIn ? (
        <nav className="container mx-auto flex items-center justify-between py-4 px-6">
          {/* Logo */}
          <div className="text-2xl font-bold">
            <Link href={"/"}>WikiTime</Link>
          </div>
          {/* Navigation Links */}
          <ul className="hidden md:flex space-x-6">
            <li>
              <Link href={"/"}>Home</Link>
            </li>
            <li>
              <Link href={"/"}>About</Link>
            </li>
            <li>
            <Link href={"/"}></Link>
            </li>
            <li>
            <Link href={"/"}></Link>
            </li>
          </ul>

          <div className="relative">
            <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded"
            onClick={toggleMenu}>
              {userEmail &&  <FiUser className="inline-block mr-2" />}
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 shadow-md rounded"
            hidden={!showMenu}>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => router.push(`/user/edit`)} // Redirect to edit profile page
              >
                Edit Profile
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
      ) : (
        <nav className="container mx-auto flex items-center justify-between py-4 px-6">
          {/* Logo */}
          <div className="text-2xl font-bold">
            <Link href={"/"}>WikiTime</Link>

          </div>

          {/* Navigation Links */}
          <ul className="hidden md:flex space-x-6">
            <li>
              <a href="#home" className="hover:text-gray-300">Home</a>
            </li>
            <li>
              <a href="#about" className="hover:text-gray-300">About</a>
            </li>
            <li>
              <a href="#services" className="hover:text-gray-300">Services</a>
            </li>
            <li>
              <a href="#contact" className="hover:text-gray-300">Contact</a>
            </li>
          </ul>

          <div className="space-x-4">
            <Link href="/login">
              <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                Login
              </button>
            </Link>
            <Link href="/register">
              <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
                Sign Up
              </button>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;