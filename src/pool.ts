import { Worker } from "worker_threads";
import path from "path";
import { RenderPayload } from "./types/types";

interface Job {
	payload: RenderPayload;
	resolve: (buf: Buffer) => void;
	reject: (err: Error) => void;
}

type PoolWorker = Worker & {
	busy: boolean;
	job?: Job;
};
export default class WorkerPool {
	private workers: PoolWorker[] = [];
	private queue: Job[] = [];

	constructor(private options: { size: number; background: string; delay: number }) {
		for (let i = 0; i < options.size; i++) {
			this.workers.push(this.spawn());
		}
	}

	private spawn(): PoolWorker {
		const worker = new Worker(path.join(__dirname, "worker.js"), {
			workerData: {
				background: this.options.background,
				delay: this.options.delay,
			},
		}) as PoolWorker;

		worker.busy = false;

		worker.on("message", (res) => {
			worker.busy = false;
			const job = worker.job;
			worker.job = undefined;

			if (!job) return;

			if (!res.ok) return job.reject(new Error(res.error));

			job.resolve(Buffer.from(res.buffer));
			this.dequeue();
		});

		return worker;
	}

	exec(payload: RenderPayload): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			this.queue.push({ payload, resolve, reject });
			this.dequeue();
		});
	}

	private dequeue() {
		const idle = this.workers.find((w) => !w.busy);
		if (!idle) return;

		const job = this.queue.shift();
		if (!job) return;

		idle.busy = true;
		idle.job = job;
		idle.postMessage(job.payload);
	}

	async destroy() {
		await Promise.all(this.workers.map((w) => w.terminate()));
	}
}
