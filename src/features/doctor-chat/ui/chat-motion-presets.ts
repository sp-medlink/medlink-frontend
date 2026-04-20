import type { Transition, Variants } from "framer-motion";

/**
 * Slide-based motion for the chat dock and the FAB. Panel slides in
 * from the right edge; FAB slides up from the bottom. Reduces to flat
 * opacity-stable variants when the user prefers reduced motion.
 */
export function buildChatMotionPresets(reduceMotion: boolean | null) {
  const panelSpring: Transition = reduceMotion
    ? { duration: 0.32, ease: [0.32, 0.72, 0, 1] }
    : {
        type: "spring",
        stiffness: 220,
        damping: 42,
        mass: 1,
        restDelta: 0.01,
        restSpeed: 0.01,
      };

  const panelExit: Transition = reduceMotion
    ? { duration: 0.28, ease: [0.4, 0, 0.2, 1] }
    : {
        type: "spring",
        stiffness: 280,
        damping: 44,
        mass: 0.95,
      };

  const fabSlide: Transition = reduceMotion
    ? { duration: 0.28, ease: [0.32, 0.72, 0, 1] }
    : {
        type: "spring",
        stiffness: 340,
        damping: 32,
        mass: 0.8,
      };

  const panelVariants: Variants = reduceMotion
    ? {
        hidden: { x: "100%", opacity: 1 },
        visible: { x: 0, opacity: 1, transition: panelSpring },
        exit: { x: "100%", opacity: 1, transition: panelExit },
      }
    : {
        hidden: { x: "100%", opacity: 1 },
        visible: { x: 0, opacity: 1, transition: { x: panelSpring } },
        exit: { x: "100%", opacity: 1, transition: { x: panelExit } },
      };

  const fabVariants: Variants = reduceMotion
    ? {
        hidden: { y: 56, opacity: 1 },
        visible: { y: 0, opacity: 1, transition: fabSlide },
        exit: { y: 56, opacity: 1, transition: { duration: 0.22 } },
      }
    : {
        hidden: { y: 72, opacity: 1 },
        visible: { y: 0, opacity: 1, transition: fabSlide },
        exit: {
          y: 72,
          opacity: 1,
          transition: { type: "spring", stiffness: 380, damping: 36 },
        },
      };

  const listContainer: Variants = {
    hidden: {},
    visible: {
      transition: reduceMotion
        ? { staggerChildren: 0 }
        : { staggerChildren: 0.04, delayChildren: 0.08 },
    },
  };

  const listItem: Variants = reduceMotion
    ? { hidden: { x: 12, opacity: 1 }, visible: { x: 0, opacity: 1 } }
    : {
        hidden: { x: 20, opacity: 1 },
        visible: {
          x: 0,
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 38,
            mass: 0.85,
          },
        },
      };

  return { panelVariants, fabVariants, listContainer, listItem };
}
