import { useEffect, useMemo, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';

const sessions = [
  { label: 'Focus', duration: 25 * 60, accent: '#00ff9d' },
  { label: 'Short Break', duration: 5 * 60, accent: '#8b5cf6' },
  { label: 'Long Break', duration: 15 * 60, accent: '#38bdf8' }
];

function PomodoroTimer() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [remaining, setRemaining] = useState(sessions[0].duration);
  const [running, setRunning] = useState(false);
  const [cameraStatus, setCameraStatus] = useState('inactive');
  const [ocrText, setOcrText] = useState('No text detected yet.');
  const [faceResult, setFaceResult] = useState(null);
  const [expression, setExpression] = useState('Unknown');
  const [cameraError, setCameraError] = useState('');
  const [cameraStream, setCameraStream] = useState(null);
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const startCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera access is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      setCameraStream(stream);
      setCameraStatus('camera');
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream;
      }
    } catch (error) {
      setCameraStatus('inactive');
      setCameraError('Camera permission denied or unavailable.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
      setCameraStatus('inactive');
      setFaceResult(null);
      setExpression('Unknown');
    }
  };

  const captureScreenForOcr = async () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setCameraError('Screen capture is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream;
      }
      setCameraStream(stream);
      setCameraStatus('screen');
      await runOcr();
    } catch (error) {
      setCameraError('Screen capture denied or unavailable.');
    }
  };

  const runOcr = async () => {
    setCameraError('');
    if (!cameraRef.current || !canvasRef.current) {
      setCameraError('No video source available for OCR.');
      return;
    }

    const video = cameraRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const result = await Tesseract.recognize(canvas, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setCameraStatus(`OCR: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      setOcrText(result.data.text || 'No text captured.');
      setCameraStatus('ocr-complete');
    } catch (error) {
      setCameraError('OCR failed. Please try again.');
    }
  };

  const detectFaceExpression = async () => {
    setCameraError('');
    if (!cameraRef.current) {
      setCameraError('Open the camera or screen capture first.');
      return;
    }

    if (!window.FaceDetector) {
      setExpression('Face detection is not supported in this browser.');
      return;
    }

    try {
      const detector = new window.FaceDetector();
      const faces = await detector.detect(cameraRef.current);
      setFaceResult(faces);
      setCameraStatus('face-detected');

      if (faces.length === 0) {
        setExpression('No face detected');
        return;
      }

      const face = faces[0];
      const nose = face.landmarks.find((landmark) => landmark.type === 'nose');
      const mouth = face.landmarks.find((landmark) => landmark.type === 'mouth');
      if (mouth && nose && mouth.locations?.length && nose.locations?.length) {
        const mouthVisibleCount = mouth.locations.reduce((count, point) => count + (point.y > nose.locations[0].y ? 1 : 0), 0);
        setExpression(mouthVisibleCount > 3 ? 'Smiling / Engaged' : 'Neutral / Focused');
      } else {
        setExpression('Face detected');
      }
    } catch (error) {
      setCameraError('Face detection failed or unsupported.');
    }
  };

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setRemaining((current) => {
          if (current <= 1) {
            const nextIndex = (activeIndex + 1) % sessions.length;
            setActiveIndex(nextIndex);
            return sessions[nextIndex].duration;
          }
          return current - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running, activeIndex]);

  useEffect(() => {
    setRemaining(sessions[activeIndex].duration);
  }, [activeIndex]);

  useEffect(() => {
    if (cameraStream && cameraRef.current) {
      cameraRef.current.srcObject = cameraStream;
      cameraRef.current.play().catch(() => {});
    }
  }, [cameraStream]);

  const minutes = Math.floor(remaining / 60).toString().padStart(2, '0');
  const seconds = (remaining % 60).toString().padStart(2, '0');

  const progress = useMemo(() => {
    return ((sessions[activeIndex].duration - remaining) / sessions[activeIndex].duration) * 100;
  }, [activeIndex, remaining]);

  useEffect(() => {
    setRemaining(sessions[activeIndex].duration);
  }, [activeIndex]);

  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[32px] border border-[#00ff9d]/10 bg-[#081014]/95 p-8 shadow-[0_0_40px_rgba(0,255,157,0.14)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[#00ff9d]">Focus mode</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{sessions[activeIndex].label}</h2>
          </div>
          <div className="rounded-3xl bg-[#061014] px-4 py-3 text-sm text-white/70">{minutes}:{seconds}</div>
        </div>

        <div className="mt-8 overflow-hidden rounded-full bg-white/5">
          <div className="h-3 rounded-full bg-gradient-to-r from-[#00ff9d] via-[#6ee7b7] to-[#0cc9a6] transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {sessions.map((session, index) => (
            <button
              key={session.label}
              onClick={() => setActiveIndex(index)}
              className={`rounded-3xl border px-4 py-3 text-sm font-semibold transition ${activeIndex === index ? 'border-[#00ff9d] bg-[#0a1710] text-white' : 'border-white/10 bg-[#07110f] text-white/70 hover:border-[#00ff9d]/40 hover:bg-white/5'}`}
            >
              {session.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[32px] border border-[#00ff9d]/10 bg-[#081014]/95 p-8 shadow-[0_0_40px_rgba(0,255,157,0.14)]">
        <h3 className="text-xl font-semibold text-white">Controls</h3>
        <p className="mt-3 text-sm text-white/70">Use the timer to work in deep focus sessions with periodic breaks for better retention.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={() => setRunning(true)} className="rounded-3xl bg-[#00ff9d] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#8cffb8]">Start</button>
          <button onClick={() => setRunning(false)} className="rounded-3xl border border-white/10 bg-[#061011] px-5 py-3 text-sm text-white transition hover:border-[#00ff9d]/40 hover:bg-white/5">Pause</button>
          <button onClick={() => setRemaining(sessions[activeIndex].duration)} className="rounded-3xl border border-white/10 bg-[#061011] px-5 py-3 text-sm text-white transition hover:border-[#00ff9d]/40 hover:bg-white/5">Reset</button>
        </div>
      </div>
    </section>
  );
}

export default PomodoroTimer;

