"use client"

import { X, Plus, Minus, Trash2, ShoppingCart } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenLogin: () => void
}

export default function CartModal({ isOpen, onClose, onOpenLogin }: CartModalProps) {
  const { cartItems, updateQuantity, removeFromCart } = useCart()
  const { isAuthenticated } = useAuth()

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const discountedPrice = item.price * (1 - (item.discount || 0) / 100)
      return total + discountedPrice * item.quantity
    }, 0)
  }

  const calculateSavings = () => {
    return cartItems.reduce((savings, item) => {
      const discountAmount = ((item.price * (item.discount || 0)) / 100) * item.quantity
      return savings + discountAmount
    }, 0)
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      onOpenLogin()
      onClose()
    } else {
      // Proceed with checkout
      alert("Tiến hành thanh toán")
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Modal */}
        <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <h2 className="text-xl font-bold">Giỏ hàng của bạn</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
              <X size={24} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ShoppingCart size={48} className="mb-2 opacity-50" />
                <p>Giỏ hàng của bạn trống</p>
              </div>
            ) : (
              cartItems.map((item) => {
                const discountedPrice = item.price * (1 - (item.discount || 0) / 100)
                return (
                  <div key={item.id} className="flex gap-3 border border-gray-200 rounded-lg p-3">
                    {/* Image */}
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />

                    {/* Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {item.discount ? (
                          <>
                            <span className="text-red-500 font-bold">{discountedPrice.toLocaleString()}đ</span>
                            <span className="text-xs text-gray-400 line-through">{item.price.toLocaleString()}đ</span>
                          </>
                        ) : (
                          <span className="text-red-500 font-bold">{item.price.toLocaleString()}đ</span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 rounded transition"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-6 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded transition"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-auto p-1 hover:bg-red-50 rounded transition text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-3">
              {/* Savings */}
              {calculateSavings() > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Tiết kiệm:</span>
                  <span className="font-semibold">{calculateSavings().toLocaleString()}đ</span>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
                <span>Tổng cộng:</span>
                <span className="text-red-500">{calculateTotal().toLocaleString()}đ</span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition"
              >
                Thanh toán
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
