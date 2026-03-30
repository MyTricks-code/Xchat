import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { createContext } from "react";
import toast from "react-hot-toast";

// context name
const authContext = createContext();

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const checkAuth = async () => {
      try {
        const res = await axios.get(
          `${API}/api/auth/get-user-info`,
          { withCredentials: true },
        );
        if (res.data.success) {
          setUser({ name: res.data.data.name, id: res.data.data.id });
          return;
        }
        toast(
          "User Not Log in",
          {
            duration: 1500,
          },
        );
        return;

      } catch (err) {
        console.log("Error checking Auth: ", err);
      }
  };

  const login = async (username, password) => {
    try {
      const res = await axios.post(
        `${API}/api/auth/login`,
        {
          username: username,
          password: password,
        },
        { withCredentials: true },
      );
      let status = res.data.success;
      if (status) {
        await checkAuth();
        return toast.success(res.data.message);
      }
      return toast.error(res.data.message);
    } catch (err) {
      console.log("Error in login: ", err);
    }

  };

  const createUser =async(username, password)=>{
    try{
      const res = await axios.post(
        `${API}/api/auth/create-user`,
        {
          username: username,
          password: password,
        },
        { withCredentials: true },
      );
      console.log(res)
      let status = res.data.success;
      if (status) {
        await checkAuth();
        return toast.success(res.data.message);
      }
      return toast.error(res.data.message);
    }catch(err){
      console.log("Error while Creating User: ",err)
    }
  }

  const logout = async () => {
    try {
      console.log("logout clicked");
      const res = await axios.post(
        `${API}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
      setUser(null)
      if (res.data.success) return toast.success(res.data.message);
      return toast.error(res.data.message);
    } catch (err) {
      console.log("Error in logout: ", err);
      return null;
    }
  };

  const joinRoom = async(roomId)=>{
    try{
      const res = await axios.post(`${API}/api/rooms/join-room`, {roomId: roomId}, {withCredentials:true})
      if (res.data.success) {
        toast.success(res.data.message);
        return true;
      }
      toast.error(res.data.message);
      return false;
    }catch(err){
      console.log("Error in joinRoom: ", err);
      return false;
    }
  }

  const createNewRoom = async (name, roomId) => {
    try {
      const res = await axios.post(
        `${API}/api/rooms/create-room`,
        { name: name, roomId: roomId },
        { withCredentials: true },
      );
      if (res.data.success) {
        toast.success(res.data.message);
        return true;
      }
      toast.error(res.data.message);
    } catch (err) {
      console.log("Error creating room", err);
      return false;
    }
  };

  const deleteExistingRoom = async (roomId) => {
    try {
      const res = await axios.delete(`${API}/api/rooms/delete-room`, {
        data: { roomId },
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        return true;
      }
      toast.error(res.data.message);
      return false;
    } catch (err) {
      console.log("Error deleting room:", err);
      toast.error("Error deleting room");
      return false;
    }
  };

  useEffect(() => {
  const init = async () => {
    try {
      await checkAuth();
    } catch (err) {
      console.log("Error verifying user:", err);
    }
  };
  init();  
}, []);
  

  return (
    <authContext.Provider
      value={{
        user,
        setUser,
        checkAuth,
        login,
        logout,
        createUser,
        joinRoom,
        createNewRoom,
        deleteExistingRoom
      }}
    >
      {children}
    </authContext.Provider>
  );
};

// custom hook
export const useAuth = () => useContext(authContext);
