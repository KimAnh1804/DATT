"use client";

import type React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/products", label: "Sản phẩm", icon: "📦" },
    { path: "/orders", label: "Đơn hàng", icon: "🛒" },
    { path: "/inventory", label: "Nhập/Xuất kho", icon: "📋" },
    { path: "/reports", label: "Báo cáo", icon: "📈" },
  ];

  // if (user?.role === "admin") {
  //   menuItems.push({ path: "/users", label: "Quản lý người dùng", icon: "👥" })
  // }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Initation Việt Nam - Quản lý kho hàng
              </h1>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <span className="text-sm font-medium">
                  {user?.role === "admin" ? "Admin" : "User"}
                </span>
                <span className="text-lg">👤</span>

                {/* <span className="text-sm font-medium">
                  {user?.username} ({user?.role === "admin" ? "Admin" : "User"})
                </span>
                <span className="text-lg">👤</span> */}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  {/* <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Thông tin cá nhân
                  </Link>
                  <Link
                    to="/change-password"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Đổi mật khẩu
                  </Link> */}
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 text-gray-700 p-2 rounded-lg hover:bg-gray-100 ${
                      location.pathname === item.path
                        ? "bg-blue-100 text-blue-700"
                        : ""
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
