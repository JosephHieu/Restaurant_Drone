"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface User {
  email: string
  name: string
  phone?: string
  address?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => boolean
  register: (email: string, password: string, name: string, phone: string) => boolean
  logout: () => void
  updateProfile: (data: { name?: string; phone?: string; address?: string; password?: string }) => boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [registeredUsers, setRegisteredUsers] = useState<
    Array<{ email: string; password: string; name: string; phone: string; address?: string }>
  >([{ email: "hieu@gmail.com", password: "123456", name: "Hiệu", phone: "0123456789", address: "" }])

  const login = (email: string, password: string): boolean => {
    const user = registeredUsers.find((u) => u.email === email && u.password === password)
    if (user) {
      setUser({
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
      })
      return true
    }
    return false
  }

  const register = (email: string, password: string, name: string, phone: string): boolean => {
    // Check if email already exists
    if (registeredUsers.some((u) => u.email === email)) {
      return false
    }

    // Add new user
    setRegisteredUsers((prev) => [...prev, { email, password, name, phone, address: "" }])
    setUser({
      email,
      name,
      phone,
      address: "",
    })
    return true
  }

  const updateProfile = (data: { name?: string; phone?: string; address?: string; password?: string }): boolean => {
    if (!user) return false

    setRegisteredUsers((prev) =>
      prev.map((u) =>
        u.email === user.email
          ? {
              ...u,
              name: data.name || u.name,
              phone: data.phone || u.phone,
              address: data.address || u.address,
              password: data.password || u.password,
            }
          : u,
      ),
    )

    setUser((prev) =>
      prev
        ? {
            ...prev,
            name: data.name || prev.name,
            phone: data.phone || prev.phone,
            address: data.address || prev.address,
          }
        : null,
    )

    return true
  }

  const logout = () => {
    setUser(null)
  }

  const isAuthenticated = user !== null

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
