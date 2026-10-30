import type { ReactNode } from 'react';
import type * as t from '@/types';
export function GovernanceIcon({ name, ...props }: t.GovernanceIconProps) {
  const paths: Record<t.GovernanceIconProps['name'], ReactNode> = {
    home: (
      <>
        <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
        <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </>
    ),
    chat: (
      <path d="M13 17h5a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h2v4l5-4Z" />
    ),
    'sign-out': (
      <>
        <path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
        <path d="M13 8l4 4-4 4M7 12h10" />
      </>
    ),
    'slide-out': (
      <>
        <path strokeWidth="1.5" d="M18.703 12.015H6.836M11.576 16.509l-4.78-4.51 4.78-4.508" />
        <path strokeWidth="1.5" d="M5 7v10" />
      </>
    ),
    'slide-in': (
      <>
        <path strokeWidth="1.5" d="M5.297 11.985h11.867M12.424 7.491l4.78 4.51-4.78 4.508" />
        <path strokeWidth="1.5" d="M19 17V7" />
      </>
    ),
    overview: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,

    'term-list': (
      <>
        <circle cx="4" cy="5" r="1" fill="currentColor" stroke="none" />
        <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="4" cy="19" r="1" fill="currentColor" stroke="none" />
        <path d="M9 5h12M9 12h12M9 19h12" />
      </>
    ),
    usage: (
      <>
        <path d="M3 3v18h18" />
        <path d="m7 16 4-5 4 3 5-7" />
      </>
    ),
    audit: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6M8 13h8M8 17h6" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    'account-settings': (
      <path
        strokeWidth="1.5"
        d="M18 5h3M3 5h11M10 12h11M3 12h3M18 19h3M3 19h11M17.414 3.586a2 2 0 1 1-2.828 2.828 2 2 0 0 1 2.828-2.828M9.414 10.586a2 2 0 1 1-2.828 2.828 2 2 0 0 1 2.828-2.828M17.414 17.586a2 2 0 1 1-2.828 2.828 2 2 0 0 1 2.828-2.828"
      />
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
