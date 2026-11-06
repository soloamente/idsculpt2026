import { HomeHoverSurface } from "@/components/home-hover-surface";
import {
	HOME_POST_RAIL_CARDS,
	HOME_POST_RAIL_MESSAGE,
	HOME_POST_RAIL_TITLE,
} from "@/components/studio-copy";

/**
 * Service tile illustrations — line-first mini compositions: each tile should
 * read as identity, product UI, campaign artboard, or system graph at a glance.
 *
 * `uniqueId` scopes SVG gradient ids so four glyphs on one page never clash.
 */
function CardGlyph({
	kind,
	uniqueId,
}: {
	kind: (typeof HOME_POST_RAIL_CARDS)[number]["icon"];
	uniqueId: string;
}) {
	const uid = uniqueId;
	const ink = "currentColor";
	const soft = "color-mix(in oklch, var(--home-ink) 12%, transparent)";
	const mid = "color-mix(in oklch, var(--home-ink) 28%, transparent)";
	const sw = 1.35;
	const cap: "round" | "butt" = "round";
	const join: "round" | "miter" = "round";

	const stroke = {
		fill: "none" as const,
		stroke: ink,
		strokeWidth: sw,
		strokeLinecap: cap,
		strokeLinejoin: join,
		vectorEffect: "non-scaling-stroke" as const,
	};

	switch (kind) {
		case "orbit":
			return (
				<svg
					viewBox="0 0 128 128"
					className="home-post-rail-card-glyph"
					aria-hidden
				>
					<defs>
						{/* Light band behind the mark so rings layer read clearly. */}
						<radialGradient id={`${uid}-orbit-glow`} cx="50%" cy="42%" r="55%">
							<stop
								offset="0%"
								stopColor="color-mix(in oklch, var(--home-ink) 18%, transparent)"
							/>
							<stop
								offset="100%"
								stopColor="color-mix(in oklch, var(--home-ink) 4%, transparent)"
							/>
						</radialGradient>
					</defs>
					{/* Pedestal / ground plane */}
					<ellipse cx="64" cy="90" rx="46" ry="10" fill={soft} opacity="0.4" />
					<circle cx="64" cy="52" r="36" fill={`url(#${uid}-orbit-glow)`} opacity="0.9" />
					{/* Tilted orbital paths (identity “world” around the mark) */}
					<ellipse
						{...stroke}
						cx="64"
						cy="52"
						rx="42"
						ry="18"
						transform="rotate(-22 64 52)"
						opacity="0.2"
					/>
					<ellipse
						{...stroke}
						cx="64"
						cy="52"
						rx="34"
						ry="14"
						transform="rotate(18 64 52)"
						opacity="0.28"
					/>
					<circle {...stroke} cx="64" cy="52" r="26" opacity="0.35" />
					{/* Logotype monogram: vertical stem + open counter — reads as “mark”, not a random bar */}
					<path
						{...stroke}
						strokeWidth={sw * 1.2}
						d="M56 36v36"
						opacity="0.95"
					/>
					<path
						{...stroke}
						strokeWidth={sw * 1.05}
						d="M62 40c12 0 20 8 20 18s-8 20-20 20"
						opacity="0.88"
					/>
					{/* Orbit accents: satellite dots */}
					<circle cx="92" cy="44" r="3.5" fill="#fff" />
					<circle {...stroke} cx="92" cy="44" r="3.5" opacity="0.7" />
					<circle cx="36" cy="58" r="2.8" fill={mid} opacity="0.55" />
					<circle {...stroke} cx="36" cy="58" r="2.8" opacity="0.55" />
					{/* Core */}
					<circle cx="64" cy="52" r="5" fill="#fff" />
					<circle {...stroke} cx="64" cy="52" r="5" opacity="0.9" />
				</svg>
			);
		case "stack":
			return (
				<svg
					viewBox="0 0 128 128"
					className="home-post-rail-card-glyph"
					aria-hidden
				>
					{/* Back device — blueprint ghost */}
					<rect x="28" y="38" width="46" height="64" rx="7" fill={soft} />
					<rect
						{...stroke}
						x="28"
						y="38"
						width="46"
						height="64"
						rx="7"
						opacity="0.22"
					/>
					{/* Middle — mid fidelity */}
					<rect
						x="38"
						y="46"
						width="50"
						height="68"
						rx="7"
						fill="color-mix(in oklch, var(--home-ink) 5%, #fff)"
					/>
					<rect
						{...stroke}
						x="38"
						y="46"
						width="50"
						height="68"
						rx="7"
						opacity="0.38"
					/>
					{/* Front — product surface with chrome + content blocks */}
					<rect x="48" y="54" width="52" height="72" rx="8" fill="#fff" />
					<rect
						{...stroke}
						x="48"
						y="54"
						width="52"
						height="72"
						rx="8"
						opacity="0.92"
					/>
					{/* Window chrome */}
					<path
						{...stroke}
						strokeWidth={sw * 0.9}
						d="M56 64h36M56 70h28"
						opacity="0.35"
					/>
					<circle cx="58" cy="60" r="2.2" fill={mid} opacity="0.45" />
					<circle cx="65" cy="60" r="2.2" fill={mid} opacity="0.3" />
					<circle cx="72" cy="60" r="2.2" fill={mid} opacity="0.2" />
					{/* Scroll content: hero + list rows */}
					<rect x="56" y="78" width="36" height="22" rx="3" fill={soft} />
					<path
						{...stroke}
						strokeWidth={sw * 0.85}
						d="M56 106h36M56 112h24M56 118h30"
						opacity="0.32"
					/>
					<rect x="56" y="104" width="14" height="18" rx="2" fill={mid} opacity="0.12" />
					{/* Home indicator */}
					<path
						{...stroke}
						strokeWidth={sw * 0.95}
						d="M68 124h12"
						strokeLinecap="round"
						opacity="0.45"
					/>
				</svg>
			);
		case "frame":
			return (
				<svg
					viewBox="0 0 128 128"
					className="home-post-rail-card-glyph"
					aria-hidden
				>
					<defs>
						<linearGradient id={`${uid}-poster-hero`} x1="0" y1="0" x2="1" y2="1">
							<stop offset="0%" stopColor={mid} stopOpacity="0.35" />
							<stop offset="100%" stopColor={ink} stopOpacity="0.12" />
						</linearGradient>
					</defs>
					{/* Desk shadow */}
					<ellipse cx="64" cy="114" rx="34" ry="5" fill={soft} opacity="0.55" />
					{/* Poster sheet */}
					<rect
						x="34"
						y="32"
						width="60"
						height="78"
						rx="4"
						fill="#fff"
					/>
					<rect
						{...stroke}
						x="34"
						y="32"
						width="60"
						height="78"
						rx="4"
						opacity="0.4"
					/>
					{/* Hero image area — abstract campaign visual */}
					<rect
						x="42"
						y="42"
						width="44"
						height="34"
						rx="3"
						fill={`url(#${uid}-poster-hero)`}
					/>
					<path
						{...stroke}
						strokeWidth={sw * 0.9}
						d="M48 68c8-10 18-10 26 2s16 4 22-6"
						opacity="0.45"
					/>
					<circle cx="76" cy="52" r="8" fill={soft} opacity="0.9" />
					<circle {...stroke} cx="76" cy="52" r="8" opacity="0.35" />
					{/* Body copy lines */}
					<path
						{...stroke}
						strokeWidth={sw * 0.85}
						d="M44 84h40M44 92h32M44 100h36"
						opacity="0.38"
					/>
					<rect x="44" y="84" width="12" height="3" rx="1" fill={mid} opacity="0.25" />
					{/* Crop marks — print layout */}
					<path
						{...stroke}
						strokeWidth={sw * 0.8}
						d="M26 32v-8M32 26h-8M102 26h8M102 32v-8M26 100v8M32 106h-8M102 106h8M102 100v8"
						opacity="0.52"
					/>
				</svg>
			);
		case "grid":
			return (
				<svg
					viewBox="0 0 128 128"
					className="home-post-rail-card-glyph"
					aria-hidden
				>
					<defs>
						<linearGradient id={`${uid}-sys-swatch`} x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor={ink} stopOpacity="0.45" />
							<stop offset="100%" stopColor={mid} stopOpacity="0.25" />
						</linearGradient>
					</defs>
					{/* Spec board */}
					<rect x="36" y="34" width="56" height="60" rx="5" fill={soft} />
					<rect
						{...stroke}
						x="36"
						y="34"
						width="56"
						height="60"
						rx="5"
						opacity="0.32"
					/>
					{/* Token strip: color roles */}
					<rect
						x="44"
						y="42"
						width="14"
						height="10"
						rx="2"
						fill={`url(#${uid}-sys-swatch)`}
					/>
					<rect x="60" y="42" width="14" height="10" rx="2" fill={mid} opacity="0.35" />
					<rect x="76" y="42" width="14" height="10" rx="2" fill="#fff" />
					<rect
						{...stroke}
						x="76"
						y="42"
						width="14"
						height="10"
						rx="2"
						opacity="0.5"
					/>
					{/* Type ramp */}
					<path
						{...stroke}
						strokeWidth={sw * 0.85}
						d="M44 62h32M44 70h24M44 78h28"
						opacity="0.4"
					/>
					{/* Component grid + dependency curve */}
					<rect x="44" y="88" width="18" height="14" rx="2" fill="#fff" />
					<rect
						{...stroke}
						x="44"
						y="88"
						width="18"
						height="14"
						rx="2"
						opacity="0.65"
					/>
					<rect x="66" y="88" width="18" height="14" rx="2" fill="#fff" />
					<rect
						{...stroke}
						x="66"
						y="88"
						width="18"
						height="14"
						rx="2"
						opacity="0.45"
					/>
					<path
						{...stroke}
						strokeWidth={sw * 0.9}
						d="M53 86C53 78 72 78 78 86"
						opacity="0.35"
					/>
					{/* Corner nodes */}
					<circle cx="44" cy="74" r="3" fill="#fff" />
					<circle {...stroke} cx="44" cy="74" r="3" opacity="0.7" />
					<circle cx="84" cy="74" r="3" fill="#fff" />
					<circle {...stroke} cx="84" cy="74" r="3" opacity="0.55" />
				</svg>
			);
		default: {
			const _exhaustive: never = kind;
			return _exhaustive;
		}
	}
}

