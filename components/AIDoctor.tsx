
import React, { useState, useRef, useEffect } from 'react';
import { askPlantAdvice, diagnosePlantPhoto } from '../services/geminiService';
import { PLANTS } from '../constants';

const AIDoctor: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(PLANTS[0].id);
  const [hasKey, setHasKey] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse('');
    try {
      const plantContext = PLANTS.find(p => p.id === selectedPlant);
      const res = await askPlantAdvice(query, JSON.stringify(plantContext));
      setResponse(res || 'No response found.');
    } catch (e: any) {
      if (e.message?.includes("Requested entity was not found")) {
        setHasKey(false);
      }
      setResponse('Error communicating with Gemini 3 Pro. Please check your API key/billing.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResponse('');
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const plant = PLANTS.find(p => p.id === selectedPlant);
        const res = await diagnosePlantPhoto(base64, plant?.name || 'plant');
        setResponse(res || 'No diagnosis generated.');
      } catch (err) {
        setResponse('Error analyzing photo with Pro vision model.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2">Gemini 3 Pro Doctor</h2>
          <p className="text-emerald-100 opacity-90">Advanced botanical reasoning and high-fidelity diagnosis.</p>
        </div>
        {!hasKey && (
          <button 
            onClick={handleSelectKey}
            className="bg-white text-emerald-900 px-6 py-2 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-lg"
          >
            Link Paid API Key
          </button>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-700 mb-2">Analyze Which Plant?</label>
          <div className="flex flex-wrap gap-2">
            {PLANTS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPlant(p.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedPlant === p.id 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="E.g., 'Compare my Fiddle Leaf Fig's current lighting to its native environment' or 'Analyze these yellow spots...'"
            className="w-full h-32 p-4 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
          />
          
          <div className="flex gap-2">
            <button
              onClick={handleAsk}
              disabled={loading}
              className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-2xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Thinking deeply...' : 'Ask Expert AI'}
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="px-6 bg-stone-900 text-white rounded-2xl hover:bg-black transition-colors disabled:opacity-50"
            >
              📷 Upload Leaf Photo
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {response && (
          <div className="mt-8 p-6 bg-stone-50 rounded-2xl border border-stone-200 prose prose-stone max-w-none">
             <div className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
               Pro Analysis:
             </div>
             <div className="whitespace-pre-wrap text-stone-700 leading-relaxed">
               {response}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIDoctor;
