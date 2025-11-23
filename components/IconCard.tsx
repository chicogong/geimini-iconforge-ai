import React, { useState } from 'react';
import { GeneratedIcon } from '../types';
import { Download, Maximize2, Check } from 'lucide-react';

interface IconCardProps {
  icon: GeneratedIcon;
  onPreview: (icon: GeneratedIcon) => void;
}

export const IconCard: React.FC<IconCardProps> = ({ icon, onPreview }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloading(true);
    try {
      const link = document.createElement('a');
      link.href = icon.url;
      link.download = `iconforge-${icon.style.toLowerCase()}-${icon.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div 
      className="group relative aspect-square bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={() => onPreview(icon)}
    >
      <img 
        src={icon.url} 
        alt={icon.prompt} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 gap-3 z-10">
        <button 
          onClick={handleDownload}
          disabled={downloading}
          className="p-3 bg-white text-slate-900 rounded-full hover:bg-brand-50 hover:text-brand-600 transition-all transform hover:scale-110 active:scale-95 shadow-lg"
          title="Download PNG"
        >
          {downloading ? <Check size={20} className="animate-pulse" /> : <Download size={20} />}
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onPreview(icon); }}
          className="p-3 bg-white text-slate-900 rounded-full hover:bg-brand-50 hover:text-brand-600 transition-all transform hover:scale-110 active:scale-95 shadow-lg"
          title="Full Preview"
        >
          <Maximize2 size={20} />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
        <p className="text-white text-xs font-semibold mb-0.5">{icon.style}</p>
        <p className="text-slate-200 text-[10px] leading-tight line-clamp-2">{icon.prompt}</p>
      </div>
    </div>
  );
};