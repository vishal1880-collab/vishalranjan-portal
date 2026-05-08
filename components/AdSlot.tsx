"use client";
import { useEffect } from "react";
import { ADSENSE_CLIENT } from "@/lib/site";

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

export default function AdSlot({ slot, format = "auto", responsive = true, className = "" }: { slot: string; format?: string; responsive?: boolean; className?: string }) {
  useEffect(() => {
    if (!ADSENSE_CLIENT) return;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch { /* noop */ }
  }, []);
  if (!ADSENSE_CLIENT) {
    return (
      <div className={`border border-dashed border-gray-300 rounded-md p-6 text-xs text-gray-500 text-center ${className}`}>
        Ad slot · set NEXT_PUBLIC_ADSENSE_CLIENT to enable
      </div>
    );
  }
  return (
    <ins
      className={`adsbygoogle block ${className}`}
      style={{ display: "block" }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : "false"}
    />
  );
}
