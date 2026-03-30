import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router";
import RoomPage from './pages/Room/[slug].jsx';
import { AuthProvider } from './context/authContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <AuthProvider>
    <TooltipProvider>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/rooms/:roomId" element={<RoomPage />} />
      </Routes>
    </TooltipProvider>
    </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
