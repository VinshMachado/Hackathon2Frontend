function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export async function spoilImage({
  source,
  seed,
}: {
  source: string | File;
  seed: number;
}): Promise<Blob | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous"; // safe for remote images

    if (typeof source === "string") {
      // URL case
      image.src = source;
    } else {
      // File case
      image.src = URL.createObjectURL(source);
    }

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);

      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const rand = mulberry32(seed);

      for (let i = 0; i < data.length; i += 4) {
        const n = Math.floor(rand() * 256);
        data[i] ^= n;
        data[i + 1] ^= n;
        data[i + 2] ^= n;
      }

      ctx.putImageData(imageData, 0, 0);

      canvas.toBlob((blob) => {
        resolve(blob); // ✅ return spoiled Blob
      }, "image/png");
    };
  });
}
