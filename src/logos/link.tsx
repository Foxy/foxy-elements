export function LinkLogo({ fg = "currentColor" }: { fg?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 24" height="18" aria-hidden="true">
      <text x="0" y="18" fill={fg} fontFamily="inherit" fontSize="18" fontWeight="600">
        Link
      </text>
    </svg>
  );
}
