// Shared by the hero and its 3D scene. Kept free of three.js: hero.tsx imports it statically,
// and anything it pulls in lands in the first screen's JS (perf-auditor, RUN 2B stage 3).

/** Texts and numbers painted on the screen card; prepared on the server in the visitor's language. */
export type ScreenLabels = {
  brand: string
  today: string
  newEntry: string
  income: string
  expense: string
  chips: [string, string, string]
  save: string
  profitTitle: string
  profitChange: string
  amount: (value: number) => string
}

/** Scroll progress 0..1 → step of the hero story. */
export const stepOf = (p: number) => (p < 0.3 ? 0 : p < 0.66 ? 1 : 2)
