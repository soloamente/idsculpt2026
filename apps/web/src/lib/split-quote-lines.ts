/**
 * Split blockquote copy into visual lines using the same width/font as the live
 * element (Permanent.is uses GSAP SplitText; we mirror the line breaks in DOM).
 */
export function splitQuoteIntoLines(
	container: HTMLElement,
	text: string,
): string[] {
	const styles = window.getComputedStyle(container);
	const measure = document.createElement("span");
	measure.setAttribute("aria-hidden", "true");
	measure.style.position = "fixed";
	measure.style.visibility = "hidden";
	measure.style.pointerEvents = "none";
	measure.style.whiteSpace = "nowrap";
	measure.style.font = styles.font;
	measure.style.letterSpacing = styles.letterSpacing;
	measure.style.fontVariationSettings = styles.fontVariationSettings;
	document.body.appendChild(measure);

	const maxWidth = container.clientWidth;
	const words = text.trim().split(/\s+/);
	const lines: string[] = [];
	let current = "";

	const pushLine = () => {
		if (current) {
			lines.push(current);
			current = "";
		}
	};

	for (const word of words) {
		const candidate = current ? `${current} ${word}` : word;
		measure.textContent = candidate;
		if (measure.offsetWidth > maxWidth && current) {
			pushLine();
			current = word;
		} else {
			current = candidate;
		}
	}
	pushLine();

	document.body.removeChild(measure);
	return lines.length > 0 ? lines : [text.trim()];
}
