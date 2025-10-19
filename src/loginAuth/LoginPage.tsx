import React, { useState } from 'react';
// Import Link tidak lagi diperlukan karena error, kita akan menggunakan tag <a> biasa
// import { Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        console.log("Login submitted", { username, email, password });
        alert("Login functionality to be implemented!");
    };

    return (
        <div 
            className="bg-cover bg-center min-h-screen flex items-center justify-center font-[Poppins]" 
            style={{ backgroundImage: "url('../src/assets/bg.jpg')" }}
        >
             {/* Tombol Back, diganti kembali ke tag <a> */}
            <a href="/" className="absolute top-8 left-8 text-white/70 hover:text-white transition-colors duration-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                <span className="font-medium text-lg">Back</span>
            </a>

            <div className="w-full max-w-4xl h-[550px] flex rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] overflow-hidden mx-4">
                
                {/* Panel Kiri (Sama Persis) */}
                <div className="w-2/5 bg-[#1391B6] text-white p-10 flex flex-col gap-[25px]">
                    <div className="w-10 h-10 flex items-center justify-center border-2 border-white rounded-lg text-2xl font-semibold">
                        V
                    </div>
                    <h1 className="text-[32px] font-semibold">
                        Login To Your Account!
                    </h1>
                    <div className="img-left-panel">
                         <img src="../src/assets/orang-larilari.png" alt="Illustration of a person running" className="w-[250px]" />
                    </div>
                </div>

                {/* Panel Kanan (Sama Persis) */}
                <div className="w-3/5 bg-gray-200 p-12 flex flex-col justify-center">
                    <form onSubmit={handleSubmit}>
                        <h2 className="text-4xl font-semibold italic text-gray-800 mb-6">Login</h2>
                        
                        <div className="mb-4">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                            <input 
                                type="text" 
                                id="username" 
                                name="username" 
                                required 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-transparent border-0 border-b border-gray-400 pb-1 text-gray-800 focus:outline-none focus:border-b-2 focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent border-0 border-b border-gray-400 pb-1 text-gray-800 focus:outline-none focus:border-b-2 focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div className="mb-5">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-transparent border-0 border-b border-gray-400 pb-1 text-gray-800 focus:outline-none focus:border-b-2 focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center">
                                <input type="checkbox" id="terms" name="terms" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">Remember Me</label>
                            </div>
                            {/* Diganti kembali ke tag <a> */}
                            <a href="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">Forgot password?</a>
                        </div>

                        <button type="submit" className="w-full bg-blue-500 text-white font-semibold py-3 rounded-full hover:bg-blue-600 transition-colors duration-300">
                            Login
                        </button>

                        <p className="text-center text-sm text-gray-600 mt-6">
                            Don’t have an account? 
                            {/* Diganti kembali ke tag <a> */}
                            <a href="/register" className="font-medium text-blue-600 hover:underline"> Create Account</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

