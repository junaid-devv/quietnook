export function Icon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const paths: Record<string, React.ReactNode> = {
    chevron: <path d="m6 9 6 6 6-6" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    arrow: (
      <>
        <path d="M4 12h16m-6-6 6 6-6 6" />
      </>
    ),
    house: (
      <>
        <path d="m3 11 9-8 9 8M6 9v12h12V9M10 21v-7h4v7" />
      </>
    ),
    sofa: (
      <>
        <path d="M5 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5M5 16h14M4 10a2 2 0 0 0-2 2v7h20v-7a2 2 0 0 0-4 0v4M6 21v-2m12 2v-2M6 16v-4a2 2 0 0 0-2-2" />
      </>
    ),
    bed: (
      <>
        <path d="M3 20V6m18 14V6M3 16h18M3 11h18v5M7 11V8h4v3m2 0V8h4v3" />
      </>
    ),
    pot: (
      <>
        <path d="M5 9h14v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2ZM3 9h18M9 6c0-3 6-3 6 0M2 12h3m14 0h3" />
      </>
    ),
    bath: (
      <>
        <path d="M2 12h20M4 12v4a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-4M6 22v-2m12 2v-2M18 12V5a2 2 0 0 0-4 0v1m-1 1h3" />
      </>
    ),
    plant: (
      <>
        <path d="M6 15h12l-1 7H7ZM12 15V4M12 11C5 12 3 7 4 3c6 0 8 3 8 8ZM12 8c0-5 4-7 8-6 0 5-3 8-8 6Z" />
      </>
    ),
    box: (
      <>
        <path d="M4 8v13h16V8M3 4h18v4H3ZM9 12h6" />
      </>
    ),
    scissors: (
      <>
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="18" r="3" />
        <path d="m8 16 12-14M16 16 4 2m7 10 2 2" />
      </>
    ),
    leaf: (
      <>
        <path d="M5 22c2-8 7-13 13-18M8 16C1 8 8 2 20 2c2 12-5 19-12 14ZM8 16l-1-7m6 2h6" />
      </>
    ),
    heart: <path d="M12 21 3 12C-3 5 6-1 12 6c6-7 15-1 9 6Z" />,
    snow: (
      <>
        <path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 3 3-3M9 20l3-3 3 3M4 10l4-1-1-4m13 9-4 1 1 4M4 14l4 1-1 4m13-9-4-1 1-4" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2" />
      </>
    ),
    flower: (
      <>
        <circle cx="12" cy="12" r="2" />
        <path d="M10 9C3-1 20-1 14 9c12-3 7 13 0 6 6 11-11 11-4 0-11 6-13-10 0-6Z" />
      </>
    ),
    spark: (
      <>
        <path d="M12 2v6m0 8v6M2 12h6m8 0h6M5 5l4 4m6 6 4 4M5 19l4-4m6-6 4-4M9 1l1 4m4 14 1 4M1 9l4 1m14 4 4 1" />
      </>
    ),
    bat: (
      <path d="M12 8 9 5v4C6 5 3 6 1 9c3 0 2 6 6 5 0 3 3 3 5 6 2-3 5-3 5-6 4 1 3-5 6-5-2-3-5-4-8 0V5Z" />
    ),
  };
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.leaf}
    </svg>
  );
}
