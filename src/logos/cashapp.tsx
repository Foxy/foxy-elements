function QrCodeIcon({ fg }: { fg: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={fg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="5" height="5" x="3" y="3" rx="1"/>
      <rect width="5" height="5" x="16" y="3" rx="1"/>
      <rect width="5" height="5" x="3" y="16" rx="1"/>
      <path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/>
      <path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/>
      <path d="M21 12v.01"/><path d="M12 21v-1"/>
    </svg>
  );
}

export function CashAppLogo({ fg = "currentColor" }: { fg?: string }) {
  return (
    <>
      <QrCodeIcon fg={fg}/>
      <span style={{ color: fg, fontSize: "1rem", fontFamily: "inherit", whiteSpace: "nowrap" }}>Generate QR Code</span>
    </>
  );
}

export function WeChatPayLogo({ fg = "currentColor" }: { fg?: string }) {
  return (
    <>
      <QrCodeIcon fg={fg}/>
      <span style={{ color: fg, fontSize: "1rem", fontFamily: "inherit", whiteSpace: "nowrap" }}>Generate QR Code</span>
    </>
  );
}
