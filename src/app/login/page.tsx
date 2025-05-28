'use client';
import { useAuth } from "@/context/AuthContext";
import {useRouter} from 'next/navigation';
import React, {ChangeEvent, FormEvent, useState} from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FiEye } from "react-icons/fi";
import { FiEyeOff } from "react-icons/fi";

const defaultFormData = {
    email:'',
    password:'',
}
const LoginForm = () => {
    defaultFormData.email = new URLSearchParams(window.location.search).get('email') || '';
    const msg = new URLSearchParams(window.location.search).get('msg') || '';
    const [type, setType] = useState("password");
    const { login } = useAuth();
    const router = useRouter();
    const [formData,setFormData] = useState(defaultFormData);
    const handleInputChange = (e :ChangeEvent <HTMLInputElement>) => {
        const{name,value}=e.target;
        setFormData({...formData,[name]:value});
    }
    const handleSubmit =async(e : FormEvent <HTMLFormElement>)=>{
        e.preventDefault();
        try{
            console.log(formData);
                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                  });
            
                  const data = await response.json();
            
                  if (!response.ok) {
                    throw new Error(data.message || "Login failed");
                  }
                    // Store the token in local storage or a cookie
                    localStorage.setItem("token", data.token);
                    login(data.token);
                    router.push(`/user/${data.user_id}`);
                 
                } catch (error: any) {
                  toast.error(error.message || "An error occurred");
                }
              } 
              const handleToggle = () => {
                if (type==='password'){
                   setType('text')
                } else {
                   setType('password')
                }
             }
    return (
        <div className="min-w-md max-w-lg mx-auto bg-white shadow-md rounded px-8 py-6">
            <Toaster/>
            {msg && <p className="text-red-500">{msg}</p>}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Login</h2>
            <form method='post' onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                        Email
                    </label>
                    <input
                        name = 'email'
                        type="email"
                        id="email"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}

                    />
                </div>
                <div className="mb-4 ">
                    <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                        Password
                    </label>
                    <div className='mb-4 flex'>
                    <input
                        name = 'password'
                        type={type}
                        id="password"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your password"
                        required
                        onChange={handleInputChange}
                        value={formData.password}
                    />
                    <span className="border border-gray-300 rounded" title="show/hide"  onClick={handleToggle}>
                                           {(type=="password")? (<FiEye className='inline-block mt-[15px]'/>):(<FiEyeOff className='inline-block mt-[15px]'/>)}
                                           </span>
                                           </div>
                </div>
                <div className="mb-4 text-right">
                    <a
                        href="/forgot-password"
                        className="text-sm text-blue-500 hover:underline"
                    >
                        Did you forget your password?
                    </a>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                >
                    Login
                </button>
            </form>
            <div className="mt-6">
                <p className="text-center text-gray-600 mb-4">Or login with</p>
                <div className="flex justify-center space-x-4">
                    <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded">
                        <img src="/google-logo.png" alt="Google" className="h-6 w-6" />
                    </button>
                    <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded">
                        <img src="/facebook-logo.png" alt="Facebook" className="h-6 w-6" />
                    </button>
                    <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded">
                        <img src="/github-logo.png" alt="GitHub" className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;