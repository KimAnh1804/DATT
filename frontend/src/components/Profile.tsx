"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"

interface UserProfile {
  id: string
  username: string
  role: string
  email?: string
  fullName?: string
  createdAt: string
}

const Profile: React.FC = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setFormData({
          email: data.user.email || "",
          fullName: data.user.fullName || "",
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setIsEditing(false)
        setMessage("Cập nhật thông tin thành công!")
      } else {
        setMessage("Có lỗi xảy ra khi cập nhật thông tin")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage("Có lỗi xảy ra khi cập nhật thông tin")
    }
    setLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (!profile) {
    return <div className="flex justify-center items-center h-64">Đang tải...</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn-primary">
              Chỉnh sửa
            </button>
          )}
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded ${message.includes("thành công") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {message}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleUpdateProfile}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                <input type="text" value={profile.username} disabled className="form-input bg-gray-100" />
                <p className="text-sm text-gray-500 mt-1">Không thể thay đổi tên đăng nhập</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                <input
                  type="text"
                  value={profile.role === "admin" ? "Quản trị viên" : "Người dùng"}
                  disabled
                  className="form-input bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Nhập địa chỉ email"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setFormData({
                    email: profile.email || "",
                    fullName: profile.fullName || "",
                  })
                  setMessage("")
                }}
                className="btn-secondary"
              >
                Hủy
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
              <p className="text-gray-900">{profile.username}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
              <p className="text-gray-900">{profile.role === "admin" ? "Quản trị viên" : "Người dùng"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <p className="text-gray-900">{profile.fullName || "Chưa cập nhật"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{profile.email || "Chưa cập nhật"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo tài khoản</label>
              <p className="text-gray-900">{new Date(profile.createdAt).toLocaleDateString("vi-VN")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
