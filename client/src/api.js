import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
   withCredentials: true, // if backend uses cookies
});

export default api;
