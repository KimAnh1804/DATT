"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface Product {
  _id: string
  code: string
  name: string
  category: string
  unit: string
  importPrice: number
  sellPrice: number
  stock: number
  lowStockThreshold: number
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
    unit: "",
    importPrice: 0,
    sellPrice: 0,
    stock: 0,
    lowStockThreshold: 10,
  })

  // Thêm state mới sau các state hiện có
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  // Thêm function lọc sản phẩm
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Lấy danh sách categories unique
  const categories = [...new Set(products.map((product) => product.category))]

  useEffect(() => {
    fetchProducts()
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
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = localStorage.getItem("token")
      const url = editingProduct
        ? `http://localhost:5000/api/products/${editingProduct._id}`
        : "http://localhost:5000/api/products"

      const method = editingProduct ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchProducts() // Refresh the list
        setShowModal(false)
        resetForm()
        alert(editingProduct ? "Cập nhật sản phẩm thành công!" : "Thêm sản phẩm thành công!")
      } else {
        const error = await response.json()
        alert(error.message || "Có lỗi xảy ra!")
      }
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Có lỗi xảy ra khi lưu sản phẩm!")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      code: product.code,
      name: product.name,
      category: product.category,
      unit: product.unit,
      importPrice: product.importPrice,
      sellPrice: product.sellPrice,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`http://localhost:5000/api/products/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          await fetchProducts()
          alert("Xóa sản phẩm thành công!")
        } else {
          alert("Có lỗi xảy ra khi xóa sản phẩm!")
        }
      } catch (error) {
        console.error("Error deleting product:", error)
        alert("Có lỗi xảy ra khi xóa sản phẩm!")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      category: "",
      unit: "",
      importPrice: 0,
      sellPrice: 0,
      stock: 0,
      lowStockThreshold: 10,
    })
    setEditingProduct(null)
  }

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock === 0) return { text: "Hết hàng", class: "badge-danger" }
    if (stock <= threshold) return { text: "Sắp hết", class: "badge-warning" }
    return { text: "Còn hàng", class: "badge-success" }
  }

  if (loading) {
    return <div className="text-center py-8">Đang tải dữ liệu...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
        <button onClick={openAddModal} className="btn-primary">
          + Thêm sản phẩm
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Tìm kiếm</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              placeholder="Tìm theo tên hoặc mã sản phẩm..."
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Danh mục</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("")
              }}
              className="btn-secondary"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="table-responsive">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã SP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn vị
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá nhập
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá bán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số lượng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const status = getStockStatus(product.stock, product.lowStockThreshold)
                return (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.importPrice.toLocaleString("vi-VN")} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.sellPrice.toLocaleString("vi-VN")} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={product.stock <= product.lowStockThreshold ? "text-red-600 font-bold" : ""}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={status.class}>{status.text}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Mã sản phẩm *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="form-input"
                    required
                    disabled={!!editingProduct}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Tên sản phẩm *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Danh mục *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Đơn vị tính *</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Giá nhập (VNĐ) *</label>
                  <input
                    type="number"
                    value={formData.importPrice}
                    onChange={(e) => setFormData({ ...formData, importPrice: Number(e.target.value) })}
                    className="form-input"
                    required
                    min="0"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Giá bán (VNĐ) *</label>
                  <input
                    type="number"
                    value={formData.sellPrice}
                    onChange={(e) => setFormData({ ...formData, sellPrice: Number(e.target.value) })}
                    className="form-input"
                    required
                    min="0"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Số lượng tồn kho *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="form-input"
                    required
                    min="0"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Ngưỡng cảnh báo tồn kho</label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                    className="form-input"
                    min="0"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" disabled={saving}>
                    Hủy
                  </button>
                  <button type="submit" className="btn-primary disabled:opacity-50" disabled={saving}>
                    {saving ? "Đang lưu..." : editingProduct ? "Cập nhật" : "Thêm"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products
