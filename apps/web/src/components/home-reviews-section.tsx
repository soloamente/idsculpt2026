"use client";

import { useEffect, useRef, useState } from "react";

import { HOME_REVIEWS } from "@/lib/home-social-proof";

const ROTATE_MS = 8000;
const FADE_MS = 700;

/**
 * One rotating pull-quote band (Permanent.is-style). Fades between quotes;
 * pauses off-screen, when the tab is hidden, and under reduced motion.
 */
export function HomeReviewsSection() {
	const count = HOME_REVIEWS.length;
	const [index, setIndex] = useState(0);
	const [visible, setVisible] = useState(true);
	const sectionRef = useRef<HTMLElement>(null);
	const inViewRef = useRef(true);
	const fadeRef = useRef<number | undefined>(undefined);
	const review = HOME_REVIEWS[index] ?? HOME_REVIEWS[0];

	useEffect(() => {
		if (count <= 1) return;

		const reduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		const node = sectionRef.current;
		if (!node) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				inViewRef.current = entry?.isIntersecting ?? false;
			},
			{ root: null, threshold: 0.35 },
		);
		observer.observe(node);

		const advance = () => {
			if (document.hidden || !inViewRef.current) return;

			if (reduced) {
				setIndex((current) => (current + 1) % count);
				return;
			}

			setVisible(false);
			if (fadeRef.current !== undefined) {
				window.clearTimeout(fadeRef.current);
			}
			fadeRef.current = window.setTimeout(() => {
				setIndex((current) => (current + 1) % count);
				setVisible(true);
				fadeRef.current = undefined;
			}, FADE_MS);
		};

		const timer = window.setInterval(advance, ROTATE_MS);

		return () => {
			observer.disconnect();
			window.clearInterval(timer);
			if (fadeRef.current !== undefined) {
				window.clearTimeout(fadeRef.current);
			}
		};
	}, [count]);

	if (!review) {
		return null;
	}

	return (
		<section
			ref={sectionRef}
			aria-label="Client reviews"
			aria-roledescription="carousel"
			className="home-reviews mx-auto w-full text-center"
		>
			<div
				className="home-reviews-stage"
				data-visible={visible}
				aria-live="polite"
				aria-atomic="true"
			>
				<blockquote className="home-review-quote" lang="it">
					<p>{review.quote}</p>
				</blockquote>
				<footer className="home-review-attribution">
					<cite className="home-review-attribution-name">{review.person}</cite>
					<p className="home-review-attribution-meta">
						{review.brand ? (
							<>
								<span className="home-review-attribution-role-at">
									{review.role} at{" "}
								</span>
								<span className="home-review-attribution-brand">
									{review.brand}
								</span>
							</>
						) : (
							<span className="home-review-attribution-role-only">
								{review.role}
							</span>
						)}
					</p>
				</footer>
			</div>
			{count > 1 ? (
				<p className="sr-only">
					Review {index + 1} of {count}
				</p>
			) : null}
		</section>
	);
}
