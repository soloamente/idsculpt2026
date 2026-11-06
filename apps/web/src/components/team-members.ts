import type { ProjectSlug } from "@/components/projects";

export interface TeamHighlight {
	id: string;
	label: string;
	href?: `/work/${ProjectSlug}`;
}

export type TeamSocialNetwork = "instagram" | "linkedin" | "x" | "github";

export interface TeamSocial {
	network: TeamSocialNetwork;
	label: string;
	href: string;
}

export interface TeamMember {
	id: string;
	name: string;
	role: string;
	bio: string;
	highlights: readonly TeamHighlight[];
	socials: readonly TeamSocial[];
	// Portrait at public/team/<name>/<name>.png. Without one, the card shows initials.
	image?: string;
}

const STUDIO_INSTAGRAM = "https://www.instagram.com/idsculpt/";
const STUDIO_LINKEDIN = "https://www.linkedin.com/company/identitysculpt/";

// Portraits live at public/team/<name>/<name>.png.
export const TEAM_MEMBERS = [
	{
		id: "adam",
		name: "Adam Adamu",
		role: "Co-Founder & Creative Director",
		image: "/team/adam/adam.png",
		bio: "Started the studio and still signs off on the work that carries the name.",
		highlights: [
			{ id: "tenryuu", label: "Tenryuu", href: "/work/tenryuu" },
			{ id: "oasis", label: "Oasis" },
		],
		socials: [
			{
				network: "instagram",
				label: "Instagram",
				href: "https://www.instagram.com/identitysculpt/",
			},
			{ network: "x", label: "X (twitter)", href: "https://x.com/adgv_studio" },
		],
	},
	{
		id: "adgv",
		name: "Anselmo Diogo Guatta Vicente",
		role: "Multidisciplinary Designer",
		image: "/team/adgv/adgv.png",
		bio: "Leads identity, type, and the printed and digital surfaces the studio puts into the world. The work runs from naming through to the last layout, including the cases where a system has to hold a long product name, a two-line headline, and a dense caption without falling apart.",
		highlights: [
			{ id: "tenryuu", label: "Tenryuu", href: "/work/tenryuu" },
			{
				id: "travel",
				label: "Notes from the long way round",
				href: "/work/travel-app",
			},
			{ id: "chili", label: "Chili Riders", href: "/work/chili-riders" },
		],
		socials: [
			{ network: "instagram", label: "Instagram", href: STUDIO_INSTAGRAM },
		],
	},
	{
		id: "annalaura",
		name: "Annalaura",
		role: "3D Artist & CGI",
		image: "/team/annalaura/annalaura.png",
		bio: "Builds the sites and the tools the studio ships, and keeps the work fast enough that the motion still feels like it belongs to the page.",
		highlights: [
			{
				id: "travel",
				label: "Navia",
				href: "/work/travel-app",
			},
			{ id: "chili", label: "Chili Riders", href: "/work/chili-riders" },
		],
		socials: [],
	},
	{
		id: "daniele",
		name: "Daniele Pisani",
		role: "Founder & Managing Director",
		image: "/team/daniele/daniele.png",
		bio: "Sets the brief, the sequence, and who the work is actually for, before anyone opens a file.",
		highlights: [
			{ id: "chili", label: "Chili Riders", href: "/work/chili-riders" },
			{ id: "tenryuu", label: "Tenryuu", href: "/work/tenryuu" },
		],
		socials: [
			{ network: "linkedin", label: "LinkedIn", href: STUDIO_LINKEDIN },
		],
	},
] as const satisfies readonly TeamMember[];
