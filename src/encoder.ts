import fs from "fs";
import { GifReader } from "omggif";
import GIFEncoder from "gif-encoder-2";
import { Jimp } from "jimp";

export async function encodeGif(overlayBuffer: Buffer, background: string, delay: number): Promise<Buffer> {
	const overlay = await Jimp.read(overlayBuffer);
	const gifData = fs.readFileSync(background);
	const reader = new GifReader(gifData);

	const { width, height } = overlay;
	const encoder = new GIFEncoder(width, height, "octree");

	encoder.setDelay(delay);
	encoder.start();

	const frameData = new Uint8Array(reader.width * reader.height * 4);

	for (let i = 0; i < reader.numFrames(); i++) {
		reader.decodeAndBlitFrameRGBA(i, frameData);

		let frame = new Jimp({
			data: Buffer.from(frameData),
			width: reader.width,
			height: reader.height,
		});

		frame.resize({ w: width, h: height });
		frame.composite(overlay, 0, 0);

		encoder.addFrame(frame.bitmap.data);
	}

	encoder.finish();

	return Buffer.from(encoder.out.getData());
}