/**
 * Short title + message (centered), then four portrait tiles in a 2×2 grid.
 * Not a second project rail.
 */
export function HomePostRailSection() {
	return (
		<section
			aria-labelledby="home-post-rail-heading"
			className="home-post-rail mx-auto w-full max-w-5xl px-6"
		>
			<header className="home-post-rail-intro">
				<h2 id="home-post-rail-heading" className="home-post-rail-heading">
					{HOME_POST_RAIL_TITLE}
				</h2>
				<p className="home-post-rail-message">{HOME_POST_RAIL_MESSAGE}</p>
			</header>

			<ul className="home-post-rail-grid">
				{HOME_POST_RAIL_CARDS.map((card) => (
					<li key={card.num} className="home-post-rail-card">
						<HomeHoverSurface className="home-post-rail-card-inner">
							<p className="home-post-rail-card-index">
								<span className="home-post-rail-card-num">({card.num})</span>{" "}
								<span className="home-post-rail-card-title">{card.title}</span>
							</p>
							<div className="home-post-rail-card-figure">
								<CardGlyph
									kind={card.icon}
									uniqueId={`home-post-rail-glyph-${card.num}`}
								/>
							</div>
							<p className="home-post-rail-card-tagline">{card.tagline}</p>
						</HomeHoverSurface>
					</li>
				))}
			</ul>
		</section>
	);
}
