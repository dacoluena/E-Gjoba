"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import axios from "axios";
import PhotoCard from "../../models/Photo";
import FunctionField from 'react'

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
                                const policeTickets = ticketsResponse.data.filter(ticket => ticket.createdBy === user._id.toString());
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

    const [files, setFiles] = useState([]);

    const handleInputFile = (e) => {
        const files = e.target.files;
        console.log(files);

        const newFiles = [...files].filter(file => {
            if (file.size < 1024 * 1024 && file.type.startsWith('image/')) {
                return file;
            }
        });


        setFiles(newFiles);
    };

    const handleCancel = () => {
        setShowTicketForm(false);
        setFiles([]);

        const fileInput = document.getElementById('photo');
        if (fileInput) fileInput.value = ''; // Reset the file input value
    };

    async function uploadPhoto(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            return response.data.filename;
        } catch (error) {
            console.error('Error uploading photo:', error);
            throw error;
        }
    }

    const handleTicketSubmit = async (e) => {
        e.preventDefault();

        try {
            // Upload images first
            const imagePromises = files.map(file => uploadPhoto(file));
            const uploadedImageNames = await Promise.all(imagePromises);

            const ticketData = {
                vehicleNumber: ticketDetails.vehicleNumber,
                offense: ticketDetails.offense,
                fineAmount: ticketDetails.fineAmount,
                createdBy: user._id,
                imageUrls: uploadedImageNames,
            };

            const response = await axios.post("/api/tickets", ticketData);

            if (response.status === 200) {
                setShowTicketForm(false);
                setFiles([]);
                window.location.reload();
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
        <div className="h-screen bg-gray-100 flex flex-col">
            <div className="bg-[#032b38] text-white p-4 flex justify-between items-center">
                <div className="text-2xl font-bold">E-Gjoba</div>
                <div className="flex items-center">
                    <span className="mr-4">Hello, {user ? user.name : "User"}!</span>
                    <button
                        className="bg-[#ed174e] hover:bg-[#ed174e] text-white py-2 px-4 rounded-md"
                        onClick={() => {
                            localStorage.removeItem("user");
                            router.push("/login");
                        }}
                    >
                        Log out
                    </button>
                </div>
            </div>

            <div className="flex-1 p-6 bg-[#0A4356] overflow-auto">
                <div className="bg-[#053d4f] text-white shadow-md p-6 rounded-lg">
                    <div>
                        <h3 className="mt-6 text-xl font-semibold">Your Data:</h3>
                        {userData ? (
                            <div>
                                <p>Name : {userData.name}</p>
                                <p>Email: {userData.email}</p>
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

                        {/* Popup Modal for Ticket Form */}
                        {showTicketForm && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                                <div className="bg-[#053d4f] text-white p-8 rounded-lg w-96">
                                    <h4 className="text-xl font-semibold">Create Parking Ticket</h4>
                                    <form onSubmit={handleTicketSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="vehicleNumber" className="block text-sm font-medium">Vehicle Number</label>
                                            <input
                                                type="text"
                                                id="vehicleNumber"
                                                name="vehicleNumber"
                                                value={ticketDetails.vehicleNumber}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 text-black"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="offense" className="block text-sm font-medium">Offense</label>
                                            <input
                                                type="text"
                                                id="offense"
                                                name="offense"
                                                value={ticketDetails.offense}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 text-black"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="fineAmount" className="block text-sm font-medium">Fine Amount</label>
                                            <input
                                                type="number"
                                                id="fineAmount"
                                                name="fineAmount"
                                                value={ticketDetails.fineAmount}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 text-black"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="photo" className="block text-sm font-medium">Upload Photo (Optional)</label>
                                            <input
                                                type="file"
                                                id="photo"
                                                accept="image/*"
                                                onChange={handleInputFile}
                                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 text-black"
                                            />
                                        </div>
                                        <div>
                                            {files && files.length > 0 ? (
                                                Array.from(files).map((file, index) => (
                                                    <PhotoCard key={index} url={URL.createObjectURL(file)} />
                                                ))
                                            ) : (
                                                <div>No files to display</div> // Optional: to show when there are no files
                                            )}
                                        </div>

                                        <div className="mt-4 flex justify-between">
                                            <button
                                                type="submit"
                                                className="bg-green-500 text-white py-2 px-4 rounded-md"
                                            >
                                                Submit Ticket
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCancel} // Close the form and reset the files
                                                className="bg-red-500 text-white py-2 px-4 rounded-md"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {user.role === "police" && (
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold">Your Created Tickets:</h3>
                                {tickets.length > 0 ? (
                                    <table className="min-w-full bg-[#adbcc3] border">
                                        <thead className="bg-[#e9154c] text-white">
                                            <tr>
                                                <th className="px-4 py-2 border">Image</th>
                                                <th className="px-4 py-2 border">Vehicle Number</th>
                                                <th className="px-4 py-2 border">Offense</th>
                                                <th className="px-4 py-2 border">Fine Amount</th>
                                                <th className="px-4 py-2 border">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tickets.map(ticket => (
                                                <tr
                                                    key={ticket._id}
                                                    className={ticket.fineAmount > 500 ? 'bg-[#444444]' : ''}
                                                >
                                                    <td className="px-4 py-2 border">
                                                        {ticket.imageUrls && ticket.imageUrls.length > 0 ? (
                                                            <img
                                                                src={`/gjobaImages/${ticket.imageUrls[0]}`}
                                                                alt="Ticket Image"
                                                                style={{ width: "100px", height: "auto" }}
                                                            />
                                                        ) : (
                                                            <span>No image</span>
                                                        )}
                                                    </td>
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
                                    <table className="min-w-full bg-[#adbcc3] border">
                                        <thead className="bg-[#e9154c] text-white">
                                            <tr>
                                                <th className="px-4 py-2 border">Image</th>
                                                <th className="px-4 py-2 border">Vehicle Number</th>
                                                <th className="px-4 py-2 border">Offense</th>
                                                <th className="px-4 py-2 border">Fine Amount</th>
                                                <th className="px-4 py-2 border">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tickets.map(ticket => (
                                                <tr
                                                    key={ticket._id}
                                                    className={ticket.fineAmount > 500 ? 'bg-[#444444]' : ''}
                                                >
                                                    <td className="px-4 py-2 border">
                                                        {ticket.imageUrls && ticket.imageUrls.length > 0 ? (
                                                            <img
                                                                src={`/gjobaImages/${ticket.imageUrls[0]}`}
                                                                alt="Ticket Image"
                                                                style={{ width: "100px", height: "auto" }}
                                                            />
                                                        ) : (
                                                            <span>No image</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 border">{ticket.vehicleNumber}</td>
                                                    <td className="px-4 py-2 border">{ticket.offense}</td>
                                                    <td className="px-4 py-2 border">{ticket.fineAmount}</td>
                                                    <td className="px-4 py-2 border">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>No tickets found for your vehicle.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
