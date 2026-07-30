/** Minimal SVG icon library — no dependencies, consistent 20x20 viewBox. */

interface IconProps {
  size?: number;
  className?: string;
}

function icon(paths: string | string[], baseClass = '') {
  const d = Array.isArray(paths) ? paths : [paths];
  return function Icon({ size = 20, className = '' }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${baseClass} ${className}`.trim()}
      >
        {d.map((p, i) => (
          <path key={i} d={p} />
        ))}
      </svg>
    );
  };
}

export const IconDashboard = icon('M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z');
export const IconProject = icon('M3 7V3h4l2 4H3zm0 0v12a2 2 0 002 2h12M14 2h6v6M14 2L3 13M22 8v12a2 2 0 01-2 2H8');
export const IconScript = icon([
  'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7',
  'M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
]);
export const IconImage = icon([
  'M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z',
  'M8.5 10a1.5 1.5 0 110-3 1.5 1.5 0 010 3z',
  'M21 15l-5-5L5 21',
]);
export const IconVideo = icon([
  'M23 7l-7 5 7 5V7z',
  'M14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z',
]);
export const IconReview = icon([
  'M9 12l2 2 4-4',
  'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z',
]);
export const IconPipeline = icon([
  'M22 12h-4l-3 9L9 3l-3 9H2',
]);
export const IconAssets = icon([
  'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z',
  'M3.27 6.96L12 12.01l8.73-5.05',
  'M12 22.08V12',
]);
export const IconSettings = icon([
  'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z',
]);
export const IconNotifications = icon([
  'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9',
  'M13.73 21a2 2 0 01-3.46 0',
]);
export const IconSun = icon([
  'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42',
  'M12 17a5 5 0 100-10 5 5 0 000 10z',
]);
export const IconMoon = icon('M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z');
export const IconSearch = icon([
  'M11 19a8 8 0 100-16 8 8 0 000 16z',
  'M21 21l-4.35-4.35',
]);
export const IconPlus = icon(['M12 5v14', 'M5 12h14']);
export const IconArrowLeft = icon('M19 12H5M12 19l-7-7 7-7');
export const IconArrowRight = icon('M5 12h14M12 5l7 7-7 7');
export const IconChevronDown = icon('M6 9l6 6 6-6');
export const IconChevronUp = icon('M18 15l-6-6-6 6');
export const IconChevronRight = icon('M9 18l6-6-6-6');
export const IconEdit = icon([
  'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7',
  'M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
]);
export const IconExternalLink = icon([
  'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6',
  'M15 3h6v6',
  'M10 14L21 3',
]);
export const IconClose = icon(['M18 6L6 18', 'M6 6l12 12']);
export const IconPlay = icon('M5 3l14 9-14 9V3z');
export const IconCheck = icon('M20 6L9 17l-5-5');
export const IconCross = icon(['M18 6L6 18', 'M6 6l12 12']);
export const IconAlert = icon([
  'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  'M12 9v4',
  'M12 17h.01',
]);
export const IconInfo = icon([
  'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z',
  'M12 16v-4',
  'M12 8h.01',
]);
export const IconRefresh = icon([
  'M21.5 2v6h-6M2.5 22v-6h6',
  'M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2',
]);
export const IconDownload = icon([
  'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4',
  'M7 10l5 5 5-5',
  'M12 15V3',
]);
export const IconUpload = icon([
  'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4',
  'M17 8l-5-5-5 5',
  'M12 3v12',
]);
export const IconDuplicate = icon([
  'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2',
  'M16 12h2a2 2 0 012 2v4a2 2 0 01-2 2h-6a2 2 0 01-2-2v-2',
  'M12 8h6v6',
]);
export const IconTrash = icon([
  'M3 6h18',
  'M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6',
  'M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2',
  'M10 11v6M14 11v6',
]);
export const IconArchive = icon([
  'M21 8v13a2 2 0 01-2 2H5a2 2 0 01-2-2V8',
  'M1 3h22v5H1V3z',
  'M10 12h4',
]);
export const IconFilter = icon('M22 3H2l8 9.46V19l4 2v-8.54L22 3z');
export const IconMoreVertical = icon([
  'M12 13a1 1 0 100-2 1 1 0 000 2z',
  'M12 6a1 1 0 100-2 1 1 0 000 2z',
  'M12 20a1 1 0 100-2 1 1 0 000 2z',
]);
export const IconGrid = icon([
  'M3 3h7v7H3V3zM14 3h7v7h-7V3zM3 14h7v7H3v-7zM14 14h7v7h-7v-7z',
]);
export const IconList = icon([
  'M8 6h13M8 12h13M8 18h13',
  'M3 6h.01M3 12h.01M3 18h.01',
]);
export const IconUsers = icon([
  'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2',
  'M23 21v-2a4 4 0 00-3-3.87',
  'M16 3.13a4 4 0 010 7.75',
  'M9 11a4 4 0 100-8 4 4 0 000 8z',
]);
export const IconZap = icon('M13 2L3 14h9l-1 8 10-12h-9l1-8z');
export const IconClock = icon([
  'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z',
  'M12 6v6l4 2',
]);
export const IconTarget = icon([
  'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z',
  'M12 18a6 6 0 100-12 6 6 0 000 12z',
  'M12 14a2 2 0 100-4 2 2 0 000 4z',
]);
export const IconLayout = icon([
  'M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z',
  'M3 9h18M9 21V9',
]);
export const IconEye = icon([
  'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z',
  'M12 15a3 3 0 100-6 3 3 0 000 6z',
]);
export const IconEyeOff = icon([
  'M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94',
  'M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19',
  'M14.12 14.12a3 3 0 11-4.24-4.24',
  'M1 1l22 22',
]);
export const IconFolder = icon('M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z');
export const IconFile = icon([
  'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z',
  'M14 2v6h6',
  'M16 13H8M16 17H8M10 9H8',
]);
export const IconHome = icon('M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM9 22V12h6v10');
export const IconBook = icon('M4 6h16v12H4z M4 6a2 2 0 012-2h8l4 4v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z M16 2v6h6');
export const IconWallet = icon([
  'M20 7H5a3 3 0 000 6h15v7H5a3 3 0 01-3-3V7a3 3 0 013-3h13a2 2 0 012 2v1z',
  'M16 13h4v4h-4a2 2 0 010-4z',
]);
export const IconServer = icon([
  'M4 4h16a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z',
  'M4 12h16a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2z',
  'M6 8h.01M6 16h.01M10 8h8M10 16h8',
]);
