import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "/api" // use Vite proxy
      : `${import.meta.env.VITE_API_URL}/api`, // production
  withCredentials: true,
});

export default api;
