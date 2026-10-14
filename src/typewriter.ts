export async function typewrite(
  el: HTMLElement,
  text: string,
  speed = 58,
): Promise<void> {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = text;
    return;
  }

  el.textContent = "";
  for (const ch of text) {
    el.textContent += ch;
    const jitter = speed + Math.random() * 42;
    await new Promise((resolve) => window.setTimeout(resolve, jitter));
  }
}
