import type { ReactNode } from "react";

export default function BlikMarkIcon({
  className,
}: {
  className?: string;
}): ReactNode {
  return (
    <svg
      className={className}
      viewBox="0 0 135.6 64.2"
      xmlns="http://www.w3.org/2000/svg"
    >
      <linearGradient
        id="a"
        x1="67.8"
        x2="67.8"
        y1="63.1"
        y2="1.1"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stop-color="#5a5a5a" />
        <stop offset=".1" stop-color="#484848" />
        <stop offset=".5" stop-color="#212121" />
        <stop offset=".8" stop-color="#080808" />
        <stop offset="1" />
      </linearGradient>
      <linearGradient
        id="b"
        x1="39.7"
        x2="49.7"
        y1="19.9"
        y2="9.9"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stop-color="#e52f08" />
        <stop offset="1" stop-color="#e94f96" />
      </linearGradient>
      <filter
        id="c"
        width="99.4"
        height="50.2"
        x="21.7"
        y="10.1"
        filterUnits="userSpaceOnUse"
      >
        <feOffset dx="2.4" dy="3" />
        <feGaussianBlur result="blur" stdDeviation=".7" />
        <feFlood flood-opacity=".9" />
        <feComposite in2="blur" operator="in" result="result1" />
        <feComposite in="SourceGraphic" in2="result1" />
      </filter>
      <path
        fill="url(#a)"
        d="M127.7.8H8A7 7 0 0 0 1 8v48.4a7 7 0 0 0 7 7h119.8a7 7 0 0 0 7.1-7V7.9a7 7 0 0 0-7-7"
      />
      <path
        fill="url(#b)"
        d="M51.8 14.9a7 7 0 0 1-7.1 7 7 7 0 0 1-7.1-7 7 7 0 0 1 7-7.1 7 7 0 0 1 7.2 7"
      />
      <path
        fill="#fff"
        d="M106.3 55h10.2l-12.3-15.8 11.1-13.6h-9.2L95 39.3V10h-7.9v45h8V39.2Zm-34-29.4h8V55h-8ZM57.3 10h8v45h-8ZM36.7 25.3a15 15 0 0 0-7 1.8V10h-8v30.2a15 15 0 1 0 15-15m0 22.2a7.2 7.2 0 1 1 7.3-7.2 7 7 0 0 1-7.3 7.2"
        filter="url(#c)"
      />
    </svg>
  );
}
