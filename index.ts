export class FlushableQueue {
  private queue: any[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private flushTimeout: number;
  private flushSize: number;
  private cb: Function;
  private enqueuedCount: number;
  private flushedCount: number;

  constructor(
    cb: Function,
    options?: { flushTimeout?: number; flushSize?: number }
  ) {
    this.cb = cb;

    this.flushTimeout = options?.flushTimeout ?? 5000;
    this.flushSize = options?.flushSize ?? 5000;
    this.enqueuedCount = 0;
    this.flushedCount = 0;
    this.flushInterval = setInterval(async () => {
      await this.flush();
    }, this.flushTimeout);
  }

  async enqueue(item: any) {
    this.queue.push(item);
    this.enqueuedCount += 1;
    if (this.queue.length >= this.flushSize) {
      await this.flush();
    }
  }

  async flush() {
    if (this.queue.length) {
      const itemsToProcess = this.queue.splice(0);
      await this.cb(itemsToProcess);
      this.flushedCount += itemsToProcess.length;
    }
  }

  async stop() {
    await this.flush();
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }
}
