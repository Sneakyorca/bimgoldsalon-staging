"use client";
import { InstagramLogoIcon } from "@phosphor-icons/react";
import { Mail } from "lucide-react";

const TikTok = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9a7.3 7.3 0 0 0 4.2 1.3V7.2a4.3 4.3 0 0 1-3.1-1.4Z" />
  </svg>
);

const SocialLinks = ({ className = "" }: { className?: string }) => {
  const item =
    "grid size-9 place-items-center rounded-full bg-white text-primary transition hover:opacity-80";
  return (
    <div className={`flex gap-3 ${className}`}>
      <a href="https://instagram.com" aria-label="Instagram" className={item}>
        <InstagramLogoIcon className="size-5.5" weight="bold" />
      </a>
      <a href="https://tiktok.com" aria-label="TikTok" className={item}>
        <TikTok className="size-5.5" />
      </a>
      <a href="mailto:hello@bimgold.com" aria-label="Email" className={item}>
        <Mail className="size-5.5" />
      </a>
    </div>
  );
};

export default SocialLinks;
