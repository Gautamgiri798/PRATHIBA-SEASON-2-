"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion, animate } from "framer-motion";
import CountUp from "react-countup";
import confetti from "canvas-confetti";
import Link from "next/link";
import type { Category } from "@/lib/categories";

// Remote Lottie Animation URLs
const LOTTIE_TROPHY_URL = "https://assets2.lottiefiles.com/packages/lf20_touoh4ky.json";
const LOTTIE_CELEBRATION_URL = "https://assets5.lottiefiles.com/packages/lf20_kolp8qea.json";

// Safe dynamic import of Lottie-React to prevent SSR issues
let LottieComponent: any = null;
if (typeof window !== "undefined") {
  LottieComponent = require("lottie-react").default;
}

type NomineeResult = {
  id: string;
  name: string;
  song?: string;
  subtitle?: string;
  imageUrl?: string;
  votes: number;
  percentage: number;
  rank: number;
};

type RevealData = {
  category: {
    id: string;
    title: string;
    group: string;
    description: string;
  };
  totalVotes: number;
  results: NomineeResult[];
};

type Phase = "idle" | "loading" | "countdown" | "graph-init" | "vote-reveal" | "winner-highlight" | "celebration";

function getRankTheme(rank: number) {
  switch (rank) {
    case 1:
      return {
        color: "gold",
        text: "text-gold-light",
        border: "border-gold/60",
        photoBorder: "border-gold",
        barFill: "bg-gradient-to-t from-gold-deep via-gold to-gold-light shadow-[0_0_20px_rgba(201,151,61,0.5)]",
        cardBg: "from-charLight via-char to-ink",
        pillBg: "bg-gold text-ink border border-gold/50",
        pillText: "RANK 1",
        glow: "shadow-[0_0_30px_rgba(201,151,61,0.35)]"
      };
    case 2:
      return {
        color: "purple",
        text: "text-purple-400",
        border: "border-purple-500/30",
        photoBorder: "border-purple-500",
        barFill: "bg-gradient-to-t from-purple-800 via-purple-500 to-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]",
        cardBg: "from-char/40 to-ink/60",
        pillBg: "bg-purple-950/30 text-purple-300 border border-purple-500/30",
        pillText: "RANK 2",
        glow: "shadow-[0_0_15px_rgba(168,85,247,0.1)]"
      };
    case 3:
      return {
        color: "blue",
        text: "text-blue-400",
        border: "border-blue-500/30",
        photoBorder: "border-blue-500",
        barFill: "bg-gradient-to-t from-blue-800 via-blue-500 to-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.4)]",
        cardBg: "from-char/40 to-ink/60",
        pillBg: "bg-blue-950/30 text-blue-300 border border-blue-500/30",
        pillText: "RANK 3",
        glow: "shadow-[0_0_15px_rgba(59,130,246,0.1)]"
      };
    case 4:
      return {
        color: "green",
        text: "text-emerald-400",
        border: "border-emerald-500/30",
        photoBorder: "border-emerald-500",
        barFill: "bg-gradient-to-t from-emerald-800 via-emerald-500 to-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]",
        cardBg: "from-char/40 to-ink/60",
        pillBg: "bg-emerald-950/30 text-emerald-300 border border-emerald-500/30",
        pillText: "RANK 4",
        glow: "shadow-[0_0_15px_rgba(16,185,129,0.1)]"
      };
    default:
      return {
        color: "orange",
        text: "text-orange-400",
        border: "border-orange-500/30",
        photoBorder: "border-orange-500",
        barFill: "bg-gradient-to-t from-orange-800 via-orange-500 to-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.4)]",
        cardBg: "from-char/40 to-ink/60",
        pillBg: "bg-orange-950/30 text-orange-300 border border-orange-500/30",
        pillText: `RANK ${rank}`,
        glow: "shadow-[0_0_15px_rgba(249,115,22,0.1)]"
      };
  }
}

// Synthesize cinematic audio using Web Audio API (zero external assets, works offline)
class AudioSynth {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    // Resume context if suspended (browser security)
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Synthesize a brief sci-fi countdown beep
  playBeep(freq = 600, duration = 0.15) {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio synthesis error:", e);
    }
  }

  // Synthesize a deep drum roll rumble
  playDrumRoll(durationSeconds: number) {
    this.init();
    if (!this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * durationSeconds;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Generate white noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = buffer;

      // Filter noise to sound like a low rumbling kettle drum
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(100, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(350, this.ctx.currentTime + durationSeconds);

      // Modulate volume rapidly to create a rolling/beating effect (LFO simulation)
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 0.5);
      
      // Modulate volume roll
      const modSpeed = 18; // 18 beats per second
      for (let t = 0; t < durationSeconds; t += 1 / modSpeed) {
        const volumeFactor = 0.2 + 0.8 * Math.abs(Math.sin(t * Math.PI * modSpeed));
        gainNode.gain.setValueAtTime(0.4 * volumeFactor, this.ctx.currentTime + t);
      }
      
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + durationSeconds);

      noiseNode.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      // Also add a low sine rumble frequency for physical depth
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(45, this.ctx.currentTime);
      subOsc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + durationSeconds);
      
      subGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      subGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + durationSeconds);
      
      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);

      noiseNode.start();
      subOsc.start();

      noiseNode.stop(this.ctx.currentTime + durationSeconds);
      subOsc.stop(this.ctx.currentTime + durationSeconds);
    } catch (e) {
      console.warn("Drum roll synthesis error:", e);
    }
  }

  // Synthesize a major golden gong/chime explosion
  playGong() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Synthesize gong by layering metallic frequencies
      const frequencies = [110, 142, 178, 220, 310, 395, 440];
      
      frequencies.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = idx % 2 === 0 ? "sawtooth" : "triangle";
        osc.frequency.setValueAtTime(freq, now);
        
        // Slightly detune for metallic chorus texture
        osc.detune.setValueAtTime(idx * 4 - 12, now);
        
        const peakGain = idx === 0 ? 0.3 : 0.15;
        gain.gain.setValueAtTime(peakGain, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);
        
        osc.start();
        osc.stop(now + 4);
      });
      
      // Add a lowpass sweep for dramatic impact
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1000, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + 2);
    } catch (e) {
      console.warn("Gong synthesis error:", e);
    }
  }

  // Synthesize victory fanfare chimes
  playVictory() {
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
      const now = this.ctx.currentTime;
      
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.2, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 1.5);
        
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 1.8);
      });
    } catch (e) {
      console.warn("Victory synthesis error:", e);
    }
  }
}

// Global synth instance
const audio = new AudioSynth();

export default function RevealClient({
  categories,
  isTest,
}: {
  categories: Category[];
  isTest: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [loadingText, setLoadingText] = useState("");
  const [countdownNum, setCountdownNum] = useState(10);
  const [countdownText, setCountdownText] = useState("10");
  const [resultsData, setResultsData] = useState<RevealData | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [activeWinners, setActiveWinners] = useState<NomineeResult[]>([]);
  const isRevealedPhase =
    phase === "graph-init" ||
    phase === "vote-reveal" ||
    phase === "winner-highlight" ||
    phase === "celebration";
  const [sortOrder, setSortOrder] = useState<"original" | "ranked">("original");
  const [globalProgress, setGlobalProgress] = useState(0);
  const [showCongratsCard, setShowCongratsCard] = useState(false);

  // Lottie Animation States
  const [lottieTrophy, setLottieTrophy] = useState<any>(null);
  const [lottieCelebration, setLottieCelebration] = useState<any>(null);

  // Particle background for countdown
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const winnerAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentPlayingSongRef = useRef<string | null>(null);

  // Fetch Lottie JSONs on client load
  useEffect(() => {
    fetch(LOTTIE_TROPHY_URL)
      .then((r) => r.json())
      .then((data) => setLottieTrophy(data))
      .catch((err) => console.warn("Lottie Trophy load failed, using fallback:", err));

    fetch(LOTTIE_CELEBRATION_URL)
      .then((r) => r.json())
      .then((data) => setLottieCelebration(data))
      .catch((err) => console.warn("Lottie Confetti load failed, using fallback:", err));
  }, []);

  // Keyboard navigation support
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && phase === "countdown") {
        setPhase("idle");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase]);

  // Loading Hype Messages sequence (Phase 1)
  useEffect(() => {
    if (phase !== "loading") return;

    const texts = [
      "Establishing quantum connection to secure database...",
      "Retrieving encrypted voter ballot sheets...",
      "Running double-entry audit check on candidate tallies...",
      "Calculating vote shares and percentages...",
      "Final reports assembled. Decrypting reveal dashboard...",
    ];

    let currentIdx = 0;
    setLoadingText(texts[0]);

    const interval = setInterval(() => {
      currentIdx++;
      if (currentIdx < texts.length) {
        setLoadingText(texts[currentIdx]);
      } else {
        clearInterval(interval);
        // Start countdown Phase 2 automatically
        setPhase("countdown");
      }
    }, 600);

    return () => clearInterval(interval);
  }, [phase]);

  // Countdown timer logic (Phase 2)
  useEffect(() => {
    if (phase !== "countdown") return;

    setCountdownNum(10);
    setCountdownText("10");
    setIsScreenShaking(false);

    // Play synthesized drum roll immediately (10 seconds long)
    audio.playDrumRoll(10.5);

    const timer = setInterval(() => {
      setCountdownNum((prev) => {
        const next = prev - 1;
        if (next > 0) {
          setCountdownText(String(next));
          audio.playBeep(500 + (10 - next) * 80, 0.15); // incremental beep pitch
          
          // Screen shake on 3, 2, 1
          if (next <= 3) {
            setIsScreenShaking(true);
            setTimeout(() => setIsScreenShaking(false), 200);
          }
          return next;
        } else if (next === 0) {
          setCountdownText("GO!");
          audio.playGong();
          setIsScreenShaking(true);
          setTimeout(() => setIsScreenShaking(false), 500);
          return 0;
        } else {
          clearInterval(timer);
          // Transition to Phase 3: Graph Init
          setPhase("graph-init");
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  // Fetch results as soon as we enter Phase 3 (Graph Initialization)
  useEffect(() => {
    if (phase !== "graph-init") return;

    async function loadData() {
      try {
        setLoadingError(null);
        const res = await fetch(
          `/api/admin/reveal?category=${selectedCategoryId}${isTest ? "&mode=test" : ""}`
        );
        if (!res.ok) {
          throw new Error("Failed to load results securely. Session may be expired.");
        }
        const data: RevealData = await res.json();
        setResultsData(data);

        // Move to Phase 4 (Animated Vote Reveal) after 1.5 seconds of showing 0% bars
        setTimeout(() => {
          setPhase("vote-reveal");
        }, 1500);
      } catch (err: any) {
        setLoadingError(err.message || "An unexpected error occurred.");
        setPhase("idle");
      }
    }

    loadData();
  }, [phase, selectedCategoryId, isTest]);

  // Phase 4 -> Phase 5 -> Phase 6 Timeline Transitions
  useEffect(() => {
    if (phase !== "vote-reveal" || !resultsData) return;

    // Phase 4 animated vote reveal lasts for 18.5 seconds (slowing it down to accommodate the 18s growth + buffer)
    const revealTimer = setTimeout(() => {
      setPhase("winner-highlight");
    }, 18500);

    return () => {
      clearTimeout(revealTimer);
    };
  }, [phase, resultsData]);

  // Synchronized global progress bar growth animation using requestAnimationFrame
  useEffect(() => {
    if (phase === "winner-highlight" || phase === "celebration") {
      setGlobalProgress(1);
      return;
    }

    if (phase !== "vote-reveal") {
      setGlobalProgress(0);
      return;
    }

    let animFrameId: number;
    const delay = 2000; // 2.0 seconds delay at 0%
    const duration = 17000; // 17 seconds actual animation (19.0s total)
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed < delay) {
        setGlobalProgress(0);
        animFrameId = requestAnimationFrame(tick);
        return;
      }

      const activeElapsed = elapsed - delay;
      const progress = Math.min(activeElapsed / duration, 1);

      // cubic bezier easing curve (easeOutCubic is extremely smooth and fits [0.25, 0.1, 0.25, 1.0])
      // f(t) = 1 - (1 - t)^3
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      setGlobalProgress(easedProgress);

      if (progress < 1) {
        animFrameId = requestAnimationFrame(tick);
      }
    };

    animFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameId);
  }, [phase]);

  useEffect(() => {
    if (phase !== "winner-highlight" || !resultsData) return;

    // Identify winners
    const topVotes = resultsData.results.length > 0 ? resultsData.results[0].votes : 0;
    const winners = resultsData.results.filter((r) => r.votes === topVotes && r.votes > 0);
    setActiveWinners(winners);

    audio.playVictory();

    // Move to Phase 6 (Celebration) after 1 second
    const celebrationTimer = setTimeout(() => {
      setPhase("celebration");
    }, 1000);

    return () => clearTimeout(celebrationTimer);
  }, [phase, resultsData]);

  // Continuous Confetti and Fireworks in Phase 6
  useEffect(() => {
    if (phase !== "celebration") return;

    // Fire initial massive burst
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#F4D77B", "#C9973D", "#8B6914", "#ffffff"],
    });

    const duration = 6 * 1000;
    const end = Date.now() + duration;

    // Confetti shower
    const confettiInterval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(confettiInterval);
        return;
      }
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ["#F4D77B", "#C9973D", "#8B6914"],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ["#F4D77B", "#C9973D", "#8B6914"],
      });
    }, 150);

    // Fireworks bursts
    const fireworksInterval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(fireworksInterval);
        return;
      }
      confetti({
        particleCount: 40,
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random() * 0.8 + 0.1, y: Math.random() * 0.4 + 0.15 },
        colors: ["#F4D77B", "#C9973D", "#8B6914", "#ffffff"],
      });
    }, 800);

    return () => {
      clearInterval(confettiInterval);
      clearInterval(fireworksInterval);
    };
  }, [phase]);

  // Auto-transition to Congratulations Card after 1.5 seconds of celebration (2.5 seconds total hold after reveal)
  useEffect(() => {
    if (phase !== "celebration") {
      setShowCongratsCard(false);
      return;
    }
    const timer = setTimeout(() => {
      setShowCongratsCard(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [phase]);

  // Play winner's song when congrats card is revealed
  useEffect(() => {
    const shouldPlay = showCongratsCard && activeWinners.length > 0;
    if (shouldPlay) {
      const winner = activeWinners[0];
      if (winner.song) {
        // If this song is already playing, do nothing to avoid restarting
        if (currentPlayingSongRef.current === winner.song && winnerAudioRef.current) {
          return;
        }

        // Stop any currently playing audio first
        if (winnerAudioRef.current) {
          winnerAudioRef.current.pause();
        }

        // Try playing the song from /songs/[songName].mp3
        const songPath = `/songs/${encodeURIComponent(winner.song)}.mp3`;
        const audioObj = new Audio(songPath);
        audioObj.loop = true;
        audioObj.volume = 1.0;
        winnerAudioRef.current = audioObj;
        currentPlayingSongRef.current = winner.song;

        const playPromise = audioObj.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Autoplay of winner song failed or file not found:", err);
          });
        }
      }
    } else {
      // If we are not in a playing phase, stop the audio
      if (winnerAudioRef.current) {
        winnerAudioRef.current.pause();
        winnerAudioRef.current = null;
      }
      currentPlayingSongRef.current = null;
    }

    return () => {
      if (winnerAudioRef.current) {
        winnerAudioRef.current.pause();
        winnerAudioRef.current = null;
      }
      currentPlayingSongRef.current = null;
    };
  }, [phase, showCongratsCard, activeWinners]);

  // Particle background canvas animation
  useEffect(() => {
    const isActive = phase === "countdown" || isRevealedPhase;
    if (!isActive || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Create particles
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        speedY: -(Math.random() * 1.5 + 0.5),
        speedX: Math.random() * 1 - 0.5,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(11, 8, 6, 0.4)";
      ctx.fillRect(0, 0, width, height);

      // Pulse background lighting
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        100,
        width / 2,
        height / 2,
        width / 2
      );
      const intensity = 0.08 + Math.abs(Math.sin(Date.now() / 300)) * 0.05;
      grad.addColorStop(0, `rgba(201, 151, 61, ${intensity})`);
      grad.addColorStop(1, "rgba(11, 8, 6, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Render floating particles
      particles.forEach((p) => {
        ctx.fillStyle = `rgba(244, 215, 123, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [phase, isRevealedPhase]);

  const currentCategory = useMemo(() => {
    return categories.find((c) => c.id === selectedCategoryId);
  }, [categories, selectedCategoryId]);

  const maxPercentage = useMemo(() => {
    if (!resultsData || resultsData.results.length === 0) return 100;
    return Math.max(...resultsData.results.map((r) => r.percentage));
  }, [resultsData]);

  const orderedResults = useMemo(() => {
    if (!resultsData) return [];

    // Find the category in categories prop to get original nominee ordering
    const staticCategory = categories.find((c) => c.id === resultsData.category.id);
    const nomineeOrder = staticCategory 
      ? staticCategory.nominees.map((n) => n.id)
      : [];

    if (phase === "idle" || phase === "loading" || phase === "countdown" || phase === "graph-init") {
      return [...resultsData.results].sort((a, b) => {
        return nomineeOrder.indexOf(a.id) - nomineeOrder.indexOf(b.id);
      });
    }

    // Sort by current animated values descending (stable sort using original index as tie-breaker)
    return [...resultsData.results].sort((a, b) => {
      const valA = Math.min(a.percentage, globalProgress * maxPercentage);
      const valB = Math.min(b.percentage, globalProgress * maxPercentage);
      
      if (Math.abs(valA - valB) < 0.01) {
        return nomineeOrder.indexOf(a.id) - nomineeOrder.indexOf(b.id);
      }
      
      return valB - valA;
    });
  }, [resultsData, globalProgress, maxPercentage, phase, categories]);

  const handleStartReveal = () => {
    if (!selectedCategoryId) return;
    setSortOrder("original");
    setGlobalProgress(0);
    setPhase("loading");
  };

  const resetCelebration = () => {
    setSortOrder("original");
    setGlobalProgress(0);
    setPhase("idle");
    setResultsData(null);
    setActiveWinners([]);
    setShowCongratsCard(false);
  };


  return (
    <div
      className={`bg-ink relative min-h-screen w-full flex flex-col overflow-y-auto overflow-x-hidden transition-all duration-300 ${
        isScreenShaking ? "animate-[bounce_0.1s_infinite]" : ""
      }`}
    >
      {/* Dynamic Cinematic Stage Backdrop */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#030202]">
        {/* Injected Custom Stage Lighting Animations */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes sweep-left {
            0% { transform: rotate(-3deg); opacity: 0.35; }
            50% { transform: rotate(5deg); opacity: 0.48; }
            100% { transform: rotate(-3deg); opacity: 0.35; }
          }
          @keyframes sweep-right {
            0% { transform: rotate(3deg); opacity: 0.35; }
            50% { transform: rotate(-5deg); opacity: 0.48; }
            100% { transform: rotate(3deg); opacity: 0.35; }
          }
          @keyframes sweep-mid-left {
            0% { transform: rotate(-2deg); opacity: 0.2; }
            50% { transform: rotate(2deg); opacity: 0.3; }
            100% { transform: rotate(-2deg); opacity: 0.2; }
          }
          @keyframes sweep-mid-right {
            0% { transform: rotate(2deg); opacity: 0.2; }
            50% { transform: rotate(-2deg); opacity: 0.3; }
            100% { transform: rotate(2deg); opacity: 0.2; }
          }
          @keyframes glow-pulse {
            0% { opacity: 0.35; }
            50% { opacity: 0.55; }
            100% { opacity: 0.35; }
          }
        `}} />

        {/* Ambient background glow (Pulsing bloom) */}
        <div 
          className="absolute inset-0 transition-opacity duration-1000" 
          style={{ 
            background: 'radial-gradient(circle at center, rgba(20, 14, 8, 0.7) 0%, #030202 100%)',
            animation: 'glow-pulse 8s ease-in-out infinite'
          }}
        />

        {/* 1. Volumetric Sweep Spotlight Left */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ 
            background: 'radial-gradient(ellipse 35% 85% at 15% 0%, rgba(244, 215, 123, 0.22) 0%, rgba(201, 151, 61, 0.05) 45%, transparent 100%)',
            transformOrigin: '15% 0%',
            animation: 'sweep-left 14s ease-in-out infinite',
            opacity: phase === "winner-highlight" || phase === "celebration" ? 0.75 : 0.45
          }}
        />

        {/* 2. Volumetric Sweep Spotlight Mid-Left */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ 
            background: 'radial-gradient(ellipse 25% 75% at 35% 0%, rgba(244, 215, 123, 0.14) 0%, rgba(201, 151, 61, 0.03) 50%, transparent 100%)',
            transformOrigin: '35% 0%',
            animation: 'sweep-mid-left 11s ease-in-out infinite',
            opacity: phase === "winner-highlight" || phase === "celebration" ? 0.55 : 0.3
          }}
        />

        {/* 3. Volumetric Sweep Spotlight Mid-Right */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ 
            background: 'radial-gradient(ellipse 25% 75% at 65% 0%, rgba(244, 215, 123, 0.14) 0%, rgba(201, 151, 61, 0.03) 50%, transparent 100%)',
            transformOrigin: '65% 0%',
            animation: 'sweep-mid-right 11s ease-in-out infinite',
            opacity: phase === "winner-highlight" || phase === "celebration" ? 0.55 : 0.3
          }}
        />

        {/* 4. Volumetric Sweep Spotlight Right */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ 
            background: 'radial-gradient(ellipse 35% 85% at 85% 0%, rgba(244, 215, 123, 0.22) 0%, rgba(201, 151, 61, 0.05) 45%, transparent 100%)',
            transformOrigin: '85% 0%',
            animation: 'sweep-right 14s ease-in-out infinite',
            opacity: phase === "winner-highlight" || phase === "celebration" ? 0.75 : 0.45
          }}
        />

        {/* 5. Bottom Left Corner Uplight Flare */}
        <div 
          className="absolute bottom-[-10%] left-[-10%] w-[35vw] h-[35vw] min-w-[300px] min-h-[300px] rounded-full blur-[70px] pointer-events-none" 
          style={{ 
            background: 'radial-gradient(circle, rgba(244, 215, 123, 0.35) 0%, rgba(201, 151, 61, 0.1) 50%, transparent 70%)',
            opacity: phase === "winner-highlight" || phase === "celebration" ? 0.75 : 0.45
          }}
        />

        {/* 6. Bottom Right Corner Uplight Flare */}
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] min-w-[300px] min-h-[300px] rounded-full blur-[70px] pointer-events-none" 
          style={{ 
            background: 'radial-gradient(circle, rgba(244, 215, 123, 0.35) 0%, rgba(201, 151, 61, 0.1) 50%, transparent 70%)',
            opacity: phase === "winner-highlight" || phase === "celebration" ? 0.75 : 0.45
          }}
        />

        {/* 7. Center stage floor concentric ring reflections */}
        <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-[850px] h-[100px] rounded-[50%/20px] border-t border-gold/15 pointer-events-none z-0" />
        <div className="absolute bottom-[-35px] left-1/2 -translate-x-1/2 w-[950px] h-[120px] rounded-[50%/24px] border-t border-gold/8 pointer-events-none z-0" />
        <div className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 w-[1050px] h-[140px] rounded-[50%/28px] border-t border-gold/4 pointer-events-none z-0" />
      </div>

      {/* Floating particles canvas background (Global, visible after idle selection) */}
      {(phase !== "idle" && phase !== "loading") && (
        <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 w-full h-full z-0 opacity-55" />
      )}

      {/* Screen reader notification */}
      <div className="sr-only" role="status" aria-live="polite">
        {phase === "loading" && `Preparing results ceremony: ${loadingText}`}
        {phase === "countdown" && `Countdown: ${countdownText}`}
        {phase === "graph-init" && "Initializing voter tally chart."}
        {phase === "vote-reveal" && "Animating vote bars from zero percent."}
        {phase === "winner-highlight" &&
          activeWinners.length > 0 &&
          `Ceremony complete. The winner is ${activeWinners.map((w) => w.name).join(" and ")}`}
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10 flex flex-col min-h-screen">
        {/* Navigation Admin Header */}
        {phase === "idle" && (
          <header className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
            <div>
              <p className="font-mono text-[10px] tracking-widest text-gold-deep uppercase">
                Sambalpuriya Youth Association
              </p>
              <h1 className="mt-1 font-display font-black text-2xl sm:text-3xl text-parchment tracking-wide">
                CINEMATIC REVEAL <span className="text-gold-gradient">PORTAL ✨</span>
              </h1>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <Link
                href={`/admin${isTest ? "?mode=test" : ""}`}
                className="rounded-full border border-white/15 bg-char px-3.5 py-1.5 text-xs font-semibold text-muted hover:text-parchment hover:border-white/30 transition-colors"
              >
                📊 Dashboard
              </Link>
              <Link
                href={`/admin/winners${isTest ? "?mode=test" : ""}`}
                className="rounded-full border border-white/15 bg-char px-3.5 py-1.5 text-xs font-semibold text-muted hover:text-parchment hover:border-white/30 transition-colors"
              >
                🏆 Winners Only
              </Link>
              {isTest ? (
                <div className="rounded-full border border-purple-500/40 bg-purple-950/20 px-3.5 py-1.5 text-[11px] font-mono text-purple-300">
                  ⚡ Test DB
                </div>
              ) : (
                <div className="rounded-full border border-emerald-500/40 bg-emerald-950/20 px-3.5 py-1.5 text-[11px] font-mono text-emerald-300">
                  🟢 Live DB
                </div>
              )}
            </div>
          </header>
        )}

        <main className="flex-1 flex flex-col justify-center">
          {/* Phase: Idle selection screen */}
          {phase === "idle" && (
            <div className="w-full max-w-4xl mx-auto space-y-8 animate-rise">
              <div className="text-center max-w-xl mx-auto space-y-3">
                <h2 className="font-display font-bold text-3xl text-gold-gradient tracking-wide uppercase">
                  Select Award Category
                </h2>
                <p className="text-sm text-muted">
                  Choose a category below to initiate the television-style live results countdown and animated winner reveal sequence.
                </p>
              </div>

              {loadingError && (
                <div className="rounded-xl border border-maroon-light/40 bg-maroon/10 p-4 text-center text-sm text-maroon-light font-medium shadow-inner">
                  ❌ {loadingError}
                </div>
              )}

              {/* Responsive Category Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`relative text-left p-5 rounded-2xl border transition-all duration-300 overflow-hidden flex items-start gap-4 ${
                        isSelected
                          ? "border-gold bg-gold-deep/10 shadow-gold"
                          : "border-white/10 bg-char/40 hover:border-white/20 hover:bg-char/70"
                      }`}
                    >
                      {/* Decorative internal shine */}
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gold-gradient opacity-10 rounded-full blur-2xl" />
                      )}
                      
                      <div className="text-center font-mono text-[10px] uppercase font-bold text-gold-deep bg-ink/80 border border-white/5 w-8 h-8 flex items-center justify-center rounded-lg shrink-0">
                        {categories.indexOf(cat) + 1}
                      </div>

                      <div className="min-w-0">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-gold-light/60 font-semibold block mb-0.5">
                          {cat.group}
                        </span>
                        <h3 className="font-display text-lg font-bold text-parchment leading-tight truncate">
                          {cat.title}
                        </h3>
                        <p className="text-xs text-muted leading-relaxed mt-1 line-clamp-1">
                          {cat.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Start Ceremony Panel */}
              <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
                <button
                  disabled={!selectedCategoryId}
                  onClick={handleStartReveal}
                  className="relative group inline-flex items-center gap-3 rounded-full bg-gold-gradient px-12 py-4 font-body font-black text-ink shadow-gold transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none enabled:hover:scale-[1.03] enabled:active:scale-[0.98] select-none text-base tracking-wider uppercase cursor-pointer"
                >
                  <span className="absolute inset-0 w-full h-full rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                  ✨ Start Reveal Ceremony
                </button>
                <p className="text-xs text-muted font-mono tracking-widest uppercase">
                  {!selectedCategoryId ? "Please select a category above" : "Ready to reveal the champion"}
                </p>
              </div>
            </div>
          )}

          {/* Phase 1: Preparing Final Results Loading Overlay */}
          {phase === "loading" && (
            <div className="flex flex-col items-center justify-center space-y-6 py-20 text-center max-w-md mx-auto">
              {/* Premium Spinner with outer gold rotating ring */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-t-2 border-r-2 border-b border-l border-gold border-t-gold-light"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  className="absolute inset-2 rounded-full border border-dashed border-gold-deep/60"
                />
                <img
                  src="/trophy.png"
                  alt="Trophy outline"
                  className="w-12 h-12 object-contain opacity-80"
                />
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-xs tracking-[0.25em] text-gold-deep uppercase font-bold">
                  PRATHIBA Season 2 Results
                </h3>
                <h2 className="font-display font-black text-xl text-parchment animate-pulse">
                  Preparing Final Results...
                </h2>
              </div>

              {/* Cycling Status Text */}
              <div className="h-8 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingText}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="font-mono text-xs text-muted font-medium max-w-xs text-center leading-relaxed"
                  >
                    {loadingText}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Phase 2: Dramatic Countdown Overlay */}
          {phase === "countdown" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">

              <div className="relative text-center z-10 select-none">
                <p className="font-mono text-xs sm:text-sm tracking-[0.3em] text-gold-deep uppercase font-bold animate-pulse">
                  REVEALING CHAMPION IN
                </p>

                {/* Animated Count Numbers */}
                <div className="h-64 sm:h-80 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.h1
                      key={countdownText}
                      initial={{ scale: 0.1, opacity: 0 }}
                      animate={{ 
                        scale: 1, 
                        opacity: 1,
                        filter: "drop-shadow(0 0 35px rgba(201, 151, 61, 0.6))"
                      }}
                      exit={{ scale: 2, opacity: 0 }}
                      transition={{ 
                        duration: 0.85, 
                        ease: reducedMotion ? "linear" : [0.34, 1.56, 0.64, 1] 
                      }}
                      className="font-display text-[120px] sm:text-[180px] font-black text-gold-gradient leading-none tracking-tighter"
                    >
                      {countdownText}
                    </motion.h1>
                  </AnimatePresence>
                </div>

                <div className="mt-4 flex items-center justify-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
                  <p className="font-mono text-[10px] tracking-widest text-parchment/60 uppercase">
                    Audited Ballot Box: {currentCategory?.title}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Phases 3, 4, 5, 6: Chart Reveals */}
          {isRevealedPhase && resultsData && (
            <div className="w-full max-w-5xl mx-auto space-y-6 py-4 animate-rise flex flex-col items-center">
              
              {/* Logo and Category Info Header (mock-up match) */}
              <div className="flex flex-col items-center mb-6 select-none z-10 w-full">
                
                {/* Symmetrical Gold Horizontal Streak Rays behind the shield */}
                <div className="absolute left-0 right-[50%] top-[56px] h-[1px] bg-gradient-to-r from-transparent via-[#c9973d]/45 to-[#f4d77b] pointer-events-none z-0" />
                <div className="absolute right-0 left-[50%] top-[56px] h-[1px] bg-gradient-to-l from-transparent via-[#c9973d]/45 to-[#f4d77b] pointer-events-none z-0" />

                {/* Background Glass Shield Container */}
                <div className="relative w-72 h-28 flex flex-col items-center justify-center mb-4 z-10">
                  {/* Background Glass Shield SVG */}
                  <svg className="absolute inset-0 w-full h-full filter drop-shadow-[0_4px_15px_rgba(0,0,0,0.7)]" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="shield-bg" x1="100" y1="0" x2="100" y2="80" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#1e160e" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#0d0906" stopOpacity="0.95" />
                      </linearGradient>
                      <linearGradient id="shield-border" x1="0" y1="0" x2="200" y2="80" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#8b6914" />
                        <stop offset="30%" stopColor="#f4d77b" />
                        <stop offset="50%" stopColor="#c9973d" />
                        <stop offset="70%" stopColor="#f4d77b" />
                        <stop offset="100%" stopColor="#8b6914" />
                      </linearGradient>
                      <filter id="gold-glow-filter" x="-10%" y="-10%" width="120%" height="120%">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    
                    {/* Shield Inverted Trapezoid Path */}
                    <path 
                      d="M 22,2 
                         L 178,2 
                         Q 186,2 184,10 
                         L 155,68 
                         Q 152,76 142,76 
                         L 58,76 
                         Q 48,76 45,68 
                         L 16,10 
                         Q 14,2 22,2 
                         Z" 
                      fill="url(#shield-bg)" 
                      stroke="url(#shield-border)" 
                      strokeWidth="1.5"
                      filter="url(#gold-glow-filter)"
                    />
                  </svg>

                  {/* Symmetrical Lens Flares on top-left and top-right shoulders of the shield */}
                  <div className="absolute left-[30px] top-[10px] w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#fff,0_0_15px_#f4d77b] animate-pulse z-20 pointer-events-none" />
                  <div className="absolute right-[30px] top-[10px] w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#fff,0_0_15px_#f4d77b] animate-pulse z-20 pointer-events-none" />

                  {/* Floating 5-Peak Crown on Top of the Shield */}
                  <svg className="absolute -top-7 w-16 h-11 drop-shadow-[0_3px_8px_rgba(201,151,61,0.8)] z-20" viewBox="0 0 100 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="shield-crown-gold" x1="0" y1="0" x2="100" y2="55" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#c9973d" />
                        <stop offset="25%" stopColor="#f4d77b" />
                        <stop offset="50%" stopColor="#fff8e3" />
                        <stop offset="75%" stopColor="#f4d77b" />
                        <stop offset="100%" stopColor="#8b6914" />
                      </linearGradient>
                      <linearGradient id="shield-ruby" x1="0" y1="0" x2="0" y2="10">
                        <stop offset="0%" stopColor="#ff4d4d" />
                        <stop offset="100%" stopColor="#990000" />
                      </linearGradient>
                      <linearGradient id="shield-emerald" x1="0" y1="0" x2="0" y2="10">
                        <stop offset="0%" stopColor="#4dff4d" />
                        <stop offset="100%" stopColor="#006600" />
                      </linearGradient>
                      <filter id="shield-crown-shadow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000" floodOpacity="0.5" />
                      </filter>
                    </defs>

                    {/* Velvet Inner Arch (Dark Crimson Backing) */}
                    <path
                      d="M 18,42 Q 50,22 82,42 Z"
                      fill="#4a0404"
                      opacity="0.95"
                    />

                    {/* Main 5-Peak Silhouette */}
                    <path
                      d="M 16,42 
                         C 14,24 23,20 23,20
                         C 25,26 29,32 32,36
                         C 34,20 41,10 41,10
                         C 44,20 46,26 48,32
                         C 50,20 50,6 50,6
                         C 50,6 50,20 52,32
                         C 54,26 56,20 59,10
                         C 59,10 66,20 68,36
                         C 71,32 75,26 77,20
                         C 77,20 86,24 84,42
                         Q 50,45 16,42 Z"
                      fill="url(#shield-crown-gold)"
                      filter="url(#shield-crown-shadow)"
                    />

                    {/* Gold Base Band */}
                    <path
                      d="M 15,46 Q 50,49 85,46 L 84,42 Q 50,45 16,42 Z"
                      fill="url(#shield-crown-gold)"
                      filter="url(#shield-crown-shadow)"
                    />

                    {/* Base Band Velvet Trim */}
                    <path
                      d="M 17,42 Q 50,44 83,42 L 83,40 Q 50,42 17,40 Z"
                      fill="#330000"
                    />

                    {/* Inner gold detailing curves for 3D appearance */}
                    <path
                      d="M 23,43 C 26,32 32,26 38,38"
                      stroke="#6b4c05"
                      strokeWidth="0.8"
                      fill="none"
                      opacity="0.65"
                    />
                    <path
                      d="M 77,43 C 74,32 68,26 62,38"
                      stroke="#6b4c05"
                      strokeWidth="0.8"
                      fill="none"
                      opacity="0.65"
                    />
                    <path
                      d="M 38,44 C 42,30 47,22 50,36 C 53,22 58,30 62,44"
                      stroke="#6b4c05"
                      strokeWidth="0.8"
                      fill="none"
                      opacity="0.65"
                    />

                    {/* Spherical Tips of the Peaks */}
                    <circle cx="23" cy="20" r="2.5" fill="url(#shield-crown-gold)" />
                    <circle cx="41" cy="10" r="3.2" fill="url(#shield-crown-gold)" />
                    <circle cx="50" cy="6" r="3.8" fill="url(#shield-crown-gold)" />
                    <circle cx="59" cy="10" r="3.2" fill="url(#shield-crown-gold)" />
                    <circle cx="77" cy="20" r="2.5" fill="url(#shield-crown-gold)" />

                    {/* Center Peak Ruby */}
                    <path d="M 50,13 L 53,18 L 50,23 L 47,18 Z" fill="url(#shield-ruby)" />
                    <circle cx="50" cy="18" r="1" fill="#fff" opacity="0.8" />

                    {/* Side Peak Emeralds */}
                    <circle cx="41" cy="21" r="1.5" fill="url(#shield-emerald)" />
                    <circle cx="59" cy="21" r="1.5" fill="url(#shield-emerald)" />

                    {/* Outer Peak Blue Sapphires */}
                    <circle cx="26" cy="28" r="1.5" fill="#0033cc" />
                    <circle cx="74" cy="28" r="1.5" fill="#0033cc" />

                    {/* Base Band Jewels */}
                    <circle cx="25" cy="44" r="1" fill="#fff" opacity="0.9" />
                    <circle cx="35" cy="44.5" r="1" fill="#fff" opacity="0.9" />
                    <circle cx="45" cy="45" r="1.2" fill="url(#shield-ruby)" />
                    <circle cx="50" cy="45.2" r="1.2" fill="#fff" opacity="0.9" />
                    <circle cx="55" cy="45" r="1.2" fill="url(#shield-ruby)" />
                    <circle cx="65" cy="44.5" r="1" fill="#fff" opacity="0.9" />
                    <circle cx="75" cy="44" r="1" fill="#fff" opacity="0.9" />
                  </svg>

                  {/* Text inside the Shield */}
                  <div className="relative z-10 flex flex-col items-center pt-2 select-none pointer-events-none">
                    <span className="font-display font-black text-lg tracking-[0.35em] text-gold-gradient leading-none">
                      PRATHIBA
                    </span>
                    <div className="flex items-center gap-2.5 mt-2">
                      <div className="h-[0.5px] w-4 bg-gold/50" />
                      <span className="font-display text-[9px] tracking-[0.25em] text-parchment/70 font-bold uppercase leading-none">
                        SEASON 2
                      </span>
                      <div className="h-[0.5px] w-4 bg-gold/50" />
                    </div>
                  </div>
                </div>
                
                {/* Main Category Title */}
                <h2 className="font-display font-black text-xl sm:text-3xl lg:text-4xl text-gold-gradient tracking-wide uppercase text-center max-w-4xl leading-snug filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">
                  {resultsData.category.title}
                </h2>
                {/* Subtitle */}
                <p className="text-xs sm:text-sm text-parchment/80 font-medium max-w-xl text-center leading-relaxed mt-2 pl-4 pr-4">
                  {resultsData.category.description}
                </p>
                {/* Decorative Scrollwork Ornament Divider (High-fidelity Mockup Match) */}
                <div className="relative w-full max-w-4xl h-8 flex items-center justify-center mt-3 select-none pointer-events-none">
                  <svg className="w-full h-full text-gold/80 drop-shadow-[0_1px_3px_rgba(201,151,61,0.4)]" viewBox="0 0 800 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="divider-gold-gradient" x1="0" y1="0" x2="800" y2="0" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="15%" stopColor="#8b6914" stopOpacity="0.3" />
                        <stop offset="35%" stopColor="#c9973d" />
                        <stop offset="50%" stopColor="#f4d77b" />
                        <stop offset="65%" stopColor="#c9973d" />
                        <stop offset="85%" stopColor="#8b6914" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                    
                    {/* Main Horizontal Lines with fading gradient */}
                    <path d="M 50,10 L 360,10" stroke="url(#divider-gold-gradient)" strokeWidth="1.25" />
                    <path d="M 440,10 L 750,10" stroke="url(#divider-gold-gradient)" strokeWidth="1.25" />
                    
                    {/* Center Scrollwork Detail */}
                    {/* Left Loop Leaf */}
                    <path 
                      d="M 360,10 
                         C 365,6 372,5 378,8 
                         C 383,11 382,15 376,15 
                         C 370,15 368,10 374,7 
                         C 378,5 382,7 384,10" 
                      stroke="#f4d77b" 
                      strokeWidth="1.2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                    {/* Left Small Ring */}
                    <circle cx="390" cy="10" r="1.8" stroke="#c9973d" strokeWidth="1" fill="#15100a" />
                    
                    {/* Right Small Ring */}
                    <circle cx="410" cy="10" r="1.8" stroke="#c9973d" strokeWidth="1" fill="#15100a" />
                    {/* Right Loop Leaf */}
                    <path 
                      d="M 440,10 
                         C 435,6 428,5 422,8 
                         C 417,11 418,15 424,15 
                         C 430,15 432,10 426,7 
                         C 422,5 418,7 416,10" 
                      stroke="#f4d77b" 
                      strokeWidth="1.2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />

                    {/* Symmetrical Left End Flourish */}
                    <path 
                      d="M 120,10 
                         C 116,6 108,6 104,9 
                         C 100,12 101,16 106,16 
                         C 110,16 112,12 108,9" 
                      stroke="#c9973d" 
                      strokeWidth="1" 
                      strokeLinecap="round" 
                    />
                    <circle cx="96" cy="10" r="1.5" fill="#f4d77b" />
                    <circle cx="128" cy="10" r="1" fill="#c9973d" />

                    {/* Symmetrical Right End Flourish */}
                    <path 
                      d="M 680,10 
                         C 684,6 692,6 696,9 
                         C 700,12 699,16 694,16 
                         C 690,16 688,12 692,9" 
                      stroke="#c9973d" 
                      strokeWidth="1" 
                      strokeLinecap="round" 
                    />
                    <circle cx="704" cy="10" r="1.5" fill="#f4d77b" />
                    <circle cx="672" cy="10" r="1" fill="#c9973d" />
                  </svg>
                </div>
              </div>



              {/* Nominee Results Stack - Styled exactly like mockup */}
              <div className="flex flex-row justify-start md:justify-center items-end overflow-x-auto md:overflow-visible pb-12 pt-8 gap-4 sm:gap-6 snap-x no-scrollbar w-full">
                {orderedResults.map((nominee, index) => {
                  const isWinner = activeWinners.some((w) => w.id === nominee.id) && (phase === "winner-highlight" || phase === "celebration");
                  const initial = nominee.name.trim().charAt(0).toUpperCase() || "?";
                  
                  const finalPercentage = nominee.percentage;
                  const finalVotes = nominee.votes;
                  const currentBarHeight = phase === "graph-init"
                    ? 0
                    : Math.min(finalPercentage, globalProgress * maxPercentage);
                  const currentPercentageText = Math.round(currentBarHeight);

                  // Get theme based on current rank (preventing spoilers during reveal)
                  const currentRank = index + 1;
                  const theme = getRankTheme(currentRank);

                  return (
                    <motion.div 
                      key={nominee.id} 
                      layout={!reducedMotion}
                      transition={{
                        layout: {
                          type: "tween",
                          ease: [0.25, 1, 0.5, 1], // Smooth, custom decelerating ease-out curve
                          duration: 3.5, // 3.5 seconds layout transition! Incredibly slow, gradual, and cinematic
                        }
                      }}
                      className="flex flex-col items-center justify-end snap-center"
                    >
                      <div
                        className={`relative flex flex-col items-center justify-between p-4 sm:p-5 rounded-3xl border transition-all duration-500 min-w-[150px] sm:min-w-[170px] max-w-[195px] flex-1 bg-gradient-to-b ${
                          isWinner
                            ? `border-gold ${theme.cardBg} shadow-[0_0_35px_rgba(201,151,61,0.35)] scale-[1.04] sm:scale-[1.06] -translate-y-4`
                            : `border-white/5 ${theme.cardBg} hover:border-white/10`
                        }`}
                        style={{ height: isWinner ? "520px" : "460px" }}
                      >
                        {/* Spotlight Glare Sweep (Phase 5+) */}
                        {isWinner && (
                          <div className="absolute inset-0 pointer-events-none rounded-3xl bg-[linear-gradient(200deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.06)_45%,rgba(255,255,255,0.06)_55%,rgba(255,255,255,0)_100%)] bg-[length:100%_200%] animate-shimmer" />
                        )}

                        {/* Gold Star Particles Emitting behind the winner */}
                        {isWinner && (
                          <div className="absolute inset-0 pointer-events-none rounded-3xl opacity-35 bg-[radial-gradient(circle_at_center,rgba(244,215,123,0.12)_0%,transparent_70%)]" />
                        )}

                        {/* Top floating winner crown/badge above card */}
                        {isWinner && (
                          <div className="absolute -top-7.5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 z-20">
                            <svg className="w-9 h-6 drop-shadow-[0_2px_5px_rgba(201,151,61,0.7)]" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <defs>
                                <linearGradient id="card-crown-gold" x1="0" y1="0" x2="100" y2="50" gradientUnits="userSpaceOnUse">
                                  <stop offset="0%" stopColor="#aa771c" />
                                  <stop offset="30%" stopColor="#f5d061" />
                                  <stop offset="70%" stopColor="#d4af37" />
                                  <stop offset="100%" stopColor="#8b6508" />
                                </linearGradient>
                                <linearGradient id="card-ruby" x1="0" y1="0" x2="0" y2="10">
                                  <stop offset="0%" stopColor="#ff4d4d" />
                                  <stop offset="100%" stopColor="#990000" />
                                </linearGradient>
                              </defs>
                              <path
                                d="M 16,40 
                                   C 14,24 23,20 23,20
                                   C 25,26 29,32 32,36
                                   C 34,22 41,12 41,12
                                   C 44,22 46,28 48,34
                                   C 50,22 50,8 50,8
                                   C 50,8 50,22 52,34
                                   C 54,28 56,22 59,12
                                   C 59,12 66,22 68,36
                                   C 71,32 75,26 77,20
                                   C 77,20 86,24 84,40
                                   Q 50,43 16,40 Z"
                                fill="url(#card-crown-gold)"
                              />
                              <path
                                d="M 15,44 Q 50,47 85,44 L 84,40 Q 50,43 16,40 Z"
                                fill="url(#card-crown-gold)"
                              />
                              <circle cx="23" cy="20" r="2.5" fill="url(#card-crown-gold)" />
                              <circle cx="41" cy="12" r="3.2" fill="url(#card-crown-gold)" />
                              <circle cx="50" cy="8" r="3.8" fill="url(#card-crown-gold)" />
                              <circle cx="59" cy="12" r="3.2" fill="url(#card-crown-gold)" />
                              <circle cx="77" cy="20" r="2.5" fill="url(#card-crown-gold)" />
                              <path d="M 50,14 L 53,19 L 50,24 L 47,19 Z" fill="url(#card-ruby)" />
                            </svg>
                            <span className="rounded-full bg-gold-gradient px-3.5 py-1 text-[9px] sm:text-[10px] font-black uppercase text-ink tracking-[0.2em] shadow-[0_0_15px_rgba(244,215,123,0.7),0_2px_4px_rgba(0,0,0,0.5)] border border-white/20 select-none">
                              WINNER
                            </span>
                          </div>
                        )}

                        {/* Card Content Stack */}
                        <div className="flex-1 w-full flex flex-col items-center justify-between gap-3 z-10">
                          
                          {/* 1. Circle Nominee Avatar */}
                          <div className="flex flex-col items-center text-center">
                            <div className={`relative w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-ink flex items-center justify-center border-2 ${theme.photoBorder}`}>
                              {nominee.imageUrl ? (
                                <img
                                  src={nominee.imageUrl}
                                  alt={nominee.name}
                                  className="h-full w-full object-cover object-top rounded-full"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center font-display text-2xl font-bold text-gold-deep rounded-full">
                                  {initial}
                                </div>
                              )}

                              {/* Laurel Wreath Overlay around circular photo */}
                              {isWinner && (
                                <svg className="absolute -bottom-2.5 -left-4 -right-4 h-8 text-gold pointer-events-none drop-shadow-[0_2px_6px_rgba(201,151,61,0.5)] z-20" viewBox="0 0 100 30" fill="currentColor">
                                  <path d="M15,25 Q35,28 47,15 T49,3 M85,25 Q65,28 53,15 T51,3" fill="none" stroke="currentColor" strokeWidth="2.5" />
                                  <path d="M22,23 C25,20 25,17 22,18 C19,19 19,22 22,23 Z" />
                                  <path d="M28,21 C31,18 31,15 28,16 C25,17 25,20 28,21 Z" />
                                  <path d="M35,18 C38,15 38,12 35,13 C32,14 32,17 35,18 Z" />
                                  <path d="M42,13 C45,10 44,7 42,8 C40,9 40,12 42,13 Z" />
                                  <path d="M47,8 C49,5 48,2 46,3 C44,4 44,7 47,8 Z" />
                                  <path d="M78,23 C75,20 75,17 78,18 C81,19 81,22 78,23 Z" />
                                  <path d="M72,21 C69,18 69,15 72,16 C75,17 75,20 72,21 Z" />
                                  <path d="M65,18 C62,15 62,12 65,13 C68,14 68,17 65,18 Z" />
                                  <path d="M58,13 C55,10 56,7 58,8 C60,9 60,12 58,13 Z" />
                                  <path d="M53,8 C51,5 52,2 54,3 C56,4 56,7 53,8 Z" />
                                </svg>
                              )}

                              {/* Floating Small Crown on Photo */}
                              {isWinner && (
                                <svg className="absolute -top-4 left-1/2 -translate-x-1/2 w-7 h-5 drop-shadow-[0_2px_4px_rgba(201,151,61,0.65)] z-20" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <defs>
                                    <linearGradient id="photo-crown-gold" x1="0" y1="0" x2="100" y2="50" gradientUnits="userSpaceOnUse">
                                      <stop offset="0%" stopColor="#aa771c" />
                                      <stop offset="30%" stopColor="#f5d061" />
                                      <stop offset="70%" stopColor="#d4af37" />
                                      <stop offset="100%" stopColor="#8b6508" />
                                    </linearGradient>
                                    <linearGradient id="photo-ruby" x1="0" y1="0" x2="0" y2="10">
                                      <stop offset="0%" stopColor="#ff4d4d" />
                                      <stop offset="100%" stopColor="#990000" />
                                    </linearGradient>
                                  </defs>
                                  <path
                                    d="M 16,40 
                                       C 14,24 23,20 23,20
                                       C 25,26 29,32 32,36
                                       C 34,22 41,12 41,12
                                       C 44,22 46,28 48,34
                                       C 50,22 50,8 50,8
                                       C 50,8 50,22 52,34
                                       C 54,28 56,22 59,12
                                       C 59,12 66,22 68,36
                                       C 71,32 75,26 77,20
                                       C 77,20 86,24 84,40
                                       Q 50,43 16,40 Z"
                                    fill="url(#photo-crown-gold)"
                                  />
                                  <path
                                    d="M 15,44 Q 50,47 85,44 L 84,40 Q 50,43 16,40 Z"
                                    fill="url(#photo-crown-gold)"
                                  />
                                  {/* Tips */}
                                  <circle cx="23" cy="20" r="2.5" fill="url(#photo-crown-gold)" />
                                  <circle cx="41" cy="12" r="3.2" fill="url(#photo-crown-gold)" />
                                  <circle cx="50" cy="8" r="3.8" fill="url(#photo-crown-gold)" />
                                  <circle cx="59" cy="12" r="3.2" fill="url(#photo-crown-gold)" />
                                  <circle cx="77" cy="20" r="2.5" fill="url(#photo-crown-gold)" />
                                  {/* Gems */}
                                  <path d="M 50,14 L 53,19 L 50,24 L 47,19 Z" fill="url(#photo-ruby)" />
                                  <circle cx="41" cy="22" r="1.5" fill="#4dff4d" />
                                  <circle cx="59" cy="22" r="1.5" fill="#4dff4d" />
                                </svg>
                              )}
                            </div>

                            {/* Rank Badge */}
                            <span className={`font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full mt-2.5 inline-block tracking-wider ${theme.pillBg}`}>
                              {theme.pillText}
                            </span>
                          </div>

                          {/* 2. Percentage and Lead Indicator */}
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className={`font-mono text-2xl sm:text-3xl font-black ${isWinner ? "text-gold-light" : "text-parchment"}`}>
                                {currentPercentageText}%
                              </span>
                              {isWinner && (
                                <span className="text-gold text-lg animate-pulse">⚡</span>
                              )}
                            </div>
                            {isWinner && (
                              <p className="font-mono text-[8px] tracking-widest text-gold/80 font-bold uppercase mt-0.5">
                                Lead
                              </p>
                            )}
                          </div>

                          {/* 3. Vertical Progress Capsule Bar */}
                          <div className="relative w-8 sm:w-10 h-32 sm:h-36 rounded-2xl bg-ink/75 border border-white/5 overflow-hidden flex flex-col justify-end p-[1.5px]">
                            <div
                              className="w-full rounded-2xl bg-gradient-to-t from-gold-deep via-gold to-gold-light shadow-[0_0_20px_rgba(201,151,61,0.5)]"
                              style={{ height: `${currentBarHeight}%` }}
                            />
                          </div>



                          {/* 5. Nominee Name and song */}
                          <div className="text-center w-full">
                            <h3 className="font-display text-xs sm:text-sm font-bold text-parchment leading-tight line-clamp-1">
                              {nominee.name}
                            </h3>
                            {nominee.song ? (
                              <p className="text-[9px] font-medium text-gold-light/90 mt-0.5 truncate">
                                🎵 {nominee.song}
                              </p>
                            ) : nominee.subtitle ? (
                              <p className="text-[9px] text-muted mt-0.5 truncate">
                                {nominee.subtitle}
                              </p>
                            ) : (
                              <div className="h-3" />
                            )}
                          </div>

                        </div>
                      </div>
                      
                      {/* Circular 3D Pedestal/Platform under the winner */}
                      {isWinner && (
                        <div className="w-full flex flex-col items-center mt-2 z-0">
                          {/* Pedestal Top Step */}
                          <div className="w-36 h-2 rounded-[50%/6px] border-b border-gold-light bg-gradient-to-r from-charLight via-gold-deep/20 to-charLight shadow-[inset_0_1px_2px_rgba(255,255,255,0.15)] z-20" />
                          {/* Pedestal Middle Step */}
                          <div className="w-44 h-3.5 rounded-[50%/8px] border-b border-gold bg-ink/90 -mt-1 z-10 shadow-lg" />
                          {/* Pedestal Bottom Step */}
                      <div className="w-52 h-4.5 rounded-[50%/10px] border-b border-gold-deep bg-black -mt-1.5 z-0" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Reset/Switch Actions (Bottom Placement in Stage 6) */}
              {phase === "celebration" && (
                <div className="mt-8 flex flex-wrap justify-center gap-4 animate-rise z-20">
                  <button
                    onClick={resetCelebration}
                    className="rounded-full border border-gold bg-gold-deep/20 px-8 py-3 text-xs font-bold text-gold-light hover:bg-gold-deep/35 transition-all shadow-sm uppercase tracking-wide cursor-pointer z-30"
                  >
                    🔄 Reveal Another Category
                  </button>
                  <Link
                    href={`/admin${isTest ? "?mode=test" : ""}`}
                    className="rounded-full border border-white/10 bg-char/50 px-8 py-3 text-xs font-bold text-muted hover:text-parchment hover:border-white/20 transition-all uppercase tracking-wide z-30 pointer-events-auto"
                  >
                    🏆 Go to Dashboard
                  </Link>
                </div>
              )}



            </div>
          )}
        </main>
      </div>

      {/* Grand Finale: Full-Screen Congratulations Card Overlay */}
      <AnimatePresence>
        {showCongratsCard && resultsData && activeWinners.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md px-4 py-8"
          >
            {/* Spotlight Stage lights effect in background of Congrats Card */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
              {/* Center volumetric light ray */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-full bg-gradient-to-b from-[#f4d77b]/10 via-[#c9973d]/5 to-transparent filter blur-3xl" />
              {/* Left and right stage lights */}
              <div className="absolute top-0 left-[20%] w-[30vw] h-full bg-gradient-to-b from-purple-500/5 via-transparent to-transparent filter blur-2xl transform rotate-12 origin-top" />
              <div className="absolute top-0 right-[20%] w-[30vw] h-full bg-gradient-to-b from-blue-500/5 via-transparent to-transparent filter blur-2xl transform -rotate-12 origin-top" />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 120, delay: 0.2 }}
              className="relative w-full max-w-xl rounded-3xl p-[1.5px] bg-gradient-to-b from-gold/50 via-gold-deep/20 to-white/5 shadow-[0_0_50px_rgba(201,151,61,0.25)] z-10"
            >
              {/* Inner Glass Box */}
              <div className="relative rounded-3xl bg-gradient-to-b from-[#1b140e]/95 to-[#0b0806]/98 px-6 sm:px-10 py-10 sm:py-12 flex flex-col items-center text-center">
                {/* Symmetrical Left/Right Border Shine Highlights */}
                <div className="absolute top-0 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-[#f4d77b] to-transparent" />
                
                {/* Gold Lens Flare Streaks */}
                <div className="absolute left-0 right-0 top-[40px] h-[0.5px] bg-gradient-to-r from-transparent via-[#c9973d]/45 to-transparent pointer-events-none" />

                {/* Glowing Crown on Top */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20">
                  <svg className="w-18 h-12 drop-shadow-[0_3px_10px_rgba(201,151,61,0.85)]" viewBox="0 0 100 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="card-crown-gold" x1="0" y1="0" x2="100" y2="55" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#c9973d" />
                        <stop offset="25%" stopColor="#f4d77b" />
                        <stop offset="50%" stopColor="#fff8e3" />
                        <stop offset="75%" stopColor="#f4d77b" />
                        <stop offset="100%" stopColor="#8b6914" />
                      </linearGradient>
                      <linearGradient id="card-ruby" x1="0" y1="0" x2="0" y2="10">
                        <stop offset="0%" stopColor="#ff4d4d" />
                        <stop offset="100%" stopColor="#990000" />
                      </linearGradient>
                      <linearGradient id="card-emerald" x1="0" y1="0" x2="0" y2="10">
                        <stop offset="0%" stopColor="#4dff4d" />
                        <stop offset="100%" stopColor="#006600" />
                      </linearGradient>
                      <filter id="card-crown-shadow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000" floodOpacity="0.5" />
                      </filter>
                    </defs>

                    {/* Velvet Inner Arch (Dark Crimson Backing) */}
                    <path
                      d="M 18,42 Q 50,22 82,42 Z"
                      fill="#4a0404"
                      opacity="0.95"
                    />

                    {/* Main 5-Peak Silhouette */}
                    <path
                      d="M 16,42 
                         C 14,24 23,20 23,20
                         C 25,26 29,32 32,36
                         C 34,20 41,10 41,10
                         C 44,20 46,26 48,32
                         C 50,20 50,6 50,6
                         C 50,6 50,20 52,32
                         C 54,26 56,20 59,10
                         C 59,10 66,20 68,36
                         C 71,32 75,26 77,20
                         C 77,20 86,24 84,42
                         Q 50,45 16,42 Z"
                      fill="url(#card-crown-gold)"
                      filter="url(#card-crown-shadow)"
                    />

                    {/* Gold Base Band */}
                    <path
                      d="M 15,46 Q 50,49 85,46 L 84,42 Q 50,45 16,42 Z"
                      fill="url(#card-crown-gold)"
                      filter="url(#card-crown-shadow)"
                    />

                    {/* Base Band Velvet Trim */}
                    <path
                      d="M 17,42 Q 50,44 83,42 L 83,40 Q 50,42 17,40 Z"
                      fill="#330000"
                    />

                    {/* Inner gold detailing curves for 3D appearance */}
                    <path
                      d="M 23,43 C 26,32 32,26 38,38"
                      stroke="#6b4c05"
                      strokeWidth="0.8"
                      fill="none"
                      opacity="0.65"
                    />
                    <path
                      d="M 77,43 C 74,32 68,26 62,38"
                      stroke="#6b4c05"
                      strokeWidth="0.8"
                      fill="none"
                      opacity="0.65"
                    />
                    <path
                      d="M 38,44 C 42,30 47,22 50,36 C 53,22 58,30 62,44"
                      stroke="#6b4c05"
                      strokeWidth="0.8"
                      fill="none"
                      opacity="0.65"
                    />

                    {/* Spherical Tips of the Peaks */}
                    <circle cx="23" cy="20" r="2.5" fill="url(#card-crown-gold)" />
                    <circle cx="41" cy="10" r="3.2" fill="url(#card-crown-gold)" />
                    <circle cx="50" cy="6" r="3.8" fill="url(#card-crown-gold)" />
                    <circle cx="59" cy="10" r="3.2" fill="url(#card-crown-gold)" />
                    <circle cx="77" cy="20" r="2.5" fill="url(#card-crown-gold)" />

                    {/* Center Peak Ruby */}
                    <path d="M 50,13 L 53,18 L 50,23 L 47,18 Z" fill="url(#card-ruby)" />
                    <circle cx="50" cy="18" r="1" fill="#fff" opacity="0.8" />

                    {/* Side Peak Emeralds */}
                    <circle cx="41" cy="21" r="1.5" fill="url(#card-emerald)" />
                    <circle cx="59" cy="21" r="1.5" fill="url(#card-emerald)" />

                    {/* Outer Peak Blue Sapphires */}
                    <circle cx="26" cy="28" r="1.5" fill="#0033cc" />
                    <circle cx="74" cy="28" r="1.5" fill="#0033cc" />

                    {/* Base Band Jewels */}
                    <circle cx="25" cy="44" r="1" fill="#fff" opacity="0.9" />
                    <circle cx="35" cy="44.5" r="1" fill="#fff" opacity="0.9" />
                    <circle cx="45" cy="45" r="1.2" fill="url(#card-ruby)" />
                    <circle cx="50" cy="45.2" r="1.2" fill="#fff" opacity="0.9" />
                    <circle cx="55" cy="45" r="1.2" fill="url(#card-ruby)" />
                    <circle cx="65" cy="44.5" r="1" fill="#fff" opacity="0.9" />
                    <circle cx="75" cy="44" r="1" fill="#fff" opacity="0.9" />
                  </svg>
                </div>

                {/* Sub-header text split into two lines with highlighted WINNER */}
                <div className="flex flex-col items-center gap-1.5 mt-2">
                  <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.3em] text-parchment/65 uppercase">
                    PRATHIBA SEASON 2
                  </span>
                  <span className="rounded-full bg-gold-gradient px-4 py-1 text-[10px] sm:text-[11px] font-black uppercase text-ink tracking-[0.25em] shadow-[0_0_15px_rgba(244,215,123,0.7),0_2px_4px_rgba(0,0,0,0.5)] border border-white/20 select-none animate-pulse">
                    WINNER
                  </span>
                </div>

                {/* Award Category Title */}
                <h2 className="font-display font-black text-xl sm:text-2xl text-gold-gradient tracking-wide uppercase mt-2.5 filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                  {resultsData.category.title}
                </h2>

                {/* Wreath & High-Resolution Image Container */}
                <div className="relative my-6 select-none">
                  {/* Shimmering Gold Medallion (Zero Leaves - Double Gear Star & Diamond System) */}
                  <svg className="absolute -inset-10 w-[224px] h-[224px] pointer-events-none z-0" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="medallion-gold" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#aa771c" />
                        <stop offset="25%" stopColor="#f5d061" />
                        <stop offset="50%" stopColor="#fff8e3" />
                        <stop offset="75%" stopColor="#d4af37" />
                        <stop offset="100%" stopColor="#8b6508" />
                      </linearGradient>
                      <filter id="medallion-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#f4d77b" floodOpacity="0.5" />
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Background gold wash glow */}
                    <circle cx="60" cy="60" r="46" fill="url(#medallion-gold)" opacity="0.08" className="animate-pulse" />

                    {/* Outer beaded border ring */}
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      stroke="url(#medallion-gold)"
                      strokeWidth="1.2"
                      strokeDasharray="2 3"
                      opacity="0.65"
                    />

                    {/* Middle thin ring */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="url(#medallion-gold)"
                      strokeWidth="0.8"
                      opacity="0.4"
                    />

                    {/* Inner beaded ring */}
                    <circle
                      cx="60"
                      cy="60"
                      r="46"
                      stroke="url(#medallion-gold)"
                      strokeWidth="1"
                      strokeDasharray="4 2"
                      opacity="0.5"
                    />

                    {/* Outer Spinning 12 Golden Stars */}
                    <g className="animate-[spin_45s_linear_infinite] origin-center" style={{ transformOrigin: "60px 60px" }} filter="url(#medallion-glow)">
                      {Array.from({ length: 12 }).map((_, i) => {
                        const angle = (i * 360) / 12;
                        const rad = (angle * Math.PI) / 180;
                        const r = 54;
                        const x = 60 + r * Math.cos(rad);
                        const y = 60 + r * Math.sin(rad);
                        
                        // Small 4-point star path
                        return (
                          <path
                            key={i}
                            d={`M ${x},${y-4} L ${x+1.5},${y-1.5} L ${x+4},${y} L ${x+1.5},${y+1.5} L ${x},${y+4} L ${x-1.5},${y+1.5} L ${x-4},${y} L ${x-1.5},${y-1.5} Z`}
                            fill="url(#medallion-gold)"
                          />
                        );
                      })}
                    </g>

                    {/* Inner Counter-Spinning 12 Golden Diamonds */}
                    <g className="animate-[spin_25s_linear_infinite_reverse] origin-center" style={{ transformOrigin: "60px 60px" }} filter="url(#medallion-glow)">
                      {Array.from({ length: 12 }).map((_, i) => {
                        // Offset by 15 degrees to stagger with outer stars
                        const angle = (i * 360) / 12 + 15;
                        const rad = (angle * Math.PI) / 180;
                        const r = 46;
                        const x = 60 + r * Math.cos(rad);
                        const y = 60 + r * Math.sin(rad);
                        
                        // Tiny diamond path
                        return (
                          <path
                            key={i}
                            d={`M ${x},${y-3} L ${x+2},${y} L ${x},${y+3} L ${x-2},${y} Z`}
                            fill="url(#medallion-gold)"
                            opacity="0.85"
                          />
                        );
                      })}
                    </g>

                    {/* Rotating outer light flares */}
                    <g className="animate-[spin_15s_linear_infinite] origin-center" style={{ transformOrigin: "60px 60px" }}>
                      <circle cx="60" cy="6" r="2.5" fill="#fff" filter="url(#medallion-glow)" />
                      <circle cx="60" cy="114" r="1.8" fill="#fff" opacity="0.7" />
                      <circle cx="6" cy="60" r="1.8" fill="#fff" opacity="0.7" />
                      <circle cx="114" cy="60" r="2.5" fill="#fff" filter="url(#medallion-glow)" />
                    </g>
                  </svg>

                  {/* Circular Portrait Image wrapper */}
                  <div className="relative w-36 h-36 rounded-full p-[3px] bg-gradient-to-b from-gold via-gold-deep to-charLight shadow-[0_0_30px_rgba(201,151,61,0.4)] overflow-hidden z-10">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-b from-char to-charDark flex items-center justify-center">
                      {activeWinners[0].imageUrl ? (
                        <img
                          src={activeWinners[0].imageUrl}
                          alt={activeWinners[0].name}
                          className="w-full h-full object-cover object-top rounded-full scale-[1.03]"
                        />
                      ) : (
                        <span className="font-display font-black text-6xl text-gold-light">
                          {activeWinners[0].name.trim().charAt(0).toUpperCase() || "?"}
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Winner Name in Large display font */}
                <h1 className="font-display font-black text-2xl sm:text-3xl text-gold-gradient tracking-wide uppercase leading-tight filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                  {activeWinners[0].name}
                </h1>

                {/* Sub-details (Song title) */}
                {activeWinners[0].song && (
                  <p className="text-xs sm:text-sm font-sans font-medium text-gold-light/95 tracking-wide mt-1.5 flex items-center gap-1.5 justify-center leading-none">
                    <span>🎵</span> {activeWinners[0].song}
                  </p>
                )}

                {/* Final vote percentage badge */}
                <div className="mt-4 px-6 py-2 rounded-full border border-gold/30 bg-gold-deep/10 shadow-[inset_0_1px_3px_rgba(255,255,255,0.05)] flex items-center gap-2">
                  <span className="text-gold-light text-xs font-mono uppercase tracking-wider font-bold">
                    Final Vote Share:
                  </span>
                  <span className="text-gold-light font-display text-base font-black flex items-center gap-1 leading-none">
                    {activeWinners[0].percentage}%
                    <span className="text-gold text-sm animate-pulse">⚡</span>
                  </span>
                </div>

                {/* Custom congratulations message */}
                <p className="text-xs sm:text-sm text-parchment/80 font-sans tracking-wide max-w-sm mt-6 leading-relaxed">
                  Congratulations on this stellar victory! Your exceptional performance has captured the hearts of the audience. We celebrate your dedication, artistry, and triumph.
                </p>
              </div>
            </motion.div>

            {/* Action Loop Buttons (Bottom of screen) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-wrap justify-center gap-4 mt-8 z-10"
            >
              <button
                onClick={resetCelebration}
                className="rounded-full border border-gold bg-gold-deep/20 px-8 py-3 text-xs font-bold text-gold-light hover:bg-gold-deep/35 transition-all shadow-md uppercase tracking-wide cursor-pointer z-30"
              >
                🔄 Reveal Another Category
              </button>
              <Link
                href={`/admin${isTest ? "?mode=test" : ""}`}
                className="rounded-full border border-white/10 bg-char/50 px-8 py-3 text-xs font-bold text-muted hover:text-parchment hover:border-white/20 transition-all uppercase tracking-wide shadow-md z-30 pointer-events-auto"
              >
                🏆 Go to Dashboard
              </Link>
            </motion.div>

            {/* Back to Leaderboard Toggle Link */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCongratsCard(false)}
              className="text-[10px] text-muted hover:text-parchment hover:opacity-100 transition-all mt-5 tracking-widest uppercase font-mono cursor-pointer underline underline-offset-4 z-30"
            >
              ⬅️ Back to Leaderboard
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
