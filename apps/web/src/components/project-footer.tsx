/**
 * Site footer: legal line, socials, and full-width wordmark from the previous site.
 * Sits inside `.project-page` or `.home-page-bottom` (40px inset); negative
 * horizontal margin lets the wordmark bleed to the viewport edges.
 */
export function ProjectFooter() {
	return (
		<footer className="project-footer">
			<div className="project-footer-bar">
				<p>
					{/* Short mark on small screens; the full line from the previous footer from `md` up. */}
					<span className="md:hidden">© 2026</span>
					<span className="hidden md:inline">
						Copyright © 2026 Identity Sculpt. All rights reserved.
					</span>
				</p>
				<nav aria-label="Social">
					<a
						href="https://www.instagram.com/idsculpt/"
						target="_blank"
						rel="noopener noreferrer"
					>
						Instagram
					</a>
					<a
						href="https://www.linkedin.com/company/identitysculpt/"
						target="_blank"
						rel="noopener noreferrer"
					>
						LinkedIn
					</a>
					{/* Third nav slot is X; href must match the visible label (was mistakenly Facebook). */}
					<a
						href="https://x.com/Identitysculpt"
						target="_blank"
						rel="noopener noreferrer"
					>
						X <span className="hidden opacity-50 md:inline">(Twitter)</span>
					</a>
				</nav>
			</div>
			{/* Wordmark from the previous site, ink-coloured so it sits on the white page. */}
			<img
				src="/brand/identity-sculpt.svg"
				alt="Identity Sculpt"
				width={1395}
				height={156}
				className="project-footer-mark"
			/>
		</footer>
	);
}
