"use client";

import { useEffect, useMemo, useState } from "react";
import { checkpoints, VIDEO_DURATION, type Checkpoint } from "@/frontend/features/learning/data/lesson.data";

export function useInteractiveVideo() {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [completedCheckpoints, setCompletedCheckpoints] = useState<number[]>([]);
  const [activeCheckpoint, setActiveCheckpoint] = useState<Checkpoint | null>(null);
  const [videoComplete, setVideoComplete] = useState(false);

  useEffect(() => {
    if (!playing || activeCheckpoint || videoComplete) return;
    const timer = window.setInterval(() => {
      setCurrentTime((time) => Math.min(VIDEO_DURATION, time + 0.25 * speed));
    }, 250);
    return () => window.clearInterval(timer);
  }, [activeCheckpoint, playing, speed, videoComplete]);

  useEffect(() => {
    if (activeCheckpoint || videoComplete) return;
    const pending = checkpoints.find(
      (checkpoint) => currentTime >= checkpoint.time && !completedCheckpoints.includes(checkpoint.id),
    );
    if (pending) {
      const pauseAtCheckpoint = window.setTimeout(() => {
        setPlaying(false);
        setActiveCheckpoint(pending);
      }, 0);
      return () => window.clearTimeout(pauseAtCheckpoint);
    }
    if (currentTime >= VIDEO_DURATION && completedCheckpoints.length === checkpoints.length) {
      const finishVideo = window.setTimeout(() => {
        setPlaying(false);
        setVideoComplete(true);
      }, 0);
      return () => window.clearTimeout(finishVideo);
    }
  }, [activeCheckpoint, completedCheckpoints, currentTime, videoComplete]);

  const progress = useMemo(() => (currentTime / VIDEO_DURATION) * 100, [currentTime]);

  function answerCheckpoint() {
    if (!activeCheckpoint) return;
    setCompletedCheckpoints((current) => [...current, activeCheckpoint.id]);
    setActiveCheckpoint(null);
    setPlaying(true);
  }

  function seek(time: number) {
    setCurrentTime(time);
    if (time < VIDEO_DURATION) setVideoComplete(false);
  }

  function reset() {
    setCurrentTime(0);
    setCompletedCheckpoints([]);
    setActiveCheckpoint(null);
    setVideoComplete(false);
    setPlaying(false);
  }

  return {
    activeCheckpoint,
    answerCheckpoint,
    completedCheckpoints,
    currentTime,
    playing,
    progress,
    reset,
    seek,
    setPlaying,
    setSpeed,
    speed,
    videoComplete,
  };
}
