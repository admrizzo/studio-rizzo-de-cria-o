import { useState, useEffect, useRef, useCallback } from "react";

const DEFAULT_MUSIC_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/audio-assets/trilha-padrao.mp3`;

export function useBackgroundMusic() {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const generate = useCallback(async (_duration?: number) => {
    if (ready || loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(DEFAULT_MUSIC_URL);
      if (!response.ok) {
        throw new Error(`Music fetch failed: ${response.status}`);
      }

      const blob = await response.blob();
      if (blob.size < 100) throw new Error("Audio file too small");

      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = 0.25;
      audioRef.current = audio;
      setReady(true);
    } catch (err) {
      console.error("Background music error:", err);
      setError(err instanceof Error ? err.message : "Failed to load music");
    } finally {
      setLoading(false);
    }
  }, [ready, loading]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.paused) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      const fadeInterval = setInterval(() => {
        if (audio.volume > 0.02) {
          audio.volume = Math.max(0, audio.volume - 0.02);
        } else {
          audio.pause();
          audio.volume = 0.25;
          clearInterval(fadeInterval);
        }
      }, 50);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (audioRef.current) audioRef.current.volume = vol;
  }, []);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  return { generate, play, stop, setVolume, loading, ready, error };
}
