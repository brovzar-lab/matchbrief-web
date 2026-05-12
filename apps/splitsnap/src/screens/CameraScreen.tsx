import { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isDemoMode } from '../lib/demo';
import { useAppStore } from '../lib/store';
import { DEMO_OCR_ITEMS } from '../lib/mockData';

export default function CameraScreen(): JSX.Element {
  const navigate = useNavigate();
  const addToast = useAppStore((s) => s.addToast);
  const setPendingItems = useAppStore((s) => s.setPendingItems);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      setCameraError(true);
    }
  }, []);

  useEffect(() => {
    void startCamera();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [startCamera]); // stream intentionally excluded — only run on mount/unmount

  function stopStream(): void {
    stream?.getTracks().forEach((t) => t.stop());
  }

  function handleCapture(): void {
    if (!canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
    stopStream();
    processImage(base64);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const base64 = result.split(',')[1];
      processImage(base64);
    };
    reader.readAsDataURL(file);
  }

  function processImage(base64: string): void {
    if (isDemoMode) {
      setPendingItems(DEMO_OCR_ITEMS);
      navigate('/session/demo-session-new/scanning', { state: { base64, demo: true } });
    } else {
      navigate('/session/new/scanning', { state: { base64 } });
    }
  }

  function handleManualEntry(): void {
    if (isDemoMode) {
      addToast('Demo mode — showing sample items');
      setPendingItems(DEMO_OCR_ITEMS);
      navigate('/session/demo-session-new/edit', { state: { manual: true } });
    } else {
      navigate('/session/new/edit', { state: { manual: true } });
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Back button */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 pt-12">
        <button
          onClick={() => { stopStream(); navigate(-1); }}
          className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="text-white font-semibold text-sm">Snap Receipt</p>
        <div className="w-10" />
      </div>

      {/* Camera viewfinder */}
      <div className="flex-1 relative overflow-hidden">
        {!cameraError ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Receipt overlay guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-2 border-white/60 rounded-xl w-72 h-48 relative">
                <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-xl" />
                <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-xl" />
                <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-xl" />
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-xl" />
              </div>
            </div>
            <p className="absolute bottom-32 left-0 right-0 text-center text-white/70 text-sm">
              Align receipt within the frame
            </p>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/70 gap-4 p-8">
            <span className="text-5xl">📷</span>
            <p className="text-center text-sm">Camera not available. Use file picker or manual entry below.</p>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="bg-black pb-10 pt-6 px-6 flex flex-col gap-4">
        {!cameraError && (
          <button
            onClick={handleCapture}
            className="mx-auto w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <div className="w-13 h-13 rounded-full bg-white border-4 border-gray-300" />
          </button>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-white/10 text-white rounded-xl py-3 text-sm font-semibold hover:bg-white/20 transition-colors"
          >
            📂 Choose File
          </button>
          <button
            onClick={handleManualEntry}
            className="flex-1 bg-white/10 text-white rounded-xl py-3 text-sm font-semibold hover:bg-white/20 transition-colors"
          >
            ✏️ Enter Manually
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
