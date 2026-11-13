// Decorative icons: always aria-hidden, the label lives on the button/link.
const base = {
  width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: 'false',
};

export const BrainIcon = () => (
  <svg {...base}>
    <path d="M9.5 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5.2A3.5 3.5 0 0 0 7 17.5 3 3 0 0 0 12 19V5a2 2 0 0 0-2.5-2Z" />
    <path d="M14.5 3a3 3 0 0 1 3 3 3 3 0 0 1 2 5.2 3.5 3.5 0 0 1-2.5 6.3A3 3 0 0 1 12 19V5a2 2 0 0 1 2.5-2Z" />
  </svg>
);
export const SearchIcon = () => (<svg {...base}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>);
export const HomeIcon = () => (<svg {...base}><path d="M3.5 10.5 12 3.5l8.5 7" /><path d="M5.5 9v11h13V9M10 20v-5.5h4V20" /></svg>);
export const BookmarkIcon = () => (<svg {...base}><path d="M6.5 3.5h11v17L12 16.5l-5.5 4Z" /></svg>);
export const MapIcon = () => (
  <svg {...base}>
    <circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="8" r="2.5" /><circle cx="9" cy="18" r="2.5" />
    <path d="m8.2 7.2 2 8.6M8.4 5.8l7.2 1.5M16.4 9.9l-5.6 6.4" />
  </svg>
);
export const InputIcon = () => (<svg {...base}><rect x="3.5" y="4.5" width="17" height="15" rx="3" /><path d="M12 8.5v7M8.5 12h7" /></svg>);
export const ShieldIcon = () => (<svg {...base}><path d="M12 3.5 19 6v5.5c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9V6Z" /><path d="m9 12 2.2 2.2L15.5 10" /></svg>);
