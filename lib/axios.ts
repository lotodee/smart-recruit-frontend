import axios from "axios"

// Determine the base URL based on the environment
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"

// Create a reusable axios instance with default config
const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token =
      typeof window !== "undefined" ? JSON.parse(localStorage.getItem("smartrecruit_session") || "{}")?.token : null

    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      // Clear localStorage and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("smartrecruit_session")
        window.location.href = "/"
      }
    }
    return Promise.reject(error)
  },
)

export default api
