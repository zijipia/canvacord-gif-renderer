export interface RenderPayload<T = any> {
	component: new (w: number, h: number) => any;
	props: T;
	width: number;
	height: number;
}

export interface RendererOptions {
	workers?: number;
	background: string;
	delay?: number;
}
