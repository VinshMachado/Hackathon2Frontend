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
function CanvasImage({ Url }: { Url: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [spoiled, setSpoiled] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const image = new Image();
    image.src = Url || ""; // original image
    image.onload = () => {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
  }, [Url]);

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

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append("image", blob, "spoiled.png");

      /*  await fetch("http://localhost:1000/uploads", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.text())
        .then((msg) => console.log(msg))
        .catch((err) => console.error("Upload failed:", err));*/
    }, "image/png");
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
      <canvas ref={canvasRef} className="border border-black w-1/2 h-auto" />
      <div className="flex gap-2 mt-2">
        <button onClick={spoil} className="px-3 py-1 bg-red-400 rounded">
          Spoil image
        </button>
        <button onClick={restore} className="px-3 py-1 bg-red-400 rounded">
          Restore image
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  const [upload, setUpload] = useState("");

  if (upload == "") {
    return (
      <>
        <h1>Upload file</h1>
        <input
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const localUrl = URL.createObjectURL(file);
              setUpload(localUrl);

              // You can show it in an <img>
              const img = document.createElement("img");
              img.src = localUrl;
            }
          }}
        />
      </>
    );
  } else {
    return <CanvasImage Url={upload} />;
  }
}
