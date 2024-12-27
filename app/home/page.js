"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import axios from "axios";

export default function Home() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [showTicketForm, setShowTicketForm] = useState(false);
    const [ticketDetails, setTicketDetails] = useState({
        vehicleNumber: "",
        offense: "",
        fineAmount: ""
    });
    const [tickets, setTickets] = useState([]);
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
            const fetchUserData = async () => {
                try {
                    const response = await axios.get("/api/users", {
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                        },
                    });
    
                    if (user.role === "admin") {
                        setUserData(response.data);
                    } else if (user.role === "citizen" || user.role === "police") {
                        const userData = response.data.find(u => u.email === user.email);
                        setUserData(userData);
    
                        if (user.role === "citizen") {
                            if (userData.plateNumber) {
                                try {
                                    const ticketsResponse = await axios.get(`/api/tickets?plate=${userData.plateNumber}`, {
                                        headers: {
                                            Authorization: `Bearer ${user.token}`,
                                        },
                                    });
                                    setTickets(ticketsResponse.data);
                                } catch (error) {
                                    if (error.response && error.response.status === 404) {
                                        setTickets([]);
                                        console.warn("No tickets found for the plate number.");
                                    } else {
                                        console.error("Error fetching tickets:", error);
                                    }
                                }
                            } else {
                                console.warn("No plate number found for the user.");
                                setTickets([]);
                            }
                        }

                        
                        if (user.role === "police") {
                            try {
                                const ticketsResponse = await axios.get(`/api/tickets?createdBy=${user._id}`, {
                                    headers: {
                                        Authorization: `Bearer ${user.token}`,
                                    },
                                });
                                const policeTickets = ticketsResponse.data.filter(ticket =>  ticket.createdBy === user._id.toString());
                                setTickets(policeTickets);
                            } catch (error) {
                                console.error("Error fetching tickets for police:", error);
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error fetching users or tickets:", error);
                }
            };
    
            fetchUserData();
        }
    }, [user]);

    const handleTicketSubmit = async (e) => {
        e.preventDefault();

        const ticketData = {
            vehicleNumber: ticketDetails.vehicleNumber,
            offense: ticketDetails.offense,
            fineAmount: ticketDetails.fineAmount,
            createdBy: user._id,
        };

        try {
            const response = await axios.post("/api/tickets", ticketData);

            if (response.status === 200) {
                alert("Parking ticket created successfully!");
                setShowTicketForm(false);
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
        return null;
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

                        {user.role === "police" && (
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold">Your Created Tickets:</h3>
                                {tickets.length > 0 ? (
                                    <table className="min-w-full bg-white border">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-2 border">Vehicle Number</th>
                                                <th className="px-4 py-2 border">Offense</th>
                                                <th className="px-4 py-2 border">Fine Amount</th>
                                                <th className="px-4 py-2 border">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tickets.map(ticket => (
                                                <tr key={ticket._id}>
                                                    <td className="px-4 py-2 border">{ticket.vehicleNumber}</td>
                                                    <td className="px-4 py-2 border">{ticket.offense}</td>
                                                    <td className="px-4 py-2 border">{ticket.fineAmount}</td>
                                                    <td className="px-4 py-2 border">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>No tickets created by you.</p>
                                )}
                            </div>
                        )}

                        {user.role === "citizen" && (
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold">Your Tickets:</h3>
                                {tickets.length > 0 ? (
                                    <table className="min-w-full bg-white border">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-2 border">Vehicle Number</th>
                                                <th className="px-4 py-2 border">Offense</th>
                                                <th className="px-4 py-2 border">Fine Amount</th>
                                                <th className="px-4 py-2 border">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tickets.map(ticket => (
                                                <tr key={ticket._id}>
                                                    <td className="px-4 py-2 border">{ticket.vehicleNumber}</td>
                                                    <td className="px-4 py-2 border">{ticket.offense}</td>
                                                    <td className="px-4 py-2 border">{ticket.fineAmount}</td>
                                                    <td className="px-4 py-2 border">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>No tickets found.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
