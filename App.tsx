import React, { useState, useEffect, useRef } from 'react';
import { ControlBar } from './ControlBar';
import { SettingsModal } from './SettingsModal';
import { audioService } from './audioService';
import { APP_CONFIG, MonitorStatus, STORAGE_KEYS } from './constants';
import { Zap } from 'lucide-react';

// --- WORKER CODE ---
const WORKER_SCRIPT = `
  self.onmessage = function(e) {
    if (e.data.command === 'START') {
      const { url, interval, isSimulated } = e.data;
      if (self.timerId) clearInterval(self.timerId);

      self.timerId = setInterval(async () => {
        if (isSimulated) {
          if (Math.random() > 0.85) {
             self.postMessage({ type: 'CHANGE_DETECTED', source: 'simulation' });
          }
        } else {
          try {
            const response = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
            if (response.ok) {
              const length = response.headers.get('content-length');
              self.postMessage({ type: 'POLL_RESULT', length: length });
            }
          } catch (error) {
            // Silently fail
          }
        }
      }, interval);
    } else if (e.data.command === 'STOP') {
      if (self.timerId) clearInterval(self.timerId);
    }
  };
`;

const App: React.FC = () => {
  const [status, setStatus] = useState<MonitorStatus>(MonitorStatus.IDLE);
  const [isMuted, setIsMuted] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [iframeKey, setIframeKey] = useState(0); 
  const [showSettings, setShowSettings] = useState(false);
  const [isSimulatedMode, setIsSimulatedMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0); 
  
  const workerRef = useRef<Worker | null>(null);
  const wakeLockRef = useRef<any>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    // Worker Init
    const blob = new Blob([WORKER_SCRIPT], { type: 'application/javascript' });
    workerRef.current = new Worker(URL.createObjectURL(blob));
    
    workerRef.current.onmessage = (e) => {
      const { type, length } = e.data;
      setLastCheck(new Date());

      if (type === 'CHANGE_DETECTED') {
        triggerAlert();
      } else if (type === 'POLL_RESULT') {
        handlePollResult(length);
      }
    };

    // Load Settings
    const savedState = localStorage.getItem(STORAGE_KEYS.MONITORING_ENABLED);
    if (savedState === 'true') startMonitoring(false);
    
    const savedZoom = localStorage.getItem('irsa_zoom_level');
    if (savedZoom) setZoomLevel(parseFloat(savedZoom));

    return () => {
      workerRef.current?.terminate();
      releaseWakeLock();
    };
  }, [isSimulatedMode]);

  const updateZoom = (newZoom: number) => {
    setZoomLevel(newZoom);
    localStorage.setItem('irsa_zoom_level', newZoom.toString());
  };

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch (err) {
      console.warn('Wake Lock failed:', err);
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      if (Notification.permission !== 'granted') {
        await Notification.requestPermission();
      }
    }
  };

  const sendSystemNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('Irsa Kitchen', {
          body: 'New Order Detected!',
          icon: '/favicon.ico',
          tag: 'new-order',
          requireInteraction: true,
          silent: false
        });
      } catch (e) {
        console.error("Notification failed", e);
      }
    }
  };

  const handlePollResult = (contentLength: string | null) => {
    if (!contentLength) return;
    const storedLength = localStorage.getItem(STORAGE_KEYS.LAST_CONTENT_LENGTH);
    if (storedLength && contentLength !== storedLength) {
      triggerAlert();
    }
    localStorage.setItem(STORAGE_KEYS.LAST_CONTENT_LENGTH, contentLength);
  };

  const triggerAlert = () => {
    setStatus(MonitorStatus.ALERT);
    sendSystemNotification();
    
    // Add vibration for mobile phones
    if (navigator.vibrate) {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }

    if (!isMuted) audioService.playAlert();
  };

  const startMonitoring = async (isUserInteraction = true) => {
    setStatus(MonitorStatus.ACTIVE);
    localStorage.setItem(STORAGE_KEYS.MONITORING_ENABLED, 'true');
    
    if (isUserInteraction) {
      // Important: Unlock audio context and request permissions on user interaction
      audioService.playAlert(0); 
      await requestNotificationPermission();
    }
    
    await requestWakeLock();
    workerRef.current?.postMessage({
      command: 'START',
      url: APP_CONFIG.TARGET_URL,
      interval: APP_CONFIG.POLL_INTERVAL_MS,
      isSimulated: isSimulatedMode
    });
  };

  const stopMonitoring = () => {
    setStatus(MonitorStatus.IDLE);
    localStorage.setItem(STORAGE_KEYS.MONITORING_ENABLED, 'false');
    releaseWakeLock();
    workerRef.current?.postMessage({ command: 'STOP' });
    audioService.stop();
  };

  const toggleMonitoring = () => {
    if (status === MonitorStatus.IDLE || status === MonitorStatus.ERROR) {
      startMonitoring(true);
    } else {
      stopMonitoring();
    }
  };

  const stopAlert = () => {
    setStatus(MonitorStatus.ACTIVE);
    audioService.stop();
  };

  const refreshIframe = () => {
    setIframeKey(prev => prev + 1);
  };
  
  return (
    <div className="fixed inset-0 w-full h-full bg-white overflow-hidden">
      
      {/* 1. FULL SCREEN IFRAME - NO HEADER */}
      <div 
        className="absolute inset-0 z-0 origin-top-left"
        style={{
          transform: `scale(${zoomLevel})`,
          width: `${100 / zoomLevel}%`,
          height: `${100 / zoomLevel}%`
        }}
      >
        <iframe
          key={iframeKey}
          src={APP_CONFIG.TARGET_URL}
          title="Active Orders"
          className="w-full h-full border-0 block bg-white"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          loading="eager"
        />
      </div>

      {/* 2. ALERT OVERLAY - Only visible when ringing */}
      {status === MonitorStatus.ALERT && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
            <button 
              onClick={stopAlert}
              className="bg-orange-600 text-white w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-bounce flex flex-col items-center group active:scale-95 transition-transform border-4 border-white/10"
            >
              <div className="bg-white/20 p-5 rounded-full mb-4">
                <Zap size={56} className="fill-white" />
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tight mb-2">New Order!</h2>
              <p className="font-medium text-orange-100 text-lg">Tap to Open</p>
            </button>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        isSimulated={isSimulatedMode}
        onToggleSimulated={() => {
          stopMonitoring();
          setIsSimulatedMode(!isSimulatedMode);
        }}
        zoomLevel={zoomLevel}
        onZoomChange={updateZoom}
      />

      {/* 3. FLOATING CONTROLS (Overlay) */}
      <ControlBar
        status={status}
        isMuted={isMuted}
        onToggleMonitoring={toggleMonitoring}
        onToggleMute={() => setIsMuted(!isMuted)}
        lastCheck={lastCheck}
        onRefreshFrame={refreshIframe}
        onOpenSettings={() => setShowSettings(true)}
      />
    </div>
  );
};

export default App;
