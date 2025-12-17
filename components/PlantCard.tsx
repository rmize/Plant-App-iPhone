
import React from 'react';
import { PlantCareDetails, PlantStatus } from '../types';

interface PlantCardProps {
  plant: PlantCareDetails;
  status: PlantStatus;
  onClick: () => void;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant, status, onClick }) => {
  const getStatusColor = (health: string) => {
    switch (health) {
      case 'Healthy': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Needs Attention': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Critical': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={plant.imageUrl} 
          alt={plant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(status.health)}`}>
          {status.health}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold mb-1">{plant.name}</h3>
        <p className="text-stone-500 text-sm italic mb-3">{plant.scientificName}</p>
        
        <div className="flex items-center gap-2 text-xs mb-4">
          <span className="bg-stone-100 px-2 py-1 rounded text-stone-600">
            Meter: {plant.meterTarget}
          </span>
          <span className="bg-stone-100 px-2 py-1 rounded text-stone-600">
            {plant.frequencyEstimate}
          </span>
        </div>

        <div className="text-sm text-stone-600">
          Last watered: <span className="font-medium">{status.lastWatered || 'Never tracked'}</span>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;
