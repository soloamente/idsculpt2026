"use client";

import {
	type ReactNode,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { Skeleton, SkulletProvider } from "skullet/react";

import { skulletRevealSlow } from "@/components/skullet-config";

interface SkulletRevealOnViewProps {
	/** Screen-reader label while the measured skeleton is visible. */
	label: string;
	children: ReactNode;
	className?: string;
	/** Pre-footer blocks use the slower crossfade from skullet-config. */
	slow?: boolean;
}

/**
 * Holds copy in a skullet skeleton until the block nears the viewport, then
 * reveals with the app-wide theme (or the slow variant when `slow` is set).
 */
export function SkulletRevealOnView({
	label,
	children,
	className,
	slow = false,
}: SkulletRevealOnViewProps) {
	const rootRef = useRef<HTMLDivElement>(null);
	const [loading, setLoading] = useState(true);

	const revealIfVisible = (node: HTMLElement) => {
		const rect = node.getBoundingClientRect();
		if (rect.width <= 0 || rect.height <= 0) return false;
		if (rect.bottom <= 0 || rect.top >= window.innerHeight) return false;
		setLoading(false);
		return true;
	};

	// Re-check after layout: skeleton height can land one frame after mount.
	useLayoutEffect(() => {
		const node = rootRef.current;
		if (!node) return;
		if (revealIfVisible(node)) return;
		const id = requestAnimationFrame(() => {
			revealIfVisible(node);
		});
		return () => cancelAnimationFrame(id);
	}, []);

	useEffect(() => {
		const node = rootRef.current;
		if (!node) return;

		const reveal = () => setLoading(false);
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) reveal();
			},
			{ rootMargin: "0px 0px -8% 0px", threshold: 0 },
		);
		observer.observe(node);
		revealIfVisible(node);

		const resize = new ResizeObserver(() => {
			revealIfVisible(node);
		});
		resize.observe(node);

		return () => {
			observer.disconnect();
			resize.disconnect();
		};
	}, []);

	const body = (
		<Skeleton loading={loading} label={label}>
			{children}
		</Skeleton>
	);

	if (slow) {
		return (
			<SkulletProvider reveal={skulletRevealSlow}>
				<div ref={rootRef} className={className}>
					{body}
				</div>
			</SkulletProvider>
		);
	}

	return (
		<div ref={rootRef} className={className}>
			{body}
		</div>
	);
}
