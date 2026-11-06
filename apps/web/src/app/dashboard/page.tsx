import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { PageShell } from "@/components/page-shell";

import { auth } from "../../services";
import Dashboard from "./dashboard";

export default async function DashboardPage() {
	// Touch the request first. Next then treats this page as dynamic and
	// stops the build-time render before auth is constructed.
	const requestHeaders = await headers();
	const session = await auth.api.getSession({
		headers: requestHeaders,
	});

	if (!session?.user) {
		redirect("/login");
	}

	return (
		<PageShell>
			<div>
				<h1>Dashboard</h1>
				<p>Welcome {session.user.name}</p>
				<Dashboard session={session} />
			</div>
		</PageShell>
	);
}
