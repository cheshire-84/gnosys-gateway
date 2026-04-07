import React, { useState, useRef, useEffect } from 'react';

export default function Terminal({ services, currentUser, addLog, syncAllData }) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    'GNOSYS BOOT LOADER V2.5...',
    'RESTRICTED ACCESS: ROOT_PRIORITY_ONLY',
    'TYPE "HELP" FOR COMMAND LIST.'
  ]);
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [history]);

  const processCommand = (cmd) => {
    const parts = cmd.toLowerCase().trim().split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    switch (command) {
      case 'help':
        setHistory(prev => [...prev, `> ${cmd}`, 'CMDS: STATUS, PING [NAME], CLEAR, WHOAMI, RESYNC, SEARCH [QUERY]']);
        break;
      case 'whoami':
        setHistory(prev => [...prev, `> ${cmd}`, `AUTHORITY: ${currentUser || 'GUEST'}`]);
        break;
      case 'status':
        const offline = services.filter(s => s.status === 'OFFLINE').length;
        setHistory(prev => [...prev, `> ${cmd}`, `REGISTRY: ${services.length} ASSETS. ${offline} CRITICAL FAILURES.`]);
        break;
      case 'resync':
        syncAllData();
        setHistory(prev => [...prev, `> ${cmd}`, 'SYNCHRONIZING WITH BACKEND KERNEL...']);
        break;
      case 'clear':
        setHistory([]);
        break;
      case 'ping':
        const target = services.find(s => s.name.toLowerCase() === args[0]);
        if (target) {
          setHistory(prev => [...prev, `> ${cmd}`, `RESULT: ${target.name} IS ${target.status}`]);
        } else {
          setHistory(prev => [...prev, `> ${cmd}`, 'ERROR: ASSET NOT FOUND.']);
        }
        break;
      default:
        // Default to Google Search if it's not a system command
        addLog(`External Query: Routing to Google via '${cmd}'`);
        setHistory(prev => [...prev, `> ${cmd}`, 'ROUTING TO EXTERNAL SEARCH...']);
        window.open(`https://www.google.com/search?q=${cmd}`, '_blank');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input) return;
    processCommand(input);
    setInput('');
  };

  return (
    <div className="bg-black border border-[#1a1a1a] p-4 font-mono text-[10px] mb-8 w-full max-w-4xl mx-auto shadow-2xl">
      <div ref={scrollRef} className="h-24 overflow-y-auto mb-3 space-y-1 scrollbar-hide text-gray-500">
        {history.map((line, i) => (
          <div key={i} className={line.startsWith('>') ? "text-white" : ""}>
            {line.startsWith('>') ? <span className="text-green-900 mr-2">$</span> : null}
            {line.replace('>', '')}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex items-center border-t border-[#111] pt-2">
        <span className="text-green-900 mr-2 animate-pulse">$</span>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="bg-transparent border-none outline-none text-gray-300 w-full uppercase tracking-widest placeholder:text-gray-800"
          placeholder="ENTER_QUERY_OR_COMMAND..."
          autoFocus
        />
      </form>
    </div>
  );
}