import React from 'react';

export default function ServiceManager({
  services, newService, setNewService, handleAddOrUpdate, removeService,
  editingId, triggerEdit, cancelEdit
}) {
  return (
    <div className="mb-10 bg-[#0e0e0e] border border-[#262626] p-6 animate-in fade-in slide-in-from-top-4">
      <h2 className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-6 border-b border-[#262626] pb-4">
        {editingId ? 'Modify Asset Configuration' : 'Service Configuration'}
      </h2>

      <form onSubmit={handleAddOrUpdate} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <input className="bg-black border border-[#222] p-4 text-xs text-white focus:border-white outline-none font-mono placeholder:text-gray-800" placeholder="NAME" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} required />
        <input className="bg-black border border-[#222] p-4 text-xs text-white focus:border-white outline-none font-mono placeholder:text-gray-800" placeholder="TAG" value={newService.tag} onChange={e => setNewService({...newService, tag: e.target.value})} required />
        <input className="bg-black border border-[#222] p-4 text-xs text-white focus:border-white outline-none font-mono placeholder:text-gray-800" placeholder="URL" value={newService.url} onChange={e => setNewService({...newService, url: e.target.value})} required />
        <input className="bg-black border border-[#222] p-4 text-xs text-white focus:border-white outline-none font-mono placeholder:text-gray-800" placeholder="DESC" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} />
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-white text-black py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-300 transition-colors">
            {editingId ? 'UPDATE_ASSET' : 'ADD_ASSET'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="px-6 bg-red-900 text-white py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors">
              X
            </button>
          )}
        </div>
      </form>

      <div className="flex flex-wrap gap-4">
        {services.map(s => (
          <div key={s._id} className="flex items-center gap-4 border border-[#262626] bg-black px-4 py-2 hover:border-gray-600 transition-colors">
            <span className="text-xs text-gray-400 font-mono">{s.name}</span>
            <div className="flex gap-3 border-l border-[#262626] pl-4">
              <button type="button" onClick={() => triggerEdit(s)} className="text-[10px] text-blue-800 hover:text-blue-500 font-bold uppercase tracking-widest transition-colors">Edit</button>
              <button type="button" onClick={() => removeService(s._id, s.name)} className="text-[10px] text-red-900 hover:text-red-500 font-bold uppercase tracking-widest transition-colors">X</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}