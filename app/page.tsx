"use client";
import { useEffect, useRef, useState } from "react";

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function CanvasImage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [spoiled, setSpoiled] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const image = new Image();
    image.src = "/spoiled.png"; // original image
    image.onload = () => {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
  }, []);

  const spoil = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const rand = mulberry32(12345);

    for (let i = 0; i < data.length; i += 4) {
      const n = Math.floor(rand() * 256);
      data[i] ^= n; // red
      data[i + 1] ^= n; // green
      data[i + 2] ^= n; // blue
    }

    ctx.putImageData(imageData, 0, 0);
    setSpoiled(true);
  };

  const restore = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const rand = mulberry32(12345); // ⚡ reset seed

    for (let i = 0; i < data.length; i += 4) {
      const n = Math.floor(rand() * 256);
      data[i] ^= n;
      data[i + 1] ^= n;
      data[i + 2] ^= n;
    }

    ctx.putImageData(imageData, 0, 0);
    setSpoiled(false);
  };
  const downloadSpoiled = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "spoiled.png"; // file name
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="border border-black w-full h=[500px]"
      />
      <div className="flex gap-2 mt-2">
        <button onClick={spoil} className="px-3 py-1 bg-red-400 rounded">
          Spoil
        </button>
        <button onClick={restore} className="px-3 py-1 bg-green-400 rounded">
          Restore
        </button>
      </div>
      <button
        onClick={downloadSpoiled}
        className="px-3 py-1 bg-blue-400 rounded"
      >
        Download Spoiled
      </button>
    </div>
  );
}
