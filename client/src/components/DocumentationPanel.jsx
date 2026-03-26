import React from 'react';

export default function DocumentationPanel() {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-12 pb-20">
      <section>
        <h2 className="text-xl font-light text-white uppercase tracking-[0.3em] mb-8 border-l-4 border-white pl-6">
          01. Asset Registry (CRUD)
        </h2>
        <div className="bg-stoic-gray border border-stoic-border p-6">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Service Management</h4>
          <div className="text-xs space-y-4 text-gray-400 font-mono leading-relaxed">
            <p>The Gateway utilizes a MongoDB-backed registry to track network infrastructure and applications.</p>
            <ul className="list-none space-y-2 border-l border-stoic-border pl-4">
              <li><span className="text-white">ADD ASSET:</span> Click [ MANAGE_SERVICES ] to open the terminal. Enter the Name, Tag, URL, and Description.</li>
              <li><span className="text-white">PURGE ASSET:</span> In the management terminal, click the red 'X' next to an existing asset to permanently remove it from the database.</li>
              <li><span className="text-white">SECURITY:</span> Modification of the asset registry requires a valid JWT authorization token. Unauthorized access attempts will be logged and rejected.</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-light text-white uppercase tracking-[0.3em] mb-8 border-l-4 border-white pl-6">
          02. External Relays & Telemetry
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-stoic-gray border border-stoic-border p-6">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">API Proxies</h4>
            <p className="text-[11px] text-gray-400 font-mono leading-relaxed mb-4">
              To prevent client-side rate limiting and CORS violations, all external data streams are proxied through the Node.js backend.
            </p>
            <ul className="text-[10px] font-mono text-gray-500 space-y-2">
              <li>&gt; <span className="text-white">Weather:</span> Open-Meteo API (Plant City Coordinates)</li>
              <li>&gt; <span className="text-white">Discovery:</span> Wikipedia REST API (Random Summary)</li>
              <li>&gt; <span className="text-white">Headlines:</span> hnrss.org (Hacker News Mirror)</li>
            </ul>
          </div>
          <div className="bg-stoic-gray border border-stoic-border p-6">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">In-Memory Cache</h4>
            <pre className="bg-black p-4 font-mono text-[10px] text-gray-500 border border-stoic-border leading-relaxed overflow-x-auto">
              {`// Mitigating HTTP 429 (Too Many Requests)
if (now - lastFetchTime < 300000) {
  return res.json(cachedRSS);
}
// Cache is flushed and renewed every 5 minutes.`}
            </pre>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-light text-white uppercase tracking-[0.3em] mb-8 border-l-4 border-white pl-6">
          03. NGINX Reverse Proxy
        </h2>
        <div className="bg-stoic-gray border border-stoic-border p-1">
          <pre className="p-8 font-mono text-[11px] text-gray-400 overflow-x-auto leading-relaxed">
            {`# Strict API Pass-Through Configuration
location /api {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    
    # Preserve Client Origin
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}`}
          </pre>
        </div>
      </section>
    </div>
  );
}