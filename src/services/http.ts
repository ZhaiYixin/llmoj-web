import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export { axiosInstance }
