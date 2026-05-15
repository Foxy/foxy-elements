import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function CursorClickButtonIcon({
  className,
}: {
  className?: string;
}): ReactNode {
  return (
    <svg
      className={cn("fill-current", className)}
      width="64"
      height="33"
      viewBox="0 0 64 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M32.6709 13.5104C32.0279 12.929 31 13.3857 31 14.2526V27.0299C31.0003 27.8897 32.0141 28.3483 32.6602 27.7809L35.5498 25.2419L38.6396 32.1022C38.8642 32.6001 39.4469 32.8258 39.9482 32.609L40.4482 32.3932C40.9681 32.1685 41.1974 31.557 40.9541 31.0456L37.7441 24.3014L41.7158 23.9538C42.5856 23.8775 42.9464 22.802 42.2988 22.2165L32.6709 13.5104Z" />
      <path d="M64 6C64 2.68629 61.3137 0 58 0H6C2.68629 0 0 2.68629 0 6V18C0 21.3137 2.68629 24 6 24H28C28.5523 24 29 23.5523 29 23C29 22.4477 28.5523 22 28 22H6C3.79086 22 2 20.2091 2 18V6C2 3.79086 3.79086 2 6 2H58C60.2091 2 62 3.79086 62 6V18C62 20.2091 60.2091 22 58 22H45.4795C44.9272 22 44.4795 22.4477 44.4795 23C44.4795 23.5523 44.9272 24 45.4795 24H58C61.3137 24 64 21.3137 64 18V6Z" />
      <path d="M23.117 12.8881C22.5836 12.7451 22.267 12.1968 22.4099 11.6633C22.5529 11.1298 23.1012 10.8133 23.6347 10.9562L27.4984 11.9915C28.0318 12.1344 28.3484 12.6828 28.2055 13.2162C28.0625 13.7497 27.5142 14.0663 26.9807 13.9233L23.117 12.8881Z" />
      <path d="M36.1214 6.33133C36.5119 5.9408 37.1451 5.9408 37.5356 6.33133C37.9261 6.72185 37.9261 7.35502 37.5356 7.74554L34.7071 10.574C34.3166 10.9645 33.6835 10.9645 33.2929 10.574C32.9024 10.1834 32.9024 9.55028 33.2929 9.15975L36.1214 6.33133Z" />
      <path d="M27.0743 6.07106C26.8409 5.57052 27.0574 4.97554 27.558 4.74213C28.0585 4.50873 28.6535 4.72528 28.8869 5.22582L30.5774 8.85105C30.8108 9.35159 30.5942 9.94657 30.0937 10.18C29.5932 10.4134 28.9982 10.1968 28.7648 9.69629L27.0743 6.07106Z" />
    </svg>
  );
}

export function getGenericPaymentOptionIcon(icon: ReactNode): ReactNode {
  return (
    <span className="inline-flex h-5 shrink-0 items-center" aria-hidden>
      {icon}
    </span>
  );
}

export function toInlineSvgDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function PaymentOptionIconFallback({
  wrapperClassName,
}: {
  wrapperClassName?: string;
}): ReactNode {
  return (
    <span
      className={cn("inline-flex h-5 shrink-0 items-center", wrapperClassName)}
      aria-hidden
    />
  );
}
