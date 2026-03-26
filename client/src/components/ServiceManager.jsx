import React from 'react';

export default function ServiceManager({ services, newService, setNewService, addService, removeService }) {
  return (
    <section className="mb-12 bg-[#0e0e0e] border border-dashed border-[#222] p-8 animate-in fade-in slide-in-from-top-4 duration-300">
      <h2 className="text-[10px] font-bold tracking-widest uppercase text-white mb-6 underline">Service Configuration</h2>
      <form onSubmit={addService} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <input className="bg-black border border-[#222] p-3 text-xs text-white outline-none focus:border-white" placeholder="NAME" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} required />
        <input className="bg-black border border-[#222] p-3 text-xs text-white outline-none focus:border-white" placeholder="TAG" value={newService.tag} onChange={e => setNewService({...newService, tag: e.target.value})} required />
        <input className="bg-black border border-[#222] p-3 text-xs text-white outline-none focus:border-white" placeholder="URL" value={newService.url} onChange={e => setNewService({...newService, url: e.target.value})} required />
        <input className="bg-black border border-[#222] p-3 text-xs text-white outline-none focus:border-white" placeholder="DESC" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} />
        <button className="bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-300 transition-colors">Add_Asset</button>
      </form>
      <div className="flex flex-wrap gap-2 mt-4">
        {services.map(s => (
          <div key={s._id} className="text-[9px] bg-black border border-[#222] px-3 py-1 flex items-center gap-3">
            <span className="text-gray-500">{s.name}</span>
            <button onClick={() => removeService(s._id, s.name)} className="text-red-900 hover:text-red-500 font-bold transition-colors">X</button>
          </div>
        ))}
      </div>
    </section>
  );
}