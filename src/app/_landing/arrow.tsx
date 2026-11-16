/** Arrow for buttons and links: the shaft appears and the head moves on hover (styles: `.live-arrow` in globals.css). */
export function LiveArrow() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="live-arrow size-3.5 shrink-0 overflow-visible"
    >
      <path className="shaft" d="M2 7h9" />
      <path className="head" d="M6 3l4 4-4 4" />
    </svg>
  )
}
