import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, X, Check, Volume2 } from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';

export const AudioMemoRecorder = () => {
  const { isAudioRecorderOpen, setAudioRecorderOpen, addElement, stagePos, stageScale } = useCanvasStore();

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [title, setTitle] = useState('Voice Note');
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioElementRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  if (!isAudioRecorderOpen) return null;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone access is required to record voice notes.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const togglePlay = () => {
    if (!audioElementRef.current && audioUrl) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioElementRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current?.play();
      setIsPlaying(true);
    }
  };

  const handlePinToCanvas = () => {
    const centerX = (-stagePos.x + window.innerWidth / 2) / stageScale - 100;
    const centerY = (-stagePos.y + window.innerHeight / 2) / stageScale - 30;

    addElement({
      id: `audio-${Date.now()}`,
      type: 'audio',
      title: title || 'Voice Recording',
      duration: recordingSeconds,
      audioUrl: audioUrl,
      x: centerX,
      y: centerY,
    });

    setAudioRecorderOpen(false);
  };

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-[#141824] border border-slate-700/80 shadow-2xl p-6 select-none">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record Audio Memo</h3>
              <p className="text-[11px] text-slate-400">Record voice annotations synced to your whiteboard</p>
            </div>
          </div>
          <button
            onClick={() => setAudioRecorderOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-6 flex flex-col items-center justify-center space-y-4">
          {/* Animated recording pulse or timer */}
          <div className="relative">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/50 ring-4 ring-rose-500/30'
                  : audioUrl
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {isRecording ? (
                <Mic className="w-10 h-10 animate-bounce" />
              ) : audioUrl ? (
                <Volume2 className="w-10 h-10" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </div>
          </div>

          <div className="text-center">
            <span className="text-2xl font-mono font-bold text-white">
              {formatSeconds(recordingSeconds)}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              {isRecording
                ? 'Recording voice in progress...'
                : audioUrl
                ? 'Recording ready to attach'
                : 'Click Record to start'}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 pt-2">
            {!isRecording && !audioUrl && (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-transform active:scale-95"
              >
                <Mic className="w-4 h-4" />
                <span>Start Recording</span>
              </button>
            )}

            {isRecording && (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/40 shadow-lg transition-transform active:scale-95"
              >
                <Square className="w-4 h-4 fill-rose-400" />
                <span>Stop</span>
              </button>
            )}

            {audioUrl && (
              <>
                <button
                  onClick={togglePlay}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pause' : 'Play Preview'}</span>
                </button>
                <button
                  onClick={() => {
                    setAudioUrl('');
                    setAudioBlob(null);
                    setRecordingSeconds(0);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                  title="Discard Recording"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {audioUrl && (
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Memo Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Key take-away, Math explanation"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setAudioRecorderOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handlePinToCanvas}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Pin to Whiteboard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
