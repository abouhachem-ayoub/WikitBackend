'use client';
import executeQuery from '@/components/MysqlConnect/MysqlConnect';
import {useRouter} from 'next/navigation';
import React, {ChangeEvent, FormEvent, useState,useEffect} from 'react';
import toast, { Toaster } from 'react-hot-toast';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { FiEye } from "react-icons/fi";
import { FiEyeOff } from "react-icons/fi";
import { signIn } from "next-auth/react";
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

const defaultFormData = {
    email:'',
    password:'',
    password2:'',
    firstName:'',
    lastName:'',
    phone:'',
    pseudo:''
}
const RegisterForm = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData,setFormData] = useState(defaultFormData);
    const [phone, setPhone] = useState('');
    const [type, setType] = useState('password');
    const[type2, setType2] = useState('password');
    const [errorMessage,setErrorMessage] = useState('');
    const [debouncedPseudo, setDebouncedPseudo] = useState('');
    const [pseudo, setPseudo] = useState('');
    const[pseudoErrorMessage,setPseudoErrorMessage] = useState('');
    const [pseudoExists, setPseudoExists] = useState(false);
    const [debouncedformData, setDebouncedformData] = useState(defaultFormData);
    const[emailErrorMessage,setEmailErrorMessage] = useState('');
    const [emailExists, setEmailExists] = useState(false);
    const [passwordErrorMessage,setPasswordErrorMessage] = useState('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedPseudo(pseudo);
        }, 500);
    
        return () => {
            clearTimeout(handler);
        };
    }, [pseudo]);
    useEffect(() => {
        if (debouncedPseudo.trim() !== '') {
            const fetchData = async () => {
                try {
                    const result = await executeQuery('SELECT * FROM userInfo WHERE pseudo = ?', [debouncedPseudo]);
                    if (result.length > 0) {
                        setPseudoErrorMessage(debouncedPseudo+' already exists');
                        setPseudoExists(true);
                    } 
                    else if (debouncedPseudo.length < 5) {
                        setPseudoErrorMessage(debouncedPseudo+' is too short, at least 5 characters');
                        setPseudoExists(true);
                    }
                    else {
                        setPseudoErrorMessage(debouncedPseudo+' is available');
                        setPseudoExists(false);
                    }
                } catch (error) {
                }
            };
            fetchData();
        }
    }, [debouncedPseudo]);
    const handlePseudoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPseudo(value);
        setFormData({ ...formData, pseudo: value });
        if(pseudo.length<5){
            setErrorMessage("Pseudo too short, at least 5 characters"); 
        }
        else{
            setErrorMessage('');
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedformData(formData);
        }, 500);
    
        return () => {
            clearTimeout(handler); 
        };
    }, [formData]);
    useEffect(() => {
        if (debouncedformData.email.trim() !== '') {
            const fetchData = async () => {
                try {
                    if(!emailRegex.test(debouncedformData.email)) {
                      setEmailErrorMessage('Invalid email format');
                      setEmailExists(true);
                        return;
                    }
                    const result = await executeQuery('SELECT * FROM userInfo WHERE email = ?', [debouncedformData.email]);
                    if (result.length > 0) {
                        setEmailErrorMessage(debouncedformData.email+'\talready exists, login instead');
                        setEmailExists(true);
                    } else {
                        setEmailErrorMessage(debouncedformData.email+'\t is available');
                        setEmailExists(false);
                    }
                } catch (error) {
                }
            };
            fetchData();
        }
    }, [debouncedformData]);

    useEffect(() => {
        const checkPassword = () => {
            if(!passwordRegex.test(debouncedformData.password) ){
                setPasswordErrorMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
            }
            else if (debouncedformData.password.length == 0){
                setPasswordErrorMessage('')      
            }
            else if(debouncedformData.password.length > 0 && debouncedformData.password.length < 8 && debouncedformData.password !== debouncedformData.password2){
                    setPasswordErrorMessage('Passwords are too short, and did not match')      
                }
            else if (debouncedformData.password.length < 8){
            setPasswordErrorMessage('Password is too short, at least 8 characters');
            }
            else if(debouncedformData.password != debouncedformData.password2){
            setPasswordErrorMessage('Passwords did not match');
            }   
            else if(debouncedformData.password == debouncedformData.password2 && debouncedformData.password.length >= 8){
            setPasswordErrorMessage('');}
    
            else{
            setPasswordErrorMessage('');
            }
    }
    checkPassword();
    }
    , [debouncedformData.password,debouncedformData.password2]);
    
    const handleInputChange = (e :ChangeEvent <HTMLInputElement>) => {
        try{
        const{name,value}=e.target;
        setFormData({...formData,[name]:value});
        }
        catch(error){
            console.log(error);
        }
    }
  
    const handlePhoneChange = (value: string) => {
        setPhone(value); 
        setFormData({ ...formData, phone: value }); 
    };
    const handleToggle = () => {
        if (type==='password'){
           setType('text')
        } else {
           setType('password')
        }
     }
    const handleToggle2 = () => {
        if (type2==='password'){
           setType2('text')
        } else {
           setType2('password')
        }
     }

    const handleSubmit =async(e : FormEvent <HTMLFormElement>)=>{
        e.preventDefault();
        try{
            if(!pseudoExists && !emailExists && passwordErrorMessage === '' && formData.password === formData.password2){
                setLoading(true);
                    const response = await fetch("/api/auth/register", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(formData),
                    });
                    const data = await response.json();
                    if (!response.ok) {
                        throw new Error(data.message || "Something went wrong");
                      }

                      toast.success("Registration successful! You can now log in.");
                      router.push("/login");
                } 
                else{
                    toast.error('Something went wrong, try again!');
            }}
        catch(error){
            console.log(error);
        }
        finally{
            setLoading(false);
        }
    }
    const handleSocialLogin = async (provider: string) => {
        try {
          setLoading(true);
          const result = await signIn(provider, { callbackUrl: "/" });
          if (!result?.ok) {
            throw new Error("Social login failed");
          }
        } catch (error) {
          console.error(error);
          toast.error("Social login failed. Please try again.");
        } finally {
          setLoading(false);
        }
      };
    return (
        <div className="min-w-md max-w-lg mx-auto bg-white shadow-md rounded px-8 py-6">            <Toaster/>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign Up</h2>
            <form method='post' onSubmit={handleSubmit}>
            <div className="mb-4">
                    <label htmlFor="firstName" className="required block text-gray-700 font-medium mb-2">
                        First Name
                    </label>
                    <input
                        maxLength={30}
                        type="text"
                        id="firstName"
                        name='firstName'
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="first name"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="lastName" className="required block text-gray-700 font-medium mb-2">
                        Last Name
                    </label>
                    <input
                        maxLength={30}
                        type="text"
                        id="lastName"
                        name='lastName'
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="last name"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="pseudo" className="required block text-gray-700 font-medium mb-2">
                        Pseudo
                    </label>
                    <input
                        maxLength={30}
                        type="text"
                        id="pseudo"
                        name='pseudo'
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Pseudo"
                        required
                        value={pseudo}
                        onChange={handlePseudoChange}
                    />
                    {pseudoExists?
                        (<p className="text-red-500 text-sm">{pseudoErrorMessage}</p>) : 
                        (<p className="text-green-500 text-sm">{pseudoErrorMessage}</p> 
                    )}
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="required block text-gray-700 font-medium mb-2">
                        Email
                    </label>
                    <input
                        maxLength={50}
                        type="email"
                        id="email"
                        name='email'
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                    />
                     {emailExists?
                        (<p className="text-red-500 text-sm">{emailErrorMessage}</p>) : 
                        (<p className="text-green-500 text-sm">{emailErrorMessage}</p> 
                    )}
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="required block text-gray-700 font-medium mb-2">
                        Password
                    </label>
                    <div className='mb-4 flex'>
                    <input
                        maxLength={30}
                        name='password'
                        type={type}
                        id="password"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        minLength={8}
                    />
                       <span className="border border-gray-300 rounded" title="show/hide"  onClick={handleToggle}>
                       {(type=="password")? (<FiEye className='inline-block mt-[15px]'/>):(<FiEyeOff className='inline-block mt-[15px]'/>)}
                       </span>
                       </div>
                       {passwordErrorMessage &&
                        (<p className="text-red-500 text-sm">{passwordErrorMessage}</p> )}
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="required block text-gray-700 font-medium mb-2">
                        Repeat password
                    </label>
                    <div className = 'mb-4 flex'>
                    <input
                        maxLength={30}
                        type={type2}
                        name='password2'
                        id="password2"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your password again"
                        required
                        value={formData.password2}
                        onChange={handleInputChange}
                        minLength={8}
                    />
                      <span className="border border-gray-300 rounded" title="show/hide"  onClick={handleToggle2}>
                       {(type2=="password")? (<FiEye className='inline-block mt-[15px]'/>):(<FiEyeOff className='inline-block mt-[15px]'/>)}
                       </span>
                       </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                        Phone Number
                    </label>
                    <PhoneInput
                        enableSearch={true}
                        country={'us'}
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="Enter your phone number"
                    />
                </div>
                <div className="mb-4 text-right">
                    <a
                        href="/login"
                        className="text-sm text-blue-500 hover:underline"
                    >
                        Already have an account? login instead!
                    </a>
                </div>
                <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded disabled:bg-gray-300"                >
                         {loading ? 'Submitting...' : 'Sign Up'}

                </button>
            </form>
            <div className="mt-6">
                <p className="text-center text-gray-600 mb-4">Or sign up with</p>
                <div className="flex justify-center space-x-4">
                    <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded"
                        onClick={() => handleSocialLogin("google")}
                    >
                        <img src="/google-logo.png" alt="Google" className="h-6 w-6" />
                    </button>
                    <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded"
                        onClick={() => handleSocialLogin("facebook")}
                    >
                        <img src="/facebook-logo.png" alt="Facebook" className="h-6 w-6" />
                    </button>
                    <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded"
                        onClick={() => handleSocialLogin("github")}
                    >
                        <img src="/github-logo.png" alt="GitHub" className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </div> 
    );
};

export default RegisterForm;