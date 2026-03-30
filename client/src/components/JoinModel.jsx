import React, { useState } from "react";
import { CircleX } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { useNavigate } from "react-router";

const JoinModel = ({ JoinOpen, setJoinOpen }) => {
  if (!JoinOpen) return null;

  const [createRoom, setCreateRoom] = useState(true)
  const [name, setName] = useState('')
  const [roomId, setRoomId] = useState('')
  const {joinRoom, createNewRoom} = useAuth()
  const navigate = useNavigate()
  const handleOnClick = async(e)=>
  {
    e.preventDefault();
    let success = false;
    if(!createRoom){
      success = await createNewRoom(name, roomId)
    }else{
      success = await joinRoom(roomId)
    }
    if (success) {
      setJoinOpen(false)
      navigate(`/rooms/${roomId}`)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-150 max-w-[90%] bg-gray-700 rounded-2xl shadow-xl p-6">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
          onClick={() => setJoinOpen(false)}
        >
          <CircleX size={30} />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-xl font-semibold">{createRoom ? "Join Room" : "Create Room"}</h2>


          <input
            type="text"
            placeholder={createRoom ? "Enter Room Code" : "Create Room Code"}
            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            value = {roomId}
            onChange={(e)=>setRoomId(e.target.value)}
          />

          {!createRoom && 
          <input
            type="text"
            placeholder="Name The Room"
            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            value = {name}
            onChange={(e)=>setName(e.target.value)}
          />
          }

        
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition" onClick={(e)=>handleOnClick(e)}>
            {createRoom ? "Join" : "Create"}
          </button>
          <h4 className="text-neutral-50"> <span>{!createRoom ? "Join" : "Create"}</span> a Room! <span className="text-amber-50 cursor-pointer" onClick={()=>setCreateRoom(prev=>!prev)}>{!createRoom ? "Join" : "Create"}</span></h4>
        </div>
      </div>
    </div>
  );
};

export default JoinModel;
