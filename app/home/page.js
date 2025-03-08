"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Image from "next/image"
import { Car, CreditCard, FileImage, LogOut, Plus, AlertTriangle, X, Calendar } from "lucide-react"
import Link from "next/link"

// PhotoCard component for displaying uploaded images
function PhotoCard({ url }) {
  return (
    <div className="relative rounded-md overflow-hidden border h-24 w-24">
      <Image
        src={url || "/placeholder.svg?height=100&width=100"}
        alt="Uploaded photo"
        width={100}
        height={100}
        className="object-cover"
      />
    </div>
  )
}

export default function Home() {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [ticketDetails, setTicketDetails] = useState({
    vehicleNumber: "",
    offense: "",
    fineAmount: "",
  })
  const [tickets, setTickets] = useState([])
  const [files, setFiles] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userDataFromLocalStorage = JSON.parse(localStorage.getItem("user"))
    if (!userDataFromLocalStorage) {
      router.push("/login")
    } else {
      setUser(userDataFromLocalStorage)
    }
  }, [router])

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get("/api/users", {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          })

          if (user.role === "admin") {
            setUserData(response.data)
          } else if (user.role === "citizen" || user.role === "police") {
            const userData = response.data.find((u) => u.email === user.email)
            setUserData(userData)

            if (user.role === "citizen") {
              if (userData.plateNumber) {
                try {
                  const ticketsResponse = await axios.get(`/api/tickets?plate=${userData.plateNumber}`, {
                    headers: {
                      Authorization: `Bearer ${user.token}`,
                    },
                  })
                  setTickets(ticketsResponse.data)
                } catch (error) {
                  if (error.response && error.response.status === 404) {
                    setTickets([])
                    console.warn("No tickets found for the plate number.")
                  } else {
                    console.error("Error fetching tickets:", error)
                  }
                }
              } else {
                console.warn("No plate number found for the user.")
                setTickets([])
              }
            }

            if (user.role === "police") {
              try {
                const ticketsResponse = await axios.get(`/api/tickets?createdBy=${user._id}`, {
                  headers: {
                    Authorization: `Bearer ${user.token}`,
                  },
                })
                const policeTickets = ticketsResponse.data.filter((ticket) => ticket.createdBy === user._id.toString())
                setTickets(policeTickets)
              } catch (error) {
                console.error("Error fetching tickets for police:", error)
              }
            }
          }
        } catch (error) {
          console.error("Error fetching users or tickets:", error)
        }
      }

      fetchUserData()
    }
  }, [user])

  const handleInputFile = (e) => {
    const files = e.target.files

    const newFiles = [...files].filter((file) => {
      if (file.size < 1024 * 1024 && file.type.startsWith("image/")) {
        return file
      }
    })

    setFiles(newFiles)
  }

  const handleCancel = () => {
    setShowTicketForm(false)
    setFiles([])
    setTicketDetails({
      vehicleNumber: "",
      offense: "",
      fineAmount: "",
    })

    const fileInput = document.getElementById("photo")
    if (fileInput) fileInput.value = ""
  }

  async function uploadPhoto(file) {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data.filename
    } catch (error) {
      console.error("Error uploading photo:", error)
      throw error
    }
  }

  const handleTicketSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Upload images first
      const imagePromises = files.map((file) => uploadPhoto(file))
      const uploadedImageNames = await Promise.all(imagePromises)

      const ticketData = {
        vehicleNumber: ticketDetails.vehicleNumber,
        offense: ticketDetails.offense,
        fineAmount: ticketDetails.fineAmount,
        createdBy: user._id,
        imageUrls: uploadedImageNames,
      }

      const response = await axios.post("/api/tickets", ticketData)

      if (response.status === 200) {
        setShowTicketForm(false)
        setFiles([])
        setTicketDetails({
          vehicleNumber: "",
          offense: "",
          fineAmount: "",
        })

        // Refresh tickets
        const ticketsResponse = await axios.get(`/api/tickets?createdBy=${user._id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })
        const policeTickets = ticketsResponse.data.filter((ticket) => ticket.createdBy === user._id.toString())
        setTickets(policeTickets)
      }
    } catch (error) {
      console.error("Error creating ticket:", error)
      alert("Failed to create the ticket.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setTicketDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }))
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md dark:bg-slate-950/80 dark:border-slate-800">
        <div className="container mx-auto px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6 text-red-500" />
            <h1 className="text-xl font-bold">E-Gjoba</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-medium">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="text-sm">
                Hello, <span className="font-medium">{user?.name || "User"}</span>
              </div>
            </div>
            <button
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6 md:py-10">
        <div className="grid gap-6 md:grid-cols-3">
          {/* User Profile Card */}
          <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-slate-950 dark:border-slate-800 md:col-span-1">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">User Profile</h2>
            </div>

            {userData ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full border bg-red-100 flex items-center justify-center text-red-500 font-medium text-xl">
                    {userData.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {userData.name} {userData.surname}
                    </h3>
                    <p className="text-sm text-gray-500">{userData.email}</p>
                    <span className="inline-flex items-center rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-semibold text-white mt-1">
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-2xl font-bold">{tickets.length}</div>
                    <div className="text-xs text-gray-500">
                      {user.role === "police" ? "Created Tickets" : "Active Tickets"}
                    </div>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-2xl font-bold">
                      {tickets.reduce((sum, ticket) => sum + Number(ticket.fineAmount), 0)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.role === "police" ? "Total Fines Issued" : "Total Fines"}
                    </div>
                  </div>
                </div>

                {user.role === "citizen" && userData.plateNumber && (
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Car className="h-4 w-4" />
                      <span>Vehicle Plate</span>
                    </div>
                    <div className="font-medium">{userData.plateNumber}</div>
                  </div>
                )}

                {user.role === "police" && (
                  <button
                    className="w-full flex items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    onClick={() => setShowTicketForm(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Create Parking Ticket
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                  <p className="text-sm text-gray-500">Loading user data...</p>
                </div>
              </div>
            )}
          </div>

          {/* Tickets Card */}
          <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-slate-950 dark:border-slate-800 md:col-span-2">
            <div className="flex flex-row items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {user.role === "police" ? "Your Created Tickets" : "Your Tickets"}
                </h2>
                <p className="text-sm text-gray-500">
                  {user.role === "police"
                    ? "Tickets you have issued to vehicles"
                    : "Tickets associated with your vehicle"}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                <Calendar className="h-3 w-3" />
                All tickets
              </span>
            </div>

            {tickets.length > 0 ? (
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors">
                        <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Image</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Vehicle Number</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Offense</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Fine Amount</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Date</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {tickets.map((ticket) => (
                        <tr
                          key={ticket._id}
                          className={`border-b transition-colors hover:bg-gray-100 dark:hover:bg-slate-800 ${Number(ticket.fineAmount) > 500 ? "bg-red-50 dark:bg-red-900/10" : ""}`}
                        >
                          <td className="p-4 align-middle">
                            {ticket.imageUrls && ticket.imageUrls.length > 0 ? (
                              <div className="relative h-16 w-24 overflow-hidden rounded-md border">
                                <Image
                                  src={`/gjobaImages/${ticket.imageUrls[0]}`}
                                  alt="Ticket Image"
                                  width={96}
                                  height={64}
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-16 w-24 items-center justify-center rounded-md border bg-gray-100 dark:bg-slate-800">
                                <FileImage className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="p-4 align-middle font-medium">{ticket.vehicleNumber}</td>
                          <td className="p-4 align-middle">{ticket.offense}</td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-1 font-medium text-red-500">
                              <CreditCard className="h-3.5 w-3.5" />
                              {ticket.fineAmount}
                            </div>
                          </td>
                          <td className="p-4 align-middle text-gray-500">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-gray-100 p-3 dark:bg-slate-800">
                  <FileImage className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium">
                  {user.role === "police" ? "No tickets created yet" : "No tickets found for your vehicle"}
                </h3>
                <p className="mt-2 text-sm text-gray-500 max-w-sm">
                  {user.role === "police"
                    ? "You haven't created any parking tickets yet. Click the button to create your first ticket."
                    : "There are no parking tickets associated with your vehicle plate number."}
                </p>

                {user.role === "police" && (
                  <button
                    className="mt-4 flex items-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    onClick={() => setShowTicketForm(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Create Parking Ticket
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-slate-950 dark:border-slate-800">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
            </div>

            {tickets.length > 0 ? (
              <div className="space-y-4">
                {tickets.slice(0, 2).map((ticket, index) => (
                  <div key={index} className="flex items-start gap-4 rounded-lg border p-4">
                    <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/20">
                      {user.role === "police" ? (
                        <Car className="h-4 w-4 text-red-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {user.role === "police" ? "New ticket created" : "Ticket issued to your vehicle"}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {user.role === "police"
                          ? `You created a new parking ticket for vehicle ${ticket.vehicleNumber}`
                          : `A ticket was issued for ${ticket.offense}`}
                      </p>
                      <div className="mt-2 text-xs text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString()} at{" "}
                        {new Date(ticket.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}

                {user.role === "citizen" && (
                  <div className="flex items-start gap-4 rounded-lg border p-4">
                    <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/20">
                      <CreditCard className="h-4 w-4 text-green-600 dark:text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Payment reminder</h4>
                      <p className="text-sm text-gray-500">
                        Remember to pay your outstanding tickets to avoid additional fees
                      </p>
                      <div className="mt-2 text-xs text-gray-500">{new Date().toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-gray-500">No recent activity to display</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t py-6 md:py-0 dark:border-slate-800">
        <div className="container mx-auto px-6 flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} E-Gjoba. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">
              Terms
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">
              Help
            </Link>
          </div>
        </div>
      </footer>

      {/* Modal for creating tickets */}
      {showTicketForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-500" onClick={handleCancel}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>

            <div className="mb-4">
              <h2 className="text-lg font-semibold">Create Parking Ticket</h2>
              <p className="text-sm text-gray-500">Fill in the details to issue a new parking ticket.</p>
            </div>

            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="vehicleNumber" className="block text-sm font-medium">
                  Vehicle Number
                </label>
                <input
                  id="vehicleNumber"
                  name="vehicleNumber"
                  value={ticketDetails.vehicleNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="offense" className="block text-sm font-medium">
                  Offense
                </label>
                <input
                  id="offense"
                  name="offense"
                  value={ticketDetails.offense}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="fineAmount" className="block text-sm font-medium">
                  Fine Amount
                </label>
                <input
                  type="number"
                  id="fineAmount"
                  name="fineAmount"
                  value={ticketDetails.fineAmount}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="photo" className="block text-sm font-medium">
                  Upload Photo 
                </label>
                <input
                  type="file"
                  id="photo"
                  accept="image/*"
                  onChange={handleInputFile}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-gray-500">Max file size: 1MB. Only image files are accepted.</p>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Preview</label>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(files).map((file, index) => (
                      <PhotoCard key={index} url={URL.createObjectURL(file)} />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <span>Submit Ticket</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

