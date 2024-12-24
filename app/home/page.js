"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import axios from "axios";

export default function Home() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null); // To store the fetched user data
    const [showTicketForm, setShowTicketForm] = useState(false); // To toggle the ticket creation form
    const [ticketDetails, setTicketDetails] = useState({
        vehicleNumber: "",
        offense: "",
        fineAmount: ""
    }); // To store the ticket form details
    const router = useRouter();

    useEffect(() => {
        const userDataFromLocalStorage = JSON.parse(localStorage.getItem("user"));
        if (!userDataFromLocalStorage) {
            router.push("/login"); 
        } else {
            setUser(userDataFromLocalStorage);
        }
    }, [router]);

    useEffect(() => {
        if (user) {
            // Fetch user data based on the role
            const fetchUserData = async () => {
                try {
                    const response = await axios.get("/api/users", {
                        headers: {
                            Authorization: `Bearer ${user.token}`, // Pass token if you're using JWT
                        },
                    });

                    if (user.role === "admin") {
                        // If the user is an admin, show all users
                        setUserData(response.data);
                    } else if (user.role === "citizen" || user.role === "police") {
                        // If the user is citizen or police, show only their own data
                        const userData = response.data.find(u => u.email === user.email);
                        setUserData(userData);
                    }
                } catch (error) {
                    console.error("Error fetching users:", error);
                }
            };

            fetchUserData();
        }
    }, [user]);

    // Handle ticket form submission
    const handleTicketSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/tickets", ticketDetails, {
                headers: {
                    Authorization: `Bearer ${user.token}`, // Use the token for authentication
                }
            });

            if (response.status === 200) {
                alert("Parking ticket created successfully!");
                setShowTicketForm(false); // Hide the form after successful submission
            }
        } catch (error) {
            console.error("Error creating ticket:", error);
            alert("Failed to create the ticket.");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTicketDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value
        }));
    };

    if (!user) {
        return null; // You can render a loading screen if necessary
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                <div className="text-2xl font-bold">E-Gjoba</div>
                <div className="flex items-center">
                    <span className="mr-4">Hello, {user ? user.name : "User"}!</span>
                    <button
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
                        onClick={() => {
                            localStorage.removeItem("user");
                            router.push("/login");
                        }}
                    >
                        Log out
                    </button>
                </div>
            </div>

            <div className="p-6">
                <h2 className="text-3xl font-semibold mb-4">Dashboard</h2>
                <div className="bg-white shadow-md p-6 rounded-lg">
                    <h3 className="text-2xl font-semibold">Welcome to your Dashboard</h3>
                    <p className="mt-4 text-gray-700">Here you can manage your account and view your activity.</p>

                    {user.role === "admin" ? (
                        <div>
                            <h3 className="mt-6 text-xl font-semibold">All Users:</h3>
                            {/* Admin Table to Display Users */}
                            <div className="overflow-x-auto mt-4">
                                <table className="min-w-full table-auto">
                                    <thead>
                                        <tr className="bg-gray-200 text-left">
                                            <th className="px-4 py-2 text-sm font-semibold text-gray-700">Name</th>
                                            <th className="px-4 py-2 text-sm font-semibold text-gray-700">Email</th>
                                            <th className="px-4 py-2 text-sm font-semibold text-gray-700">Role</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userData && userData.map((user) => (
                                            <tr key={user.email} className="border-t">
                                                <td className="px-4 py-2 text-sm text-gray-700">{user.name}</td>
                                                <td className="px-4 py-2 text-sm text-gray-700">{user.email}</td>
                                                <td className="px-4 py-2 text-sm text-gray-700">{user.role}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h3 className="mt-6 text-xl font-semibold">Your Data:</h3>
                            {userData ? (
                                <div>
                                    <p>Name: {userData.name}</p>
                                    <p>Email: {userData.email}</p>
                                    <p>Role: {userData.role}</p>
                                </div>
                            ) : (
                                <p>Loading your data...</p>
                            )}

                            {/* Show the "Create" button only for police role */}
                            {user.role === "police" && (
                                <div className="mt-6">
                                    <button
                                        className="bg-blue-500 text-white py-2 px-4 rounded-md"
                                        onClick={() => setShowTicketForm(!showTicketForm)}
                                    >
                                        {showTicketForm ? "Cancel" : "Create Parking Ticket"}
                                    </button>
                                </div>
                            )}

                            {/* Show the form for creating a parking ticket */}
                            {user.role === "police" && showTicketForm && (
                                <div className="mt-6 bg-white shadow-md p-6 rounded-lg">
                                    <h4 className="text-xl font-semibold">Create Parking Ticket</h4>
                                    <form onSubmit={handleTicketSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700">Vehicle Number</label>
                                            <input
                                                type="text"
                                                id="vehicleNumber"
                                                name="vehicleNumber"
                                                value={ticketDetails.vehicleNumber}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="offense" className="block text-sm font-medium text-gray-700">Offense</label>
                                            <input
                                                type="text"
                                                id="offense"
                                                name="offense"
                                                value={ticketDetails.offense}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="fineAmount" className="block text-sm font-medium text-gray-700">Fine Amount</label>
                                            <input
                                                type="number"
                                                id="fineAmount"
                                                name="fineAmount"
                                                value={ticketDetails.fineAmount}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="mt-4">
                                            <button
                                                type="submit"
                                                className="bg-green-500 text-white py-2 px-4 rounded-md"
                                            >
                                                Submit Ticket
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
