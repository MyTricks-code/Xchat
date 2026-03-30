import { useState, useEffect } from "react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"; 
import { Clock3, Settings, Plus, LogOut, Hash } from "lucide-react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router";

const AppSidebar = ({ setJoinOpen, setSettingsOpen }) => {
  const { logout } = useAuth(); 
  const navigate = useNavigate();
  const [recentRooms, setRecentRooms] = useState([]);

  useEffect(() => {
    const loadRecent = () => {
      const cookieName = "recentrooms";
      const cookies = document.cookie.split('; ');
      const recentCookie = cookies.find(row => row.startsWith(cookieName + '='));
      if (recentCookie) {
        try {
          const parsed = JSON.parse(decodeURIComponent(recentCookie.split('=')[1]));
          setRecentRooms(parsed);
        } catch(e) {
          setRecentRooms([]);
        }
      }
    };

    loadRecent();
    window.addEventListener('recentRoomsUpdated', loadRecent);
    return () => window.removeEventListener('recentRoomsUpdated', loadRecent);
  }, []);
  const handleLogout = async(e)=>{
    e.preventDefault()
    // console.log("Logout Clicked")
    await logout()
  }

  return (
    <>
      <Sidebar className="max-h-screen">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>XChat</SidebarGroupLabel>

            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setJoinOpen(true)}>
                  <Plus />
                  <span>Join Room</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <div className="px-2 py-1 flex items-center gap-2 text-primary/70 text-[10px] uppercase tracking-widest font-bold mt-4 mb-2">
                  <Clock3 className="size-3" />
                  <span>Recent Rooms</span>
                </div>
                <div className="space-y-0.5 max-h-60 overflow-y-auto no-scrollbar px-1">
                  {recentRooms.length === 0 ? (
                    <div className="text-[10px] text-muted-foreground italic px-3 py-2 border border-dashed border-primary/10 rounded">
                      No history yet
                    </div>
                  ) : (
                    recentRooms.map((room) => (
                      <button
                        key={room.id}
                        onClick={() => navigate(`/rooms/${room.id}`)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-primary/10 text-foreground/80 hover:text-primary transition-all text-sm group"
                      >
                        <Hash className="size-3 text-muted-foreground group-hover:text-primary shrink-0" />
                        <span className="truncate">{room.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setSettingsOpen(true)}> 
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
           <div className="mt-auto mb-4 p-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={(e)=>handleLogout(e)}
            className="text-red-400 hover:text-red-500"
          >
            <LogOut />
            <span>Logout</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
        </SidebarContent>
      </Sidebar>
    </>
  );
};

export default AppSidebar