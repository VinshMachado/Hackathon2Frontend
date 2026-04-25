"use client";
import { useRef, useEffect } from "react";

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function SpoilVideo({ url }: { url: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const spoilFrame = (ctx: CanvasRenderingContext2D, seed: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const rand = mulberry32(seed);

    for (let i = 0; i < data.length; i += 4) {
      const n = Math.floor(rand() * 256);
      data[i] ^= n; // R
      data[i + 1] ^= n; // G
      data[i + 2] ^= n; // B
    }
    ctx.putImageData(imageData, 0, 0);
  };

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const draw = () => {
      if (video.paused || video.ended) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      spoilFrame(ctx, 12345); // apply scramble
      requestAnimationFrame(draw);
    };

    video.addEventListener("play", () => {
      draw();
    });

    // 🎥 Setup recorder
    const stream = canvas.captureStream(30); // 30 fps
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "spoiled-video.webm";
      a.click();
    };
    recorderRef.current = recorder;
  }, []);

  const startRecording = () => {
    if (recorderRef.current && recorderRef.current.state === "inactive") {
      chunksRef.current = [];
      recorderRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
  };

  return (
    <div>
      <video ref={videoRef} src={"/spoiled-video (2).webm"} controls />
      <canvas ref={canvasRef} className="border border-black" />
      <div className="space-x-2 mt-2">
        <button onClick={startRecording} className="bg-red-500 h-30 w-40">
          Start Recording
        </button>
        <button onClick={stopRecording} className="bg-green-500 h-30 w-40">
          {" "}
          Stop & Save
        </button>
      </div>
    </div>
  );
}
