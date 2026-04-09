import React from 'react';

export default function ServiceManager({ 
  services, newService, setNewService, handleAddOrUpdate, 
  removeService, editingId, triggerEdit, cancelEdit 
}) {
  return (
    <div className="mb-12 animate-in fade-in zoom-in-95 duration-500">
      <form onSubmit={handleAddOrUpdate} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <input 
          className="bg-black border border-[#262626] p-3 text-xs font-mono focus:border-white outline-none text-white transition-colors"
          placeholder="ASSET_NAME"
          value={newService.name}
          onChange={e => setNewService({...newService, name: e.target.value})}
          required
        />
        <input 
          className="bg-black border border-[#262626] p-3 text-xs font-mono focus:border-white outline-none text-white transition-colors"
          placeholder="TAG (e.g. MEDIA)"
          value={newService.tag}
          onChange={e => setNewService({...newService, tag: e.target.value})}
          required
        />
        <input 
          className="bg-black border border-[#262626] p-3 text-xs font-mono focus:border-white outline-none text-white transition-colors"
          placeholder="NETWORK_URL"
          value={newService.url}
          onChange={e => setNewService({...newService, url: e.target.value})}
          required
        />
        <input 
          className="bg-black border border-[#262626] p-3 text-xs font-mono focus:border-white outline-none text-white transition-colors"
          placeholder="DESCRIPTION"
          value={newService.description}
          onChange={e => setNewService({...newService, description: e.target.value})}
        />
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-white text-black font-bold uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-colors">
            {editingId ? 'Update_Asset' : 'Register_Asset'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="px-4 border border-[#262626] text-gray-500 hover:text-white uppercase text-[10px]">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="flex flex-wrap gap-4">
        {services.map(s => (
          <div key={s.id} className="flex items-center gap-4 border border-[#262626] bg-black px-4 py-2 hover:border-gray-600 transition-colors">
            <span className="text-xs text-gray-400 font-mono">{s.name}</span>
            <div className="flex gap-3 border-l border-[#262626] pl-4">
              <button 
                type="button" 
                onClick={() => triggerEdit(s)} 
                className="text-[10px] text-blue-800 hover:text-blue-500 font-bold uppercase tracking-widest transition-colors"
              >
                Edit
              </button>
              <button 
                type="button" 
                onClick={() => removeService(s.id, s.name)} 
                className="text-[10px] text-red-900 hover:text-red-500 font-bold uppercase tracking-widest transition-colors"
              >
                X
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}