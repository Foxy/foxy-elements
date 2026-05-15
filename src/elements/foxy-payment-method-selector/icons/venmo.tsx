import type { ReactNode } from "react";

export default function VenmoMarkIcon({
  className,
}: {
  className?: string;
}): ReactNode {
  return (
    <svg
      viewBox="0 0 36.6377 39.8888"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fill="#008CFF"
        d="m 34.5771,0.822021 c 1.4203,2.345309 2.0606,4.760989 2.0606,7.812489 0,9.73269 -8.31,22.37619 -15.0545,31.25429 H 6.17825 L 0,2.95296 13.4887,1.67258 16.7552,27.9548 c 3.0522,-4.9714 6.8186,-12.7838 6.8186,-18.11027 0,-2.91551 -0.4995,-4.90135 -1.2803,-6.53647 z"
      />
    </svg>
  );
}
