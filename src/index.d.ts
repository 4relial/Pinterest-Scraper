export interface SearchOptions {
  path?: string;
  minAddPerLoop?: number;
  maxLoops?: number;
  idleWait?: number;
  scrollChunk?: number;
  headless?: boolean;
  userAgent?: string;
  viewport?: { width: number; height: number };
  locale?: string;
}

export function search(q: string, opts?: SearchOptions): Promise<string[]>;

declare const _default: typeof search;
export default _default;
