import { useState } from "react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, } from "@/components/ui/sidebar"; import { Clock3, Settings, Plus, LogOut } from "lucide-react";
import JoinModel from "./JoinModel";
import SettingModel from "./Settings"
import { useAuth } from "../context/authContext";

const AppSidebar = () => {
  const [JoinOpen, setJoinOpen] = useState(false);
  const[settingsOpen, setSettingsOpen] = useState(false);

 const { logout } = useAuth(); 

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
                <SidebarMenuButton>
                  <Clock3 />
                  <span>Recent Rooms</span>
                </SidebarMenuButton>
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
      {JoinOpen && <JoinModel JoinOpen={JoinOpen} setJoinOpen={setJoinOpen} />}
      {settingsOpen && <SettingModel settingsOpen={settingsOpen} setSettingsOpen={setSettingsOpen} />}
    </>
  );
};

export default AppSidebar