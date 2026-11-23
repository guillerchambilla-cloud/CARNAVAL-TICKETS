// components/HeroVideo.tsx
"use client";

export default function HeroVideo({
  src,
  poster,
}: {
  src: string;
  poster: string;
}) {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      poster={poster}
      className="absolute inset-0 h-full w-full object-cover object-center"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}