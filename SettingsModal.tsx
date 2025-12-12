import React from 'react';
import { X, Server, Smartphone, ZoomIn, ZoomOut } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSimulated: boolean;
  onToggleSimulated: () => void;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  isSimulated, 
  onToggleSimulated,
  zoomLevel,
  onZoomChange
}) => {
  if (!isOpen) return null;

  const handleZoom = (delta: number) => {
    const newZoom = Math.min(Math.max(zoomLevel + delta, 0.5), 2.0);
    onZoomChange(parseFloat(newZoom.toFixed(1)));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">App Settings</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Zoom Control */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Content Scale</h3>
            <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between border border-gray-200">
              <button onClick={() => handleZoom(-0.1)} className="p-2 bg-white shadow-sm rounded-lg text-gray-600 hover:text-orange-600">
                <ZoomOut size={20} />
              </button>
              <span className="font-mono font-bold text-lg text-gray-700">{(zoomLevel * 100).toFixed(0)}%</span>
              <button onClick={() => handleZoom(0.1)} className="p-2 bg-white shadow-sm rounded-lg text-gray-600 hover:text-orange-600">
                <ZoomIn size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-500">Increase this if the website text looks too small.</p>
          </div>

          {/* Mode Selection */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Detection Mode</h3>
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => isSimulated && onToggleSimulated()}
                className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center justify-center text-center space-y-1 transition-all ${!isSimulated ? 'border-orange-500 bg-orange-50' : 'border-gray-200 opacity-60'}`}
              >
                <Server className={!isSimulated ? 'text-orange-600' : 'text-gray-400'} size={24} />
                <span className="text-xs font-bold text-gray-900">Live Server</span>
              </div>

              <div 
                onClick={() => !isSimulated && onToggleSimulated()}
                className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center justify-center text-center space-y-1 transition-all ${isSimulated ? 'border-blue-500 bg-blue-50' : 'border-gray-200 opacity-60'}`}
              >
                <Smartphone className={isSimulated ? 'text-blue-600' : 'text-gray-400'} size={24} />
                <span className="text-xs font-bold text-gray-900">Simulation</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button onClick={onClose} className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};