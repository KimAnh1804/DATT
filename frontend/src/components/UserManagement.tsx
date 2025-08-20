"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"

interface User {
  _id: string
  username: string
  role: string
  email?: string
  fullName?: string
  isActive: boolean
  createdAt: string
  lastLogin?: string
}

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [message, setMessage] = useState("")
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "user",
    email: "",
    fullName: "",
  })

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchUsers()
    }
  }, [currentUser])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/auth/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
    setLoading(false)
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/auth/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Tạo người dùng thành công!")
        setShowCreateForm(false)
        setFormData({
          username: "",
          password: "",
          role: "user",
          email: "",
          fullName: "",
        })
        fetchUsers()
      } else {
        setMessage(data.message || "Có lỗi xảy ra khi tạo người dùng")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      setMessage("Có lỗi xảy ra khi tạo người dùng")
    }
    setLoading(false)
  }

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/auth/users/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        fetchUsers()
        setMessage(`${!isActive ? "Kích hoạt" : "Vô hiệu hóa"} người dùng thành công!`)
      }
    } catch (error) {
      console.error("Error updating user status:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (currentUser?.role !== "admin") {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Bạn không có quyền truy cập trang này.</p>
      </div>
    )
  }

  if (loading && users.length === 0) {
    return <div className="flex justify-center items-center h-64">Đang tải...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
        <button onClick={() => setShowCreateForm(true)} className="btn-primary">
          Thêm người dùng
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded ${message.includes("thành công") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {message}
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Tạo người dùng mới</h2>
          <form onSubmit={handleCreateUser}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò *</label>
                <select name="role" value={formData.role} onChange={handleInputChange} className="form-input">
                  <option value="user">Người dùng</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-4">
              <button type="submit" className="btn-primary">
                Tạo người dùng
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setFormData({
                    username: "",
                    password: "",
                    role: "user",
                    email: "",
                    fullName: "",
                  })
                }}
                className="btn-secondary"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người dùng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vai trò
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đăng nhập cuối
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.fullName || user.username}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.isActive ? "Hoạt động" : "Vô hiệu hóa"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("vi-VN") : "Chưa đăng nhập"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {user._id !== currentUser?.id && (
                    <button
                      onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                      className={`${
                        user.isActive ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"
                      }`}
                    >
                      {user.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserManagement
