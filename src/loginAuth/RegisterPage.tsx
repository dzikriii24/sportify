import React, { useState, useEffect } from 'react';

// Jika Anda menggunakan React Router, import Link
// import { Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordsMatch, setPasswordsMatch] = useState(true);

    useEffect(() => {
        if (confirmPassword) {
            setPasswordsMatch(password === confirmPassword);
        } else {
            setPasswordsMatch(true);
        }
    }, [password, confirmPassword]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (password !== confirmPassword) {
            setPasswordsMatch(false);
            alert("Passwords don't match!");
            return;
        }
        console.log("Form submitted!", { username, email, password });
        alert("Register success!");
    };

    return (
        <div 
            className="bg-cover bg-center min-h-screen flex items-center justify-center font-[Poppins]" 
            style={{ backgroundImage: "url('../src/assets/bg.jpg')" }}
        >
            {/* Tombol Kembali: Ganti <a> dengan <Link> jika menggunakan React Router */}
            <a href="/login" className="absolute top-8 left-8 text-white/70 hover:text-white transition-colors duration-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                <span className="font-medium text-lg">Back</span>
            </a>

            <div className="w-full max-w-[900px] h-[550px] flex rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.3)] overflow-hidden mx-4">
                
                {/* Panel Kiri */}
                <div className="w-2/5 bg-[#1391B6] text-white p-10 flex flex-col gap-[25px]">
                    <div className="w-10 h-10 flex items-center justify-center border-2 border-white rounded-lg text-2xl font-semibold">
                        V
                    </div>
                    <h1 className="text-[32px] font-semibold">
                        Create Your Account!
                    </h1>
                    <div className="img-left-panel">
                         <img src="../src/assets/orang-larilari.png" alt="Illustration of a person running" className="w-[250px]" />
                    </div>
                </div>
                
                {/* Panel Kanan */}
                <div className="w-3/5 bg-[#E9E9E9] px-[60px] py-[50px] flex flex-col justify-center">
                    <form className="w-full" onSubmit={handleSubmit}>
                        <h2 className="text-3xl font-semibold italic text-gray-800 mb-5">Register</h2>
                        
                        {/* Input Username */}
                        <div className="mb-[15px]">
                            <label htmlFor="username" className="block text-sm text-gray-600 mb-[5px]">Username</label>
                            <input 
                                type="text" 
                                id="username" 
                                name="username" 
                                required 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-transparent border-0 border-b border-gray-400 py-[5px] text-sm text-gray-800 focus:outline-none focus:border-b-2 focus:border-blue-500 transition-colors"
                            />
                        </div>

                        {/* Input Email */}
                        <div className="mb-[15px]">
                            <label htmlFor="email" className="block text-sm text-gray-600 mb-[5px]">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent border-0 border-b border-gray-400 py-[5px] text-sm text-gray-800 focus:outline-none focus:border-b-2 focus:border-blue-500 transition-colors"
                            />
                        </div>

                        {/* Input Password */}
                        <div className="mb-[15px]">
                            <label htmlFor="password" className="block text-sm text-gray-600 mb-[5px]">Password</label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                required 
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-transparent border-0 border-b border-gray-400 py-[5px] text-sm text-gray-800 focus:outline-none focus:border-b-2 focus:border-blue-500 transition-colors"
                            />
                        </div>

                        {/* Input Confirm Password */}
                        <div className="mb-[15px]">
                            <label htmlFor="confirm-password" className="block text-sm text-gray-600 mb-[5px]">Confirm Password</label>
                            <input 
                                type="password" 
                                id="confirm-password" 
                                name="confirm-password" 
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full bg-transparent border-0 border-b py-[5px] text-sm text-gray-800 focus:outline-none focus:border-b-2 transition-colors ${passwordsMatch ? 'border-gray-400 focus:border-blue-500' : 'border-red-500 focus:border-red-500'}`}
                            />
                             {!passwordsMatch && <p className="text-red-500 text-xs mt-1">Passwords don't match!</p>}
                        </div>

                        <div className="flex items-center mb-[25px]">
                            <input type="checkbox" id="terms" name="terms" required className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-[10px]" />
                            <label htmlFor="terms" className="text-[13px] text-gray-600">I agree with Term and Privacy Policy</label>
                        </div>
                        
                        <button type="submit" className="w-full bg-blue-500 text-white font-medium text-sm py-[15px] rounded-full hover:bg-blue-600 transition-colors duration-300">
                            Sign Up
                        </button>

                        <p className="text-center text-sm text-gray-600 mt-5">
                            Already have an account? 
                             {/* Ganti <a> dengan <Link> jika menggunakan React Router */}
                            <a href="/login" className="font-medium text-blue-600 hover:underline"> Log in</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
