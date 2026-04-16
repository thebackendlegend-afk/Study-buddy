import React, { useState, useRef, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import axios from 'axios';

const ActivityTracker = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [screenTime, setScreenTime] = useState(0);
  const [detectedText, setDetectedText] = useState('');
  const [faceExpression, setFaceExpression] = useState('');
  const [activities, setActivities] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const workerRef = useRef(null);
  const faceDetectorRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const initTesseract = async () => {
      workerRef.current = await createWorker('eng');
    };
    initTesseract();

    const initFaceDetector = async () => {
      if ('FaceDetector' in window) {
        faceDetectorRef.current = new window.FaceDetector();
      }
    };
    initFaceDetector();

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startTracking = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setIsTracking(true);

      intervalRef.current = setInterval(async () => {
        setScreenTime(prev => prev + 1);
        await captureAndAnalyze();
      }, 1000);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopTracking = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsTracking(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    sendReport();
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    // OCR
    if (workerRef.current) {
      const { data: { text } } = await workerRef.current.recognize(canvas);
      setDetectedText(text);
      setActivities(prev => [...prev, { type: 'screen_content', content: text, timestamp: new Date() }]);
    }

    // Face Detection
    if (faceDetectorRef.current) {
      try {
        const faces = await faceDetectorRef.current.detect(canvas);
        if (faces.length > 0) {
          // Simple expression detection (placeholder)
          setFaceExpression('engaged'); // In reality, analyze landmarks
          setActivities(prev => [...prev, { type: 'face_expression', expression: 'engaged', timestamp: new Date() }]);
        }
      } catch (error) {
        console.error('Face detection error:', error);
      }
    }
  };

  const sendReport = async () => {
    const report = {
      screenTime,
      activities,
      timestamp: new Date()
    };

    try {
      await axios.post('/api/send-report', report);
      alert('Report sent to parent!');
    } catch (error) {
      console.error('Error sending report:', error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Activity Tracker</h1>
      <video ref={videoRef} autoPlay muted className="border mb-4" />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="mb-4">
        <p>Screen Time: {Math.floor(screenTime / 60)}:{(screenTime % 60).toString().padStart(2, '0')}</p>
        <p>Detected Text: {detectedText}</p>
        <p>Face Expression: {faceExpression}</p>
      </div>
      <button onClick={isTracking ? stopTracking : startTracking} className="bg-blue-500 text-white px-4 py-2 rounded">
        {isTracking ? 'Stop Tracking' : 'Start Tracking'}
      </button>
    </div>
  );
};

export default ActivityTracker;