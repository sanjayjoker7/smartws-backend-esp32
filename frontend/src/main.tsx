import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { io } from 'socket.io-client';

createRoot(document.getElementById("root")!).render(<App />);

// Establish WebSocket connection
const socket = io('http://localhost:5000'); // Replace with your backend URL

console.log('WebSocket connected:', socket); // Debug log

socket.on('dashboard_update', (data) => {
    console.log('Dashboard updated:', data); // Debug log
    // Handle the real-time update logic here, e.g., update state
});
