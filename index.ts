export class FlushableQueue {
  private queue: any[] = [];
  private interval: NodeJS.Timeout | null = null;
  private flushInterval?: number;
  private flushSize?: number;
  private cb: Function;

  constructor(
    cb: Function,
    options?: { flushTimeout?: number; flushSize?: number }
  ) {
    this.cb = cb;

    this.flushInterval = options?.flushTimeout ?? undefined;
    this.flushSize = options?.flushSize ?? undefined;

    if (this.flushInterval) {
      this.interval = setInterval(async () => {
        await this.flush();
      }, this.flushInterval);
    }
  }

  enqueue(item: any) {
    this.queue.push(item);
    if (this.flushSize && this.queue.length >= this.flushSize) {
      this.flush();
    }
  }

  async flush() {
    if (this.queue.length > 0) {
      const itemsToProcess = this.queue.splice(0);
      await this.cb(itemsToProcess);
    }
  }

  async stop() {
    await this.flush();
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
