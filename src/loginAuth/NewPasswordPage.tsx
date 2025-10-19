import React, { useState, useEffect } from 'react';

const NewPasswordPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordsMatch, setPasswordsMatch] = useState(true);

    useEffect(() => {
        if (newPassword) {
            setPasswordsMatch(password === newPassword);
        } else {
            setPasswordsMatch(true);
        }
    }, [password, newPassword]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!passwordsMatch) {
            alert("Passwords don't match!");
            return;
        }
        console.log("Reset password submitted for:", { password });
        alert("Password reset functionality to be implemented!");
    };

    return (
        <div 
            className="bg-cover bg-center min-h-screen flex items-center justify-center font-[Poppins]" 
            style={{ backgroundImage: "url('../src/assets/bg.jpg')" }}
        >
            {/* Menggunakan tag <a> untuk menghindari error jika belum ada Router */}
            <a href="/login" className="absolute top-8 left-8 text-white/70 hover:text-white transition-colors duration-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                <span className="font-medium text-lg">Back</span>
            </a>

            <div className="w-full max-w-4xl h-[550px] flex rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.3)] overflow-hidden mx-4">
                
                {/* Panel Kiri (Sama Persis) */}
                <div className="w-2/5 bg-[#1391B6] text-white p-10 flex flex-col gap-[25px]">
                    <div className="w-10 h-10 flex items-center justify-center border-2 border-white rounded-lg text-2xl font-semibold">
                        V
                    </div>
                    <h1 className="text-[32px] font-semibold">
                        Forgot Your Password
                    </h1>
                    <div className="img-left-panel">
                        <img src="../src/assets/orang-larilari.png" alt="Illustration of a person running" className="w-[250px]" />
                    </div>
                </div>

                {/* Panel Kanan (Sama Persis) */}
                <div className="w-3/5 bg-[#E9E9E9] px-[60px] py-[50px] flex flex-col justify-center">
                    <form className="w-full" onSubmit={handleSubmit}>
                        <h2 className="text-4xl font-semibold italic text-gray-800 mb-5">Create Your Password</h2>
                        <p className="text-sm text-gray-700 mb-5">
                            Enter the email associated with your account and we’ll send an email with instructions to reset your password.
                        </p>
                        
                        <div className="mb-[15px]">
                            <label htmlFor="password" className="block text-sm text-gray-600 mb-1">Password</label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                required 
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-transparent border-0 border-b border-gray-400 py-[5px] text-base text-gray-800 focus:outline-none focus:border-b-2 focus:border-blue-500 transition-colors"
                            />
                        </div>
                        
                        <div className="mb-[15px]">
                            <label htmlFor="new-password" className="block text-sm text-gray-600 mb-1">New Password</label>
                            <input 
                                type="password" 
                                id="new-password" 
                                name="new-password" 
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={`w-full bg-transparent border-0 border-b py-[5px] text-base text-gray-800 focus:outline-none focus:border-b-2 transition-colors ${passwordsMatch ? 'border-gray-400 focus:border-blue-500' : 'border-red-500 focus:border-red-500'}`}
                            />
                            {!passwordsMatch && <p className="text-red-500 text-xs mt-1">Passwords don't match!</p>}
                        </div>

                        <button type="submit" className="w-full bg-blue-500 text-white font-medium text-base py-[15px] rounded-full hover:bg-blue-600 transition-colors duration-300 mt-5">
                            Reset Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewPasswordPage;
