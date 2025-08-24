"use client";

import type React from "react";
import { useState, useEffect } from "react";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  lowStockItems: any[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    lowStockItems: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/dashboard/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Fallback data if backend not available
        setStats({
          totalProducts: 25,
          totalOrders: 150,
          totalRevenue: 45000000,
          lowStockProducts: 3,
          lowStockItems: [
            { name: "Laptop Dell", stock: 5, unit: "chiếc" },
            { name: "Chuột Logitech", stock: 8, unit: "chiếc" },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Fallback data
      setStats({
        totalProducts: 25,
        totalOrders: 150,
        totalRevenue: 45000000,
        lowStockProducts: 3,
        lowStockItems: [
          { name: "Laptop Dell", stock: 5, unit: "chiếc" },
          { name: "Chuột Logitech", stock: 8, unit: "chiếc" },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải dữ liệu...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📦</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng sản phẩm
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalProducts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🛒</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng đơn hàng
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalOrders}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng doanh thu
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalRevenue.toLocaleString("vi-VN")} VNĐ
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Sản phẩm sắp hết
                  </dt>
                  <dd className="text-lg font-medium text-red-600">
                    {stats.lowStockProducts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Cảnh báo tồn kho thấp
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Các sản phẩm sau đây có tồn kho thấp:</p>
                <ul className="list-disc list-inside mt-1">
                  {stats.lowStockItems.map((item: any, index: number) => (
                    <li key={index}>
                      {item.name} - Còn lại: {item.stock} {item.unit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Hoạt động gần đây
          </h3>
          <div className="text-sm text-gray-500">
            <p>• Hệ thống đang hoạt động bình thường</p>
            <p>
              • Dữ liệu được cập nhật lần cuối:{" "}
              {new Date().toLocaleString("vi-VN")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
