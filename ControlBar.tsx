import React, { useState } from 'react';
import { Play, Square, Volume2, VolumeX, RefreshCw, Settings, ChevronUp, ChevronDown, Activity } from 'lucide-react';
import { MonitorStatus } from './constants';

interface ControlBarProps {
  status: MonitorStatus;
  isMuted: boolean;
  onToggleMonitoring: () => void;
  onToggleMute: () => void;
  lastCheck: Date | null;
  onRefreshFrame: () => void;
  onOpenSettings: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  status,
  isMuted,
  onToggleMonitoring,
  onToggleMute,
  lastCheck,
  onRefreshFrame,
  onOpenSettings
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isActive = status === MonitorStatus.ACTIVE || status === MonitorStatus.ALERT;

  // Mini State (When collapsed)
  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none">
        <button 
          onClick={() => setIsExpanded(true)}
          className="pointer-events-auto bg-gray-900/90 backdrop-blur text-white p-3 rounded-full shadow-lg border border-white/10 hover:bg-black transition-transform active:scale-95 flex items-center justify-center"
        >
          <ChevronUp size={20} />
        </button>
      </div>
    );
  }

  // Expanded State (Floating Capsule)
  return (
    <div className="fixed bottom-6 left-4 right-4 z-40 flex justify-center pointer-events-none">
      <div className="pointer-events-auto bg-gray-900/85 backdrop-blur-md text-white rounded-2xl shadow-2xl p-2 flex items-center gap-2 border border-white/10 max-w-md w-full animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Main Action Button */}
        <button
          onClick={onToggleMonitoring}
          className={`h-11 px-4 rounded-xl flex items-center gap-2 font-bold transition-all ${
            isActive 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
              : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
          }`}
        >
          {isActive ? (
            <>
              <Square size={16} fill="currentColor" />
              <span className="text-sm">STOP</span>
            </>
          ) : (
            <>
              <Play size={16} fill="currentColor" />
              <span className="text-sm whitespace-nowrap">START</span>
            </>
          )}
        </button>

        {/* Status Info */}
        <div className="flex-1 flex flex-col justify-center px-2 border-l border-white/10 h-8 overflow-hidden">
           <div className="flex items-center space-x-2">
             {isActive && <Activity size={12} className="text-green-400 animate-pulse shrink-0" />}
             <span className="text-xs font-medium text-gray-300 truncate">
               {isActive ? 'Scanning...' : 'Paused'}
             </span>
           </div>
           {lastCheck && isActive && (
             <span className="text-[10px] text-gray-500 font-mono leading-none mt-0.5 truncate">
               Last: {lastCheck.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', second:'2-digit' })}
             </span>
           )}
        </div>

        {/* Quick Tools */}
        <div className="flex items-center gap-0.5">
          <button 
            onClick={onRefreshFrame} 
            className="p-2.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw size={18} />
          </button>
          
          <button 
            onClick={onToggleMute} 
            className={`p-2.5 rounded-full transition-colors ${isMuted ? 'text-gray-500 hover:text-gray-400' : 'text-orange-400 bg-orange-500/10'}`}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button 
            onClick={onOpenSettings} 
            className="p-2.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <Settings size={18} />
          </button>

          <button 
            onClick={() => setIsExpanded(false)}
            className="p-2.5 hover:bg-white/10 rounded-full text-gray-500 hover:text-white ml-1"
          >
            <ChevronDown size={18} />
          </button>
        </div>

      </div>
    </div>
  );
};