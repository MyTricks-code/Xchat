import React, { useState, useEffect } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from './components/AppSidebar'
import ChatSection from './components/ChatSection'
import JoinModel from './components/JoinModel'
import SettingModel from './components/Settings'
import { Toaster } from 'react-hot-toast'
import { useParams, useNavigate } from 'react-router'
import axios from 'axios'
import { Hash, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from './context/authContext'

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// Global Loading Toast Interceptors
let loadingToastId = null;
axios.interceptors.request.use((config) => {
  if (!loadingToastId) loadingToastId = toast.loading("Processing...");
  return config;
}, (error) => {
  if (loadingToastId) {
    toast.dismiss(loadingToastId);
    loadingToastId = null;
  }
  return Promise.reject(error);
});

axios.interceptors.response.use((response) => {
  if (loadingToastId) {
    toast.dismiss(loadingToastId);
    loadingToastId = null;
  }
  return response;
}, (error) => {
  if (loadingToastId) {
    toast.dismiss(loadingToastId);
    loadingToastId = null;
  }
  return Promise.reject(error);
});

// Helper for cookies
const addToRecentRooms = (name, id) => {
  if (!name || !id) return;
  const cookieName = "recentrooms";
  const cookies = document.cookie.split('; ');
  const recentCookie = cookies.find(row => row.startsWith(cookieName + '='));
  let recentRooms = [];
  if (recentCookie) {
    try {
      recentRooms = JSON.parse(decodeURIComponent(recentCookie.split('=')[1]));
    } catch(e) {
      recentRooms = [];
    }
  }

  recentRooms = recentRooms.filter(r => r.id !== id);
  recentRooms.unshift({ name, id });
  recentRooms = recentRooms.slice(0, 10);
  
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${cookieName}=${encodeURIComponent(JSON.stringify(recentRooms))}; expires=${expires}; path=/`;
  window.dispatchEvent(new Event('recentRoomsUpdated'));
};

export default function App() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { deleteExistingRoom } = useAuth();
  const [roomInfo, setRoomInfo] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [participantsList, setParticipantsList] = useState([]);
  const [JoinOpen, setJoinOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const fetchRoomInfo = async () => {
      if (!roomId) {
        setRoomInfo(null);
        return;
      }
      try {
        const res = await axios.get(`${API}/api/rooms/get-room/${roomId}`, { withCredentials: true });
        if (res.data.success) {
          setRoomInfo(res.data.room);
          addToRecentRooms(res.data.room.name, res.data.room.roomId);
        }
      } catch (err) {
        console.error("Error fetching room info:", err);
      }
    };
    fetchRoomInfo();
  }, [roomId]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Room ID copied to clipboard!");
  };

  const handleDeleteRoom = async () => {
    if (window.confirm("Are you sure you want to delete this room? This action is irreversible.")) {
      const success = await deleteExistingRoom(roomId);
      if (success) {
        navigate('/');
      }
    }
  };

  return (
    <SidebarProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <AppSidebar 
        JoinOpen={JoinOpen} 
        setJoinOpen={setJoinOpen} 
        settingsOpen={settingsOpen} 
        setSettingsOpen={setSettingsOpen} 
      />
      <SidebarInset className="flex flex-col h-screen overflow-hidden relative">
        <header className="flex flex-col md:flex-row md:h-12 shrink-0 items-center justify-between border-b border-border bg-background sticky top-0 z-20 px-4">
          <div className="flex h-12 w-full md:w-auto items-center justify-between md:justify-start gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <SidebarTrigger className="-ml-1 text-primary" />
              {roomId && (
                <div className="flex items-center gap-2 ml-2 min-w-0">
                  <div className="h-4 w-[1px] bg-border mx-1 shrink-0" />
                  <Hash className="size-4 text-primary shrink-0 drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]" />
                  <span className="font-bold text-sm truncate text-primary drop-shadow-[0_0_8px_rgba(0,255,0,0.4)]">
                    {roomInfo?.name || "LOADING..."}
                  </span>
                </div>
              )}
            </div>
            
            {/* Mobile-only trash icon on the right of the first row */}
            <div className="md:hidden">
              {roomId && (
                <button 
                  onClick={handleDeleteRoom}
                  className="p-2 rounded text-primary/70 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/30 group"
                  title="Delete Room"
                >
                  <Trash2 className="size-4 drop-shadow-[0_0_10px_rgba(255,0,0,0.1)] group-hover:drop-shadow-[0_0_15px_rgba(255,0,0,0.4)]" />
                </button>
              )}
            </div>
          </div>
          
          {roomId && (
            <div className="flex h-10 md:h-auto w-full md:w-auto items-center justify-between md:justify-end gap-3 shrink-0 pb-2 md:pb-0 border-t md:border-t-0 border-border/20 md:border-transparent">
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <button 
                  onClick={() => setShowParticipants(!showParticipants)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all text-[10px] md:text-[11px] font-bold text-primary uppercase shadow-[0_0_10px_rgba(0,255,0,0.1)]"
                >
                  Participants
                </button>
                <div 
                  onClick={() => copyToClipboard(roomId)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded border border-primary/20 hover:border-primary/60 hover:bg-primary/10 cursor-pointer transition-all group max-w-[150px] md:max-w-none"
                >
                  <span className="hidden sm:inline text-[9px] text-primary/70 uppercase tracking-widest font-bold">ROOM ID:</span>
                  <code className="text-[10px] md:text-[11px] text-primary font-mono font-bold bg-primary/20 px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(0,255,0,0.2)] truncate">
                    {roomId}
                  </code>
                </div>
              </div>
              
              {/* Desktop-only trash icon */}
              <div className="hidden md:block">
                <button 
                  onClick={handleDeleteRoom}
                  className="p-1.5 rounded text-primary/70 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/30 group"
                  title="Delete Room"
                >
                  <Trash2 className="size-4 drop-shadow-[0_0_10px_rgba(255,0,0,0.1)] group-hover:drop-shadow-[0_0_15px_rgba(255,0,0,0.4)]" />
                </button>
              </div>
            </div>
          )}
        </header>
        {showParticipants && roomId && (
          <div className="absolute top-14 right-4 w-48 bg-background/95 backdrop-blur-md border border-primary/30 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(0,255,0,0.1)] z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="text-[10px] uppercase tracking-widest font-bold text-primary/70 mb-3 border-b border-primary/20 pb-2">Active Participants</div>
            <div className="space-y-3">
              {participantsList.map((name) => (
                <div key={name} className="flex items-center gap-2 group cursor-default">
                  <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,255,0,1)]" />
                  <span className="text-xs font-mono font-bold text-foreground/90 group-hover:text-primary transition-colors tracking-tight">{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <ChatSection setParticipantsList={setParticipantsList} setSettingsOpen={setSettingsOpen} />
      </SidebarInset>
      {JoinOpen && <JoinModel JoinOpen={JoinOpen} setJoinOpen={setJoinOpen} />}
      {settingsOpen && <SettingModel settingsOpen={settingsOpen} setSettingsOpen={setSettingsOpen} />}
    </SidebarProvider>
  )
}
