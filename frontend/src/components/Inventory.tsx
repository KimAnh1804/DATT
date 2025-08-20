"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface Product {
  _id: string
  name: string
  unit: string
  stock: number
}

interface Transaction {
  _id: string
  product: {
    // This product object might be null if the product was deleted
    _id: string
    name: string
    unit: string
  } | null // Allow product to be null
  type: "import" | "export"
  quantity: number
  note: string
  createdAt: string
}

const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"import" | "export">("import")
  const [products, setProducts] = useState<Product[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    productId: "",
    quantity: 1,
    note: "",
  })

  useEffect(() => {
    fetchProducts()
    fetchTransactions()
  }, [])

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProducts(data)
        // Set default selected product if products are available and no product is selected
        if (data.length > 0 && !formData.productId) {
          setFormData((prev) => ({ ...prev, productId: data[0]._id }))
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/inventory/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/inventory/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          type: activeTab,
        }),
      })

      if (response.ok) {
        await fetchTransactions()
        await fetchProducts() // Refresh products to update stock
        resetForm()
        alert(`${activeTab === "import" ? "Nhập" : "Xuất"} kho thành công!`)
      } else {
        const error = await response.json()
        alert(error.message || "Có lỗi xảy ra!")
      }
    } catch (error) {
      console.error("Error creating transaction:", error)
      alert("Có lỗi xảy ra!")
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      productId: products.length > 0 ? products[0]._id : "", // Reset to first product or empty
      quantity: 1,
      note: "",
    })
  }

  const getSelectedProduct = () => {
    return products.find((p) => p._id === formData.productId)
  }

  if (loading) {
    return <div className="text-center py-8">Đang tải dữ liệu...</div>
  }

  const selectedProduct = getSelectedProduct() // Lấy sản phẩm đã chọn một lần

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý nhập/xuất kho</h1>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("import")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "import"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              📥 Nhập kho
            </button>
            <button
              onClick={() => setActiveTab("export")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "export"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              📤 Xuất kho
            </button>
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {activeTab === "import" ? "Tạo phiếu nhập kho" : "Tạo phiếu xuất kho"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Sản phẩm *</label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="form-input"
                required
              >
                <option value="">Chọn sản phẩm</option>
                {products.map((product) =>
                  // Thêm kiểm tra an toàn để đảm bảo product không phải là null/undefined
                  product ? (
                    <option key={product._id} value={product._id}>
                      {product.name} - Tồn kho: {product.stock} {product.unit}
                    </option>
                  ) : null,
                )}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Số lượng {activeTab === "import" ? "nhập" : "xuất"} *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="form-input"
                min="1"
                // Sử dụng optional chaining để truy cập stock một cách an toàn
                max={activeTab === "export" ? selectedProduct?.stock : undefined}
                required
              />
              {activeTab === "export" &&
                selectedProduct && ( // Kiểm tra selectedProduct trước khi hiển thị
                  <p className="text-sm text-gray-600 mt-1">
                    Tồn kho hiện tại: {selectedProduct.stock} {selectedProduct.unit}
                  </p>
                )}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">Ghi chú</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="form-input"
                rows={3}
                placeholder="Nhập ghi chú (tùy chọn)"
              />
            </div>

            <button
              type="submit"
              className={`w-full ${activeTab === "import" ? "btn-success" : "btn-primary"} disabled:opacity-50`}
              disabled={saving || !formData.productId} // Disable if no product is selected
            >
              {saving ? "Đang xử lý..." : activeTab === "import" ? "Tạo phiếu nhập" : "Tạo phiếu xuất"}
            </button>
          </form>
        </div>

        {/* Transaction History */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Lịch sử giao dịch</h2>

          <div className="max-h-96 overflow-y-auto">
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Chưa có giao dịch nào</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className={`p-3 rounded-lg border-l-4 ${
                      transaction.type === "import" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {transaction.type === "import" ? "📥 Nhập kho" : "📤 Xuất kho"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {transaction.product ? (
                            <>
                              {transaction.product.name} - {transaction.quantity} {transaction.product.unit}
                            </>
                          ) : (
                            <span className="text-red-500">Sản phẩm đã xóa - Số lượng: {transaction.quantity}</span>
                          )}
                        </p>
                        {transaction.note && <p className="text-sm text-gray-500 mt-1">Ghi chú: {transaction.note}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Thống kê tồn kho</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{products.length}</p>
            <p className="text-sm text-gray-600">Tổng số sản phẩm</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {transactions.filter((t) => t.type === "import").length}
            </p>
            <p className="text-sm text-gray-600">Lần nhập kho</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{transactions.filter((t) => t.type === "export").length}</p>
            <p className="text-sm text-gray-600">Lần xuất kho</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Inventory
