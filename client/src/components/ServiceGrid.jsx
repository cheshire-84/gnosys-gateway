import React from 'react';

export default function ServiceGrid({ services }) {
  return (
    <div className="lg:col-span-9">
      <header className="mb-12">
        <h1 className="text-4xl font-light tracking-[0.5em] uppercase text-white">Infrastructure</h1>
        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-600 mt-2 italic">Network Inventory // Pegasus-CA Secondary Node</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map((service) => (
          <a
            key={service._id}
            href={service.url}
            target="_blank"
            rel="noreferrer"
            className="group bg-[#141414] border border-[#262626] p-7 hover:border-white transition-all duration-500 flex flex-col justify-between min-h-[200px]"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="text-[8px] font-bold tracking-[0.4em] text-gray-600 uppercase group-hover:text-white transition-colors">
                  {service.tag}
                </span>
                <div className="w-1.5 h-1.5 bg-green-900 rounded-full group-hover:animate-pulse shadow-[0_0_10px_rgba(5,150,105,0.4)]"></div>
              </div>
              <h3 className="text-xl font-light tracking-widest text-white mb-3 uppercase group-hover:translate-x-1 transition-transform">
                {service.name}
              </h3>
              <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2 italic">
                {service.description}
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-[9px] font-bold text-gray-700 group-hover:text-white uppercase tracking-tighter transition-colors">
              Connection_Active
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}