
import React, { useState, useEffect, useRef } from 'react';
import { AppTab, PlantStatus, WateringLogEntry } from './types';
import { PLANTS } from './constants';
import PlantCard from './components/PlantCard';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  
  const [statuses, setStatuses] = useState<Record<string, PlantStatus>>(() => {
    const saved = localStorage.getItem('urban_jungle_statuses');
    return saved ? JSON.parse(saved) : {
      'dracaena': { plantId: 'dracaena', lastWatered: null, health: 'Healthy' },
      'dieffenbachia': { plantId: 'dieffenbachia', lastWatered: null, health: 'Healthy' },
      'fiddle-leaf': { plantId: 'fiddle-leaf', lastWatered: null, health: 'Healthy' },
    };
  });

  const [logs, setLogs] = useState<WateringLogEntry[]>(() => {
    const saved = localStorage.getItem('urban_jungle_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [isWateringModalOpen, setIsWateringModalOpen] = useState(false);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [meterReading, setMeterReading] = useState(5);
  const [wateringNote, setWateringNote] = useState('');
  const csvInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('urban_jungle_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('urban_jungle_statuses', JSON.stringify(statuses));
  }, [statuses]);

  const handleWaterPlant = () => {
    if (!selectedPlantId) return;

    const newLog: WateringLogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      plantId: selectedPlantId,
      date: new Date().toLocaleDateString(),
      meterReading,
      notes: wateringNote
    };

    setLogs([newLog, ...logs]);

    let health: PlantStatus['health'] = 'Healthy';
    if (meterReading >= 8) health = 'Critical';
    else if (meterReading <= 2 && selectedPlantId !== 'dracaena') health = 'Needs Attention';

    setStatuses({
      ...statuses,
      [selectedPlantId]: {
        plantId: selectedPlantId,
        lastWatered: newLog.date,
        health
      }
    });

    setIsWateringModalOpen(false);
    setSelectedPlantId(null);
    setWateringNote('');
    setMeterReading(5);
  };

  const handleExportCsv = () => {
    if (logs.length === 0) {
      alert("No data to export.");
      return;
    }

    const headers = ['Date', 'Plant', 'Reading', 'Notes'];
    const csvRows = logs.map(log => {
      const plant = PLANTS.find(p => p.id === log.plantId);
      return [
        log.date,
        `"${plant?.name || log.plantId}"`,
        log.meterReading,
        `"${log.notes?.replace(/"/g, '""') || ''}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `urban_jungle_backup_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').filter(row => row.trim() !== '');
      if (rows.length < 2) return;

      const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
      const dateIdx = headers.indexOf('date');
      const plantIdx = headers.indexOf('plant');
      const readingIdx = headers.indexOf('reading');
      const notesIdx = headers.indexOf('notes');

      if (dateIdx === -1 || plantIdx === -1 || readingIdx === -1) {
        alert("Invalid CSV format. Required columns: Date, Plant, Reading");
        return;
      }

      const importedLogs: WateringLogEntry[] = [];
      const updatedStatuses = { ...statuses };

      rows.slice(1).forEach(row => {
        const cols = row.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        const plantStr = cols[plantIdx]?.toLowerCase();
        if (!plantStr) return;
        
        const matchedPlant = PLANTS.find(p => 
          p.name.toLowerCase().includes(plantStr) || 
          p.id.toLowerCase().includes(plantStr)
        );

        if (matchedPlant) {
          const reading = parseInt(cols[readingIdx]) || 5;
          const logDate = cols[dateIdx];
          
          importedLogs.push({
            id: Math.random().toString(36).substr(2, 9),
            plantId: matchedPlant.id,
            date: logDate,
            meterReading: reading,
            notes: notesIdx !== -1 ? cols[notesIdx] : ''
          });

          if (!updatedStatuses[matchedPlant.id].lastWatered || 
              new Date(logDate) >= new Date(updatedStatuses[matchedPlant.id].lastWatered!)) {
            updatedStatuses[matchedPlant.id] = {
              plantId: matchedPlant.id,
              lastWatered: logDate,
              health: reading >= 8 ? 'Critical' : (reading <= 2 ? 'Needs Attention' : 'Healthy')
            };
          }
        }
      });

      if (importedLogs.length > 0) {
        setLogs(prev => [...importedLogs, ...prev]);
        setStatuses(updatedStatuses);
        alert(`Successfully imported ${importedLogs.length} logs!`);
      }
    };
    reader.readAsText(file);
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-stone-50 safe-top safe-bottom">
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Urban Jungle</h1>
        </div>
        <div className="hidden md:flex gap-6">
          {Object.values(AppTab).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-semibold capitalize ${activeTab === tab ? 'text-emerald-600' : 'text-stone-500 hover:text-stone-900'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 pb-28">
        {activeTab === AppTab.DASHBOARD && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section>
              <h2 className="text-2xl font-bold mb-5 px-1">My Collection</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {PLANTS.map(plant => (
                  <PlantCard 
                    key={plant.id} 
                    plant={plant} 
                    status={statuses[plant.id]} 
                    onClick={() => {
                      setSelectedPlantId(plant.id);
                      setIsWateringModalOpen(true);
                    }}
                  />
                ))}
              </div>
            </section>

            <section className="bg-stone-900 rounded-3xl p-6 text-white shadow-xl">
              <h2 className="text-xl font-bold mb-4">XLUX Meter Guide</h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-stone-800 p-3 rounded-2xl border border-stone-700">
                  <div className="text-red-500 font-bold text-lg">1-3</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-60">Dry Zone</div>
                </div>
                <div className="bg-stone-800 p-3 rounded-2xl border border-stone-700">
                  <div className="text-green-500 font-bold text-lg">4-7</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-60">Moist Zone</div>
                </div>
                <div className="bg-stone-800 p-3 rounded-2xl border border-stone-700">
                  <div className="text-blue-500 font-bold text-lg">8-10</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-60">Wet Zone</div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === AppTab.GUIDE && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold">Plant Encyclopedia</h2>
            {PLANTS.map(plant => (
              <div key={plant.id} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                <img src={plant.imageUrl} className="rounded-2xl w-full h-64 object-cover" alt={plant.name} />
                <div>
                  <h3 className="text-2xl font-bold">{plant.name}</h3>
                  <p className="text-stone-500 italic text-sm">{plant.scientificName}</p>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed">{plant.specialNote}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">Target: {plant.meterTarget}</span>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{plant.frequencyEstimate}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === AppTab.LOGS && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold">History</h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => csvInputRef.current?.click()}
                  className="flex-1 sm:flex-none bg-stone-100 active:scale-95 text-stone-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border border-stone-200"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                  Import
                </button>
                <button 
                  onClick={handleExportCsv}
                  className="flex-1 sm:flex-none bg-emerald-600 active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0L8 12m4 4V4"/></svg>
                  Export Backup
                </button>
              </div>
              <input type="file" ref={csvInputRef} className="hidden" accept=".csv" onChange={handleCsvImport} />
            </div>
            
            <div className="space-y-3">
              {logs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-stone-200">
                  <p className="text-stone-400 text-sm">No sessions logged yet.</p>
                </div>
              ) : (
                logs.map(log => {
                  const plant = PLANTS.find(p => p.id === log.plantId);
                  return (
                    <div key={log.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-10 rounded-full ${log.meterReading <= 3 ? 'bg-red-500' : log.meterReading <= 7 ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                        <div>
                          <div className="font-bold text-sm">{plant?.name}</div>
                          <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{log.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-stone-700">{log.meterReading} <span className="text-[10px] opacity-40">/ 10</span></div>
                        <div className="text-[10px] text-stone-400 italic truncate max-w-[100px]">{log.notes || 'No note'}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-lg border border-stone-200 rounded-3xl px-6 py-4 md:hidden z-40 shadow-2xl flex justify-between items-center">
        {Object.values(AppTab).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === tab ? 'text-emerald-600 scale-110' : 'text-stone-400'}`}
          >
             <div className={`w-1 h-1 rounded-full mb-1 ${activeTab === tab ? 'bg-emerald-600' : 'bg-transparent'}`}></div>
             <span className="text-[9px] font-black uppercase tracking-[0.15em]">{tab}</span>
          </button>
        ))}
      </nav>

      {isWateringModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsWateringModalOpen(false)}></div>
          <div className="bg-white rounded-[32px] w-full max-w-sm p-8 relative shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
            <h3 className="text-2xl font-bold mb-6">Log Session</h3>
            
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-end mb-4">
                  <label className="text-xs font-black uppercase tracking-widest text-stone-400">XLUX Reading</label>
                  <span className="text-4xl font-black text-emerald-600">{meterReading}</span>
                </div>
                <input 
                  type="range" min="1" max="10" step="1" 
                  value={meterReading}
                  onChange={(e) => setMeterReading(parseInt(e.target.value))}
                  className="w-full h-3 bg-stone-100 rounded-full appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-stone-400 mb-2">Observations</label>
                <textarea 
                  value={wateringNote}
                  onChange={(e) => setWateringNote(e.target.value)}
                  placeholder="Any new growth? Dust?"
                  className="w-full h-24 p-4 bg-stone-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none text-sm"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsWateringModalOpen(false)}
                  className="flex-1 bg-stone-100 text-stone-500 font-bold py-4 rounded-2xl active:bg-stone-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleWaterPlant}
                  className="flex-1 bg-emerald-600 text-white font-bold py-4 rounded-2xl active:bg-emerald-700 shadow-lg shadow-emerald-200 text-sm"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
