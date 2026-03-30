import React, { useState } from "react";
import { CircleX } from "lucide-react";
import { useAuth } from "@/context/authContext";


const SettingModel = ({ settingsOpen, setSettingsOpen }) => {
  if (!settingsOpen) return null;

  

  const [name, setName] = useState('');
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)

  const {createUser, login} = useAuth()
  const handleOnClick = async (e)=>{
    e.preventDefault();
    try{
      if(isLogin){
        await login(name,password)
        return
      }
      await createUser(name,password)
      return
    }catch(err){
      console.log("Error sending auth request: ", err)
    }
  }

  return (
    <div className="fixed inset-0 z-30 bg-black/40 flex items-center justify-center">
      <div className="relative w-150 max-w-[90%] bg-gray-700 rounded-2xl shadow-xl p-6">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
          onClick={() => setSettingsOpen(false)}
        >
          <CircleX size={30} />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-xl font-semibold">Settings</h2>
          <h3 className="text-lg font-semibold">{isLogin ? 'Login' : 'Register'}</h3>
          <input
            type="name"
            placeholder="Enter Your Name"
            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={e=>setName(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter Your Password"
            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={e=>setPassword(e.target.value)}
          />

          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition" onClick={(e)=>handleOnClick(e)}>
            {isLogin ? 'Login' : 'Register'}
          </button>
          <h4 className="text-neutral-50"> <span>{!isLogin ? 'Already have' : "Don't have"}</span> a account? <span className="text-amber-50 cursor-pointer" onClick={()=>setIsLogin(prev=>!prev)}>{!isLogin ? 'Login' : 'Register'}</span></h4>
        </div>
      </div>
    </div>
  );
};

export default SettingModel;
