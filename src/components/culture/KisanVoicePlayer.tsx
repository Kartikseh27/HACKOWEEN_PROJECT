/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, Sparkles } from 'lucide-react';
import { Language } from '../../types';

interface KisanVoicePlayerProps {
  text: string;
  language: Language;
  label?: string;
  className?: string;
  compact?: boolean;
}

export const KisanVoicePlayer: React.FC<KisanVoicePlayerProps> = ({
  text,
  language,
  label,
  className = '',
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const cleanTextForSpeech = (rawText: string): string => {
    return rawText
      .replace(/[*_#`~[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleSpeak = () => {
    if (!isSupported) return;

    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    if (isPlaying && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();

    const textToSpeak = cleanTextForSpeech(text);
    if (!textToSpeak) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.92; // Slightly measured, respectful pace for clarity
    utterance.pitch = 1.0;

    // Pick appropriate voice if available
    const voices = window.speechSynthesis.getVoices();
    if (language === 'hi') {
      const hindiVoice = voices.find(v => v.lang.startsWith('hi') || v.lang.includes('IN'));
      if (hindiVoice) utterance.voice = hindiVoice;
      utterance.lang = 'hi-IN';
    } else {
      const indianEnVoice = voices.find(v => v.lang === 'en-IN' || v.lang.startsWith('en'));
      if (indianEnVoice) utterance.voice = indianEnVoice;
      utterance.lang = 'en-IN';
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!isSupported) return null;

  const defaultLabel = language === 'hi' ? 'बोलकर सुनें' : 'Listen Aloud';
  const displayLabel = label || defaultLabel;

  if (compact) {
    return (
      <button
        onClick={handleSpeak}
        title={isPlaying ? (language === 'hi' ? 'रोकें' : 'Pause') : displayLabel}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all shadow-xs ${
          isPlaying
            ? 'bg-amber-600 text-white animate-pulse'
            : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
        } ${className}`}
      >
        {isPlaying ? (
          <>
            <Pause className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'रोकें' : 'Pause'}</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-amber-700" />
            <span>{displayLabel}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 p-1.5 px-3 rounded-xl border transition-all ${
        isPlaying
          ? 'bg-amber-50 border-amber-400 shadow-sm'
          : 'bg-stone-50 border-stone-200 hover:border-amber-400 hover:bg-amber-50/50'
      } ${className}`}
    >
      <button
        onClick={handleSpeak}
        className={`flex items-center gap-2 text-xs font-bold transition-colors ${
          isPlaying ? 'text-amber-900' : 'text-stone-700 hover:text-amber-900'
        }`}
      >
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
            isPlaying ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {isPlaying ? (
            isPaused ? (
              <Play className="w-3 h-3 fill-current" />
            ) : (
              <Pause className="w-3 h-3 fill-current" />
            )
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </div>
        <span>{isPlaying ? (isPaused ? (language === 'hi' ? 'जारी रखें' : 'Resume') : (language === 'hi' ? 'सुन रहे हैं...' : 'Speaking...')) : displayLabel}</span>
      </button>

      {isPlaying && (
        <>
          {/* Animated sound wave bars */}
          <div className="flex items-center gap-0.5 h-4 px-1">
            <span className="w-1 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
            <span className="w-1 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.15s] h-4" />
            <span className="w-1 bg-amber-500 rounded-full animate-bounce h-2.5" />
          </div>

          <button
            onClick={handleStop}
            className="p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-200/60 rounded"
            title={language === 'hi' ? 'बंद करें' : 'Stop'}
          >
            <VolumeX className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
};

