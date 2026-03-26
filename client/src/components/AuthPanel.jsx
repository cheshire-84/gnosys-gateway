import React, { useState } from 'react';

export default function AuthPanel({ type, onSubmit, onCancel }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in">
      <div className="bg-[#0e0e0e] border border-[#262626] p-8 max-w-md w-full relative shadow-2xl">
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-600 hover:text-white font-mono text-xs">X</button>
        <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-white mb-6 border-b border-[#262626] pb-4">
          {type === 'setup' ? 'Master Initialization' : 'Secure Terminal Access'}
        </h2>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(username, password); }} className="space-y-4">
          <input className="w-full bg-black border border-[#222] p-4 text-xs text-white focus:border-white outline-none font-mono placeholder:text-gray-800" placeholder="IDENTIFIER" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input type="password" autoComplete={type === 'setup' ? 'new-password' : 'current-password'} className="w-full bg-black border border-[#222] p-4 text-xs text-white focus:border-white outline-none font-mono placeholder:text-gray-800" placeholder="PASSPHRASE" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="w-full bg-white text-black py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-300 transition-colors">
            {type === 'setup' ? 'Establish Root' : 'Authenticate'}
          </button>
        </form>
      </div>
    </div>
  );
}