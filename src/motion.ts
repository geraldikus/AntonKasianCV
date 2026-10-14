export async function initMotion(): Promise<void> {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const { gsap } = await import("gsap");
  const { ScrollTrigger } = await import("gsap/ScrollTrigger");
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el, index) => {
    gsap.from(el, {
      opacity: 0,
      y: 20,
      duration: 0.45,
      delay: Math.min(index * 0.03, 0.2),
      ease: "steps(7)",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        once: true,
      },
    });
  });
}
