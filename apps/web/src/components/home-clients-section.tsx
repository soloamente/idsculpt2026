import { HomeClientsListSkullet } from "@/components/home-clients-list-skullet";
import { HOME_CLIENTS } from "@/lib/home-social-proof";

/** Companies the studio has worked with — centered list (Office Commun–style, without funding lines). */
export function HomeClientsSection() {
	return (
		<section
			aria-label="Clients"
			className="home-clients mx-auto flex w-full max-w-[48rem] flex-col items-center gap-10 px-6 text-center"
		>
			<p className="home-clients-label">Clients</p>
			<HomeClientsListSkullet clients={HOME_CLIENTS} />
		</section>
	);
}
