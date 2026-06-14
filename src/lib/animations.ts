export const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
}

export const CARD_CONTAINER = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

export const CARD_ITEM = {
  initial: { opacity: 0, scale: 0.96, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
}

export const MODAL = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
  transition: { type: "spring" as const, stiffness: 400, damping: 30 },
}

export const BACKDROP = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
}

export const SLIDE_IN_RIGHT = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 40 },
  transition: { type: "spring" as const, stiffness: 350, damping: 30 },
}

export const SHEET_BOTTOM = {
  initial: { y: "100%" },
  animate: { y: 0 },
  exit: { y: "100%" },
  transition: { type: "spring" as const, stiffness: 350, damping: 35 },
}

export const STAR_POP = {
  scale: [1, 1.5, 0.9, 1.1, 1],
  transition: { duration: 0.4, times: [0, 0.3, 0.5, 0.75, 1] },
}
