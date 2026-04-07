import React from 'react';

export default function DocumentationPanel() {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-12 pb-20">
      <section>
        <h2 className="text-xl font-light text-white uppercase tracking-[0.3em] mb-8 border-l-4 border-white pl-6">
          01. Python Micro-Kernel
        </h2>
        <div className="bg-stoic-gray border border-stoic-border p-6 leading-relaxed">
          <p className="text-xs text-gray-400 font-mono mb-4">
            The Gnosys Gateway has been refactored into a Python-based micro-kernel using FastAPI. This environment handles 
            real-time telemetry and service monitoring as background threads.
          </p>
          <ul className="text-[10px] font-mono text-gray-500 space-y-2 border-l border-stoic-border pl-4">
            <li>&gt; <span className="text-white">HARDWARE:</span> Utilizes 'psutil' to extract CPU, Memory, and Disk usage from the Ubuntu LXC container.</li>
            <li>&gt; <span className="text-white">HEARTBEAT:</span> A background 'Monitor' thread pings the registry every 30 seconds to update asset status.</li>
            <li>&gt; <span className="text-white">PERSISTENCE:</span> Powered by SQLite3 for zero-configuration, high-performance local storage.</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-light text-white uppercase tracking-[0.3em] mb-8 border-l-4 border-white pl-6">
          02. Security & Authority
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-stoic-gray border border-stoic-border p-6">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Cryptographic Standard</h4>
            <p className="text-[11px] text-gray-400 font-mono leading-relaxed">
              Administrative credentials are secured using SHA-256 with an 8-byte hexadecimal salt. This ensures stable 
              one-way encryption without character length limitations.
            </p>
          </div>
          <div className="bg-stoic-gray border border-stoic-border p-6">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Session Management</h4>
            <ul className="text-[10px] font-mono text-gray-500 space-y-2">
              <li>&gt; <span className="text-white">JWT:</span> 24-hour JSON Web Tokens for API authorization.</li>
              <li>&gt; <span className="text-white">AUTO-LOCK:</span> UI monitors activity and triggers a terminal lock after 15 minutes of idle time.</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-light text-white uppercase tracking-[0.3em] mb-8 border-l-4 border-white pl-6">
          03. NGINX SSL Configuration
        </h2>
        <div className="bg-stoic-gray border border-stoic-border p-1">
          <pre className="p-8 font-mono text-[11px] text-gray-400 overflow-x-auto leading-relaxed">
            {`# SSL HARDENING // home.gnosys.labs
ssl_certificate     /etc/ssl/gnosys/home.gnosys.labs.crt;
ssl_certificate_key /etc/ssl/gnosys/home.gnosys.labs.key;

location /api {
    proxy_pass http://127.0.0.1:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}`}
          </pre>
        </div>
      </section>
    </div>
  );
}