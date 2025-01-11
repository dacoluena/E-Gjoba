"use client";

import axios from "axios";
import { useState } from "react";
import { useRouter } from 'next/navigation';

export default function Signup() {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState(""); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [plateNumber, setPlateNumber] = useState("");
    const [role, setRole] = useState("citizen");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/signup", {
                name,
                surname,  
                email,
                password,
                plateNumber, 
                role, 
            });

            if (response.status === 200) {
                router.push("/login");
            }
        } catch (error) {
            console.error("Error during signup:", error);

            if (error.response && error.response.status === 409) {
                alert("This email is already registered. Please use a different email.");
            } else {
                alert("Signup failed. Please try again.");
            }
        }
    };

    const handleLoginedirect = () => {
        router.push("/login");
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "#0f4050" }}>
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-4 text-gray-800">Sign Up</h1>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="name">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            required
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-red-400"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="surname">
                            Surname
                        </label>
                        <input
                            type="text"
                            id="surname"
                            value={surname}
                            required
                            onChange={(e) => setSurname(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-red-400"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            required
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-red-400"
                        />
                    </div>

                    <div className="mb-4 relative">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                            Password
                        </label>
                        <input
                            type={showPassword ? "text" : "password"} 
                            id="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-red-400"
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute inset-y-0 right-0 px-3 py-8 text-gray-500"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="role">
                            Role
                        </label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-red-400"
                        >
                            <option value="citizen">Citizen</option>
                            <option value="police">Police</option>
                        </select>
                    </div>
                
                    {role === "citizen" && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700" htmlFor="plateNumber">
                                Plate Number (Optional)
                            </label>
                            <input
                                type="text"
                                id="plateNumber"
                                value={plateNumber}
                                onChange={(e) => setPlateNumber(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-red-400"
                            />
                        </div>
                    )}

                    <button
                        type="submit" 
                        className="w-full bg-red-500 text-white font-medium py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300"
                    >
                        Sign Up
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Already a user?{" "}
                        <span
                            onClick={handleLoginedirect}
                            className="text-red-500 cursor-pointer hover:underline"
                        >
                            Login
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}  
