import WorkerPool from "./pool";
import { RendererOptions, RenderPayload } from "./types/types";

export class GifRenderer {
	private pool: WorkerPool;

	constructor(options: RendererOptions) {
		this.pool = new WorkerPool({
			size: options.workers ?? 2,
			background: options.background,
			delay: options.delay ?? 200,
		});
	}

	render<T>(payload: RenderPayload<T>): Promise<Buffer> {
		return this.pool.exec(payload);
	}

	async close() {
		await this.pool.destroy();
	}
}
