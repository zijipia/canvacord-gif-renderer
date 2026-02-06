declare module "gif-encoder-2" {
	export default class GIFEncoder {
		constructor(width: number, height: number, algorithm?: string);

		setDelay(delay: number): void;
		setRepeat(repeat: number): void;
		setQuality(quality: number): void;

		start(): void;
		addFrame(frame: Uint8Array | Buffer): void;
		finish(): void;

		out: {
			getData(): Uint8Array;
		};
	}
}
