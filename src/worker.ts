import { parentPort, workerData } from "worker_threads";
import { encodeGif } from "./encoder";

parentPort!.on("message", async (job) => {
	try {
		const { component, props, width, height } = job;

		const card = new component(width, height);

		for (const [k, v] of Object.entries(props || {})) {
			const fn = card[`set${k[0].toUpperCase()}${k.slice(1)}`];
			if (typeof fn === "function") fn.call(card, v);
		}

		const png = await card.build({ format: "png" });
		const gif = await encodeGif(png, workerData.background, workerData.delay);

		parentPort!.postMessage({ ok: true, buffer: gif }, [gif.buffer as ArrayBuffer]);
	} catch (e: any) {
		parentPort!.postMessage({ ok: false, error: e.message });
	}
});
