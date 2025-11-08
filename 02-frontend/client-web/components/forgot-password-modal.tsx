"use client"

import type React from "react"
import { useState } from "react"
import { X, Mail, ArrowLeft } from "lucide-react"

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onBackToLogin: () => void
}

export default function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState<"email" | "code" | "password">("email")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      setStep("code")
    }, 1000)
  }

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (code.length !== 6) {
      setError("Mã xác nhận phải có 6 chữ số")
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      setStep("password")
    }, 1000)
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu không khớp")
      return
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự")
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      setSuccess(true)
      setTimeout(() => {
        onClose()
        onBackToLogin()
      }, 1500)
    }, 1000)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              {step !== "email" && (
                <button
                  onClick={() => {
                    if (step === "code") setStep("email")
                    if (step === "password") setStep("code")
                  }}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <h2 className="text-2xl font-bold text-gray-900">Quên mật khẩu</h2>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition">
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <div className="p-6">
            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm text-center">
                Đặt lại mật khẩu thành công! Đang chuyển hướng...
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            {/* Step 1: Email */}
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <p className="text-gray-600 text-sm mb-4">
                  Nhập email của bạn và chúng tôi sẽ gửi mã xác nhận để đặt lại mật khẩu.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white font-semibold py-2 rounded-lg transition"
                >
                  {isLoading ? "Đang gửi..." : "Gửi mã xác nhận"}
                </button>
              </form>
            )}

            {/* Step 2: Verification Code */}
            {step === "code" && (
              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <p className="text-gray-600 text-sm mb-4">Nhập mã xác nhận được gửi đến email của bạn.</p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mã xác nhận</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-center text-2xl tracking-widest"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white font-semibold py-2 rounded-lg transition"
                >
                  {isLoading ? "Đang xác nhận..." : "Xác nhận"}
                </button>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === "password" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <p className="text-gray-600 text-sm mb-4">Nhập mật khẩu mới của bạn.</p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white font-semibold py-2 rounded-lg transition"
                >
                  {isLoading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
                </button>
              </form>
            )}

            {/* Back to Login */}
            {step === "email" && (
              <p className="text-center text-gray-600 text-sm mt-4">
                Quay lại{" "}
                <button onClick={onBackToLogin} className="text-red-500 hover:text-red-600 font-medium">
                  đăng nhập
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
