"use client"

import axios from "axios"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, User, UserPlus, Car, ArrowLeft } from "lucide-react"

export default function Signup() {
  const [name, setName] = useState("")
  const [surname, setSurname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [plateNumber, setPlateNumber] = useState("")
  const [role, setRole] = useState("citizen")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axios.post("/api/signup", {
        name,
        surname,
        email,
        password,
        plateNumber,
        role,
      })

      if (response.status === 200) {
        router.push("/login")
      }
    } catch (error) {
      console.error("Error during signup:", error)

      if (error.response && error.response.status === 409) {
        alert("This email is already registered. Please use a different email.")
      } else {
        alert("Signup failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginRedirect = () => {
    router.push("/login")
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0f4050] to-[#072530] p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm">
            <Car className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">E-Gjoba</h1>
          <p className="text-slate-300 text-center max-w-xs">Create your account to get started</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl border-0 overflow-hidden dark:bg-slate-900">
          <div className="p-6 space-y-1 border-b dark:border-slate-700">
            <div className="flex items-center justify-between">
              <button
                className="h-8 w-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
                onClick={handleLoginRedirect}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to login</span>
              </button>
              <h2 className="text-2xl font-bold text-center flex-1 mr-8">Sign Up</h2>
            </div>
            <p className="text-sm text-gray-500 text-center">Enter your information to create an account</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    id="name"
                    placeholder="John"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="surname" className="block text-sm font-medium">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    id="surname"
                    placeholder="Doe"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-medium">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="citizen">Citizen</option>
                <option value="police">Police</option>
              </select>
            </div>

            {role === "citizen" && (
              <div className="space-y-2">
                <label htmlFor="plateNumber" className="block text-sm font-medium">
                  Plate Number <span className="text-gray-500">(Optional)</span>
                </label>
                <div className="relative">
                  <Car className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    id="plateNumber"
                    placeholder="AA123BB"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Create Account</span>
                  </div>
                )}
              </button>

              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={handleLoginRedirect}
                  className="text-red-500 font-medium hover:underline"
                >
                  Log in
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} E-Gjoba. All rights reserved.
        </div>
      </div>
    </div>
  )
}

