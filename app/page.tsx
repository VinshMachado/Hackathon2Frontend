"use client";
import React from "react";
import RestoreImage from "./RestoreImage";
import { useEffect } from "react";

const page = () => {
  useEffect(() => {}, []);
  return <RestoreImage ImageLink={"/spoiled.png"} Seed={12345} />;
};

export default page;
