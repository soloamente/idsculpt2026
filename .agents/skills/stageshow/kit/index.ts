// Components import their own CSS, so no separate style import is required.
// Which unused styles are removed depends on the host bundler.
// kit/stageshow.css explicitly loads every kit style up front.

export type { Act, Script } from "./act";
export type { BrandAsset, BrandName } from "./brands";
export { brandMarks } from "./brands";
export type { ChartProps } from "./chart";
export { Chart, chartPoints } from "./chart";
export type { ClockControl } from "./clock";
export { clock, installVirtualClock } from "./clock";
export type { CodeLine } from "./code";
export { Code } from "./code";
export type { FieldProps } from "./controls";
export { Badge, Field, Segmented, Slot, Tabs, Toggle } from "./controls";
export type { CursorKind, CursorStyle } from "./cursor";
export type { Bezier, EaseName } from "./ease";
export { bezier, css as easeCss, EASE } from "./ease";
export type { KeyboardProps } from "./ios";
export { Keyboard } from "./ios";
export type { KeysAt } from "./keys";
export type { Fidelity, Layout, Palette, Theme } from "./looks";
export { useLook } from "./looks";
export type { Point, Rect, Target } from "./measure";
export { between, box, contains, inset } from "./measure";
export type { BubbleProps, ThreadProps } from "./messages";
export { Bubble, Receipt, Stamp, Thread } from "./messages";
export type {
	ConnectorProps,
	CountProps,
	FlyProps,
	FollowProps,
	PopoverOrigin,
} from "./motion";
// Motion: behaviors that have to hold up frame by frame (motion/, one file per part)
export {
	Camera,
	Collapse,
	Connector,
	Count,
	cellOf,
	Expand,
	Fly,
	Follow,
	Popover,
	Roll,
	Scroll,
	States,
	Stream,
	Swap,
} from "./motion";
export type {
	AvatarProps,
	BrandMarkProps,
	IconName,
	PinProps,
	RowProps,
} from "./parts";
// Small parts: starting points with quiet defaults; restyle them as the product does (parts/, controls/)
export {
	Avatar,
	BrandMark,
	Check,
	Chip,
	Facepile,
	Icon,
	Menu,
	Meter,
	Pin,
	Row,
	Spinner,
	Toast,
	Tooltip,
} from "./parts";
export type {
	LockScreenProps,
	NotificationProps,
	PhoneFrame,
	PhoneProps,
} from "./phone";
export { LockScreen, Notification, Phone, WALLPAPER } from "./phone";
export { useReducedMotion } from "./reduced-motion";
export type { LookTokens, Play, StageProps } from "./stage";
// The stage: the canvas, the script, the cursor, measuring and playback
export { Stage } from "./stage";
export type { BarProps, PromptProps, TextProps, WindowProps } from "./window";
// Frames: windows, devices and system surfaces, from real geometry
export { Bar, Caret, Prompt, Text, Window } from "./window";
