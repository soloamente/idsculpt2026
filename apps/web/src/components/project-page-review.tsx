import { HomeHoverSurface } from "@/components/home-hover-surface";
import type { HomeReview } from "@/lib/home-social-proof";

interface ProjectPageReviewProps {
	review: HomeReview;
}

/**
 * Single static testimonial at the end of a case study (before “Start a similar project”),
 * reusing home copy and attribution pattern — no carousel.
 */
export function ProjectPageReview({ review }: ProjectPageReviewProps) {
	return (
		<section
			className="project-page-review"
			aria-label={`Client review — ${review.brand ?? review.person}`}
		>
			{/* Toned card — same surface + smooth scale hover as home post rail (`HomeHoverSurface`). */}
			<HomeHoverSurface className="project-page-review-card">
				<blockquote className="project-page-review-quote" lang="it">
					<p>{review.quote}</p>
				</blockquote>
				<footer className="project-page-review-attribution">
					<cite className="project-page-review-name">{review.person}</cite>
					<p className="project-page-review-meta">
						{review.brand ? (
							<>
								<span className="project-page-review-role-at">
									{review.role} at{" "}
								</span>
								<span className="project-page-review-brand">{review.brand}</span>
							</>
						) : (
							<span className="project-page-review-role-only">{review.role}</span>
						)}
					</p>
				</footer>
			</HomeHoverSurface>
		</section>
	);
}
