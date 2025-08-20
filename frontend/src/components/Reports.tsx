"use client"

import type React from "react"
import { useState, useEffect } from "react"

// Định nghĩa lại các interface để đảm bảo kiểu dữ liệu chính xác
interface ProductItem {
  name: string
  unit?: string // Thêm unit nếu cần
  code?: string // Thêm code nếu cần
}

interface OrderItem {
  product: ProductItem
  quantity: number
  price: number
}

interface Order {
  _id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  items: OrderItem[]
  totalAmount: number
  status: "pending" | "completed" | "cancelled"
  createdAt: string
}

interface ReportData {
  totalOrders: number
  totalRevenue: number
  topProducts: Array<{
    name: string
    totalSold: number
    revenue: number
  }>
  monthlyStats: Array<{
    month: string
    orders: number
    revenue: number
  }>
  dailyStats: Array<{
    date: string
    orders: number
    revenue: number
  }>
  inventoryStats: {
    import: { totalTransactions: number; totalQuantity: number }
    export: { totalTransactions: number; totalQuantity: number }
  }
  lowStockProducts: Array<{
    name: string
    stock: number
    unit: string
    lowStockThreshold: number
  }>
  period: { startDate: string; endDate: string } | null
}

const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData>({
    totalOrders: 0,
    totalRevenue: 0,
    topProducts: [],
    monthlyStats: [],
    dailyStats: [],
    inventoryStats: {
      import: { totalTransactions: 0, totalQuantity: 0 },
      export: { totalTransactions: 0, totalQuantity: 0 },
    },
    lowStockProducts: [],
    period: null,
  })
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  })

  // Gán kiểu dữ liệu chính xác cho detailOrders
  const [showDetailList, setShowDetailList] = useState(false)
  const [detailOrders, setDetailOrders] = useState<Order[]>([])

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async (filters?: { startDate?: string; endDate?: string }) => {
    try {
      const token = localStorage.getItem("token")
      let url = "http://localhost:5000/api/reports"

      if (filters?.startDate && filters?.endDate) {
        url += `?startDate=${filters.startDate}&endDate=${filters.endDate}`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data: ReportData = await response.json()
        setReportData(data)

        // Fetch detailed orders for the same period
        const ordersResponse = await fetch(
          `http://localhost:5000/api/orders${filters?.startDate && filters?.endDate ? `?startDate=${filters.startDate}&endDate=${filters.endDate}` : ""}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (ordersResponse.ok) {
          const ordersData: Order[] = await ordersResponse.json()
          setDetailOrders(ordersData)
        } else {
          console.error("Failed to fetch detailed orders:", ordersResponse.statusText)
          setDetailOrders([]) // Clear if fetch fails
        }
      } else {
        console.error("Failed to fetch report data:", response.statusText)
        // Fallback data for demo
        setReportData({
          totalOrders: 45,
          totalRevenue: 125000000,
          topProducts: [
            { name: "Laptop Dell Inspiron 15", totalSold: 15, revenue: 270000000 },
            { name: "Chuột không dây Logitech", totalSold: 25, revenue: 11250000 },
            { name: "Bàn phím cơ Gaming", totalSold: 12, revenue: 14400000 },
          ],
          monthlyStats: [
            { month: "1/2024", orders: 12, revenue: 35000000 },
            { month: "2/2024", orders: 18, revenue: 45000000 },
            { month: "3/2024", orders: 15, revenue: 45000000 },
          ],
          dailyStats: [],
          inventoryStats: {
            import: { totalTransactions: 0, totalQuantity: 0 },
            export: { totalTransactions: 0, totalQuantity: 0 },
          },
          lowStockProducts: [],
          period: null,
        })

        // Fallback orders data
        setDetailOrders([
          {
            _id: "1",
            orderNumber: "ORD000001",
            customerName: "Nguyễn Văn A",
            customerPhone: "0123456789",
            totalAmount: 18000000,
            status: "completed",
            createdAt: new Date().toISOString(),
            items: [{ product: { name: "Laptop Dell" }, quantity: 1, price: 18000000 }],
          },
        ])
      }
    } catch (error) {
      console.error("Error fetching report data:", error)
      // Fallback data
      setReportData({
        totalOrders: 45,
        totalRevenue: 125000000,
        topProducts: [
          { name: "Laptop Dell Inspiron 15", totalSold: 15, revenue: 270000000 },
          { name: "Chuột không dây Logitech", totalSold: 25, revenue: 11250000 },
          { name: "Bàn phím cơ Gaming", totalSold: 12, revenue: 14400000 },
        ],
        monthlyStats: [
          { month: "1/2024", orders: 12, revenue: 35000000 },
          { month: "2/2024", orders: 18, revenue: 45000000 },
          { month: "3/2024", orders: 15, revenue: 45000000 },
        ],
        dailyStats: [],
        inventoryStats: {
          import: { totalTransactions: 0, totalQuantity: 0 },
          export: { totalTransactions: 0, totalQuantity: 0 },
        },
        lowStockProducts: [],
        period: null,
      })
      setDetailOrders([]) // Clear orders on error
    } finally {
      setLoading(false)
    }
  }

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (dateFilter.startDate && dateFilter.endDate) {
      setLoading(true)
      setShowDetailList(true)
      fetchReportData(dateFilter)
    } else {
      alert("Vui lòng chọn cả ngày bắt đầu và ngày kết thúc!")
    }
  }

  const clearFilter = () => {
    setDateFilter({ startDate: "", endDate: "" })
    setLoading(true)
    setShowDetailList(false) // Hide detailed list when clearing filter
    fetchReportData()
  }

  const exportToExcel = async () => {
    try {
      const token = localStorage.getItem("token")
      let url = "http://localhost:5000/api/reports/export"

      if (dateFilter.startDate && dateFilter.endDate) {
        url += `?startDate=${dateFilter.startDate}&endDate=${dateFilter.endDate}`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const filename = `bao-cao-${new Date().toISOString().split("T")[0]}.xlsx`
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
      } else {
        const errorText = await response.text()
        alert(`Lỗi khi xuất báo cáo: ${errorText || response.statusText}`)
      }
    } catch (error) {
      console.error("Error exporting Excel:", error)
      alert("Có lỗi xảy ra khi xuất báo cáo Excel.")
    }
  }

  if (loading) {
    return <div className="text-center py-8">Đang tải dữ liệu...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Báo cáo thống kê</h1>
        <button onClick={exportToExcel} className="btn-success">
          📊 Xuất Excel
        </button>
      </div>

      {/* Date Filter */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Bộ lọc thời gian</h2>
        <form onSubmit={handleFilterSubmit} className="flex gap-4 items-end">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Từ ngày</label>
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
              className="form-input"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Đến ngày</label>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
              className="form-input"
            />
          </div>
          <button type="submit" className="btn-primary">
            Lọc
          </button>
          <button type="button" onClick={clearFilter} className="btn-secondary">
            Xóa bộ lọc
          </button>
        </form>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Tổng đơn hàng</dt>
                  <dd className="text-lg font-medium text-gray-900">{reportData.totalOrders}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Tổng doanh thu</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {reportData.totalRevenue.toLocaleString("vi-VN")} VNĐ
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
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Doanh thu TB/đơn</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {reportData.totalOrders > 0
                      ? Math.round(reportData.totalRevenue / reportData.totalOrders).toLocaleString("vi-VN")
                      : 0}{" "}
                    VNĐ
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
                <span className="text-2xl">🏆</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">SP bán chạy nhất</dt>
                  <dd className="text-lg font-medium text-gray-900">{reportData.topProducts[0]?.totalSold || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Sản phẩm bán chạy</h2>
          <div className="space-y-4">
            {reportData.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-lg font-bold text-gray-500 mr-3">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">Đã bán: {product.totalSold} sản phẩm</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">{product.revenue.toLocaleString("vi-VN")} VNĐ</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Thống kê theo tháng</h2>
          <div className="space-y-4">
            {reportData.monthlyStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Tháng {stat.month}</p>
                  <p className="text-sm text-gray-600">{stat.orders} đơn hàng</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-blue-600">{stat.revenue.toLocaleString("vi-VN")} VNĐ</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simple Chart Visualization */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Biểu đồ doanh thu theo tháng</h2>
        <div className="space-y-3">
          {reportData.monthlyStats.map((stat, index) => {
            const maxRevenue = Math.max(...reportData.monthlyStats.map((s) => s.revenue))
            const percentage = maxRevenue > 0 ? (stat.revenue / maxRevenue) * 100 : 0

            return (
              <div key={index} className="flex items-center">
                <div className="w-20 text-sm text-gray-600">{stat.month}</div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-6 relative">
                    <div
                      className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${percentage}%` }}
                    >
                      <span className="text-white text-xs font-medium">{stat.revenue.toLocaleString("vi-VN")}</span>
                    </div>
                  </div>
                </div>
                <div className="w-16 text-sm text-gray-600 text-right">{stat.orders} đơn</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detailed Orders List */}
      {showDetailList && (
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Danh sách đơn hàng chi tiết
              {dateFilter.startDate && dateFilter.endDate && (
                <span className="text-sm text-gray-600 ml-2">
                  (Từ {new Date(dateFilter.startDate).toLocaleDateString("vi-VN")} đến{" "}
                  {new Date(dateFilter.endDate).toLocaleDateString("vi-VN")})
                </span>
              )}
            </h2>
            <button onClick={() => setShowDetailList(false)} className="text-gray-400 hover:text-gray-600">
              ✕ Đóng
            </button>
          </div>

          {detailOrders.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Không có đơn hàng nào trong khoảng thời gian này</p>
          ) : (
            <div className="table-responsive">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã đơn hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số điện thoại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {detailOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customerPhone}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.items?.map((item, index) => (
                          <div key={index} className="text-xs">
                            {item.product?.name} x{item.quantity}
                          </div>
                        )) || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.totalAmount?.toLocaleString("vi-VN")} VNĐ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.status === "completed" && <span className="badge-success">Hoàn thành</span>}
                        {order.status === "pending" && <span className="badge-warning">Chờ xử lý</span>}
                        {order.status === "cancelled" && <span className="badge-danger">Đã hủy</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Reports
