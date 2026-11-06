"use client";

import { SkulletRevealOnView } from "@/components/skullet-reveal-on-view";
import type { HomeClient } from "@/lib/home-social-proof";

export function HomeClientsListSkullet({
	clients,
}: {
	clients: readonly HomeClient[];
}) {
	return (
		<SkulletRevealOnView slow label="Loading clients" className="w-full">
			<ul className="home-clients-list">
				{clients.map((client) => (
					<li key={client.name} className="home-client">
						<span className="home-client-name">{client.name}</span>
						<span className="home-client-sep" aria-hidden>
							{" "}
							·{" "}
						</span>
						<span className="home-client-line">{client.line}</span>
					</li>
				))}
			</ul>
		</SkulletRevealOnView>
	);
}
