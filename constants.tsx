
import { PlantCareDetails } from './types';

export const PLANTS: PlantCareDetails[] = [
  {
    id: 'dracaena',
    name: "Dracaena 'Lemon Lime'",
    scientificName: 'Dracaena fragrans',
    commonName: 'Corn Plant',
    meterTarget: '1 – 2 (Red Zone)',
    frequencyEstimate: 'Every 2–3 weeks',
    keyRisk: 'Root rot from overwatering.',
    light: 'Bright, indirect light. Can tolerate lower light, but growth slows.',
    watering: 'Extremely drought-tolerant. Wait until the meter hits the dry zone (1-2).',
    specialNote: 'Sensitive to fluoride/chlorine. Use distilled water or let tap water sit overnight.',
    toxicity: 'Toxic to pets/humans if ingested. Causes temporary swelling.',
    imageUrl: 'https://res.cloudinary.com/easyplant/image/upload/c_fill,ar_2:3,w_800,g_auto,f_auto,q_auto/v1659972845/care/dracaena-lemon-lime.jpg'
  },
  {
    id: 'dieffenbachia',
    name: "Dieffenbachia 'Camille' Dumb Cane",
    scientificName: 'Dieffenbachia seguine',
    commonName: 'Dumb Cane',
    meterTarget: '3 – 4 (Red/Green Border)',
    frequencyEstimate: 'Every 1–2 weeks',
    keyRisk: 'Yellowing leaves (usually overwatering).',
    light: 'Filtered light. Direct sun will scorch the leaves.',
    watering: 'Moderately moist but not soggy. Allow top 2 inches of soil to dry out.',
    specialNote: 'Variiegated variety needs decent light to maintain pattern.',
    toxicity: 'Highly toxic. Sap causes swelling of tongue and throat. Wash hands after handling.',
    imageUrl: 'https://res.cloudinary.com/easyplant/image/fetch/c_fill,ar_2:3,w_800,g_auto,f_auto,q_auto/https://cdn11.bigcommerce.com/s-oqm1pc/images/stencil/1280x1280/products/6739/28194/1-Dieffenbachia-Carmille-6_1800x1800_1ac49c21-6842-4312-847b-703775e7074c__66474.1713469994.jpg?c=3'
  },
  {
    id: 'fiddle-leaf',
    name: 'Fiddle Leaf Fig',
    scientificName: 'Ficus lyrata',
    commonName: 'FLF',
    meterTarget: '3 – 4 (Red/Green Border)',
    frequencyEstimate: 'Every 7–10 days',
    keyRisk: 'Dropping leaves (drafts or erratic watering).',
    light: 'Needs high light. Place right in front of a window (bright, filtered).',
    watering: 'Consistency is key. Hates "wet feet" but also hates drying out completely.',
    specialNote: 'Dust large leaves regularly. Do not move once happy.',
    toxicity: 'Toxic to pets/humans if ingested.',
    imageUrl: 'https://res.cloudinary.com/easyplant/image/fetch/c_fill,ar_2:3,w_800,g_auto,f_auto,q_auto/https://www.palasa.co.in/cdn/shop/articles/IMG_20220226_173034_1.jpg?v=1694161186'
  }
];

export const METER_SCALE = {
  DRY: { min: 1, max: 3, label: 'Dry (Red)', color: 'bg-red-500' },
  MOIST: { min: 4, max: 7, label: 'Moist (Green)', color: 'bg-green-500' },
  WET: { min: 8, max: 10, label: 'Wet (Blue)', color: 'bg-blue-500' }
};
