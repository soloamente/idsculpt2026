import { WorkGallery } from "@/components/work-gallery";

// Capture stand-in for permanent.is section.work: 12px page inset, tiles 786px tall.
// The home page uses the same carousel inside its own section height.
export default function WorkCarouselCapture() {
	return (
		<div className="min-h-svh bg-white p-3">
			<section
				className="work flex h-[786px] w-full"
				aria-label="Selected product work"
			>
				<WorkGallery bleed />
			</section>
		</div>
	);
}
