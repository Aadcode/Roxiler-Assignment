import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://roxilerdashboard-i9wp.onrender.com/api/v1",
});

export default apiClient