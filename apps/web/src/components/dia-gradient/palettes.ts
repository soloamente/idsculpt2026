// Palette ramps from the dia-gradient playground (arlan.me).

export type GradientStop = { offset: number; color: string };

/** Ocean ramp: deep navy → blue → cyan → aqua → violet → transparent. */
export const OCEAN_STOPS: GradientStop[] = [
	{ offset: 0, color: "#05122E" },
	{ offset: 0.22, color: "#0358F7" },
	{ offset: 0.45, color: "#19C3D6" },
	{ offset: 0.62, color: "#A8F0E0" },
	{ offset: 0.8, color: "#7B61FF" },
	{ offset: 1, color: "#C0E8FF00" },
];

/** Peaked layers: non-transparent stops from the Ocean ramp (playground convention). */
export const OCEAN_PEAKED_COLORS = OCEAN_STOPS.filter(
	(stop) => !stop.color.endsWith("00"),
).map((stop) => stop.color);
