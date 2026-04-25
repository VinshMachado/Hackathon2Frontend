"use client";
import React, { useEffect, useState } from "react";
import { spoilImage } from "../Spoilimage";
import RestoreImage from "../RestoreImage";

const Page = () => {
  const [source, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!source) return;

    const processFile = async () => {
      const seed = 12345;
      const blob = await spoilImage({ source, seed }); // Spoil the file

      if (blob) {
        const data = new FormData();
        data.append("image", blob, "name.png");
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
      }
    };

    processFile();
  }, [source]);

  return (
    <div>
      <input
        className="text-black"
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) setFile(f);
        }}
      />

      {previewUrl && (
        <div className="flex w-full justify-center items-center flex-col">
          <p className="text-black">Spoiled preview:</p>
          <img src={previewUrl} alt="spoiled" className="w-64 border" />

          <p className="text-black">Restored preview:</p>
          <RestoreImage ImageLink={previewUrl} Seed={12345} />
        </div>
      )}
    </div>
  );
};

export default Page;
