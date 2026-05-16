export interface DbAdapter {
  put(table: string, item: Record<string, unknown>): Promise<Record<string, unknown>>;
  get(table: string, key: Record<string, unknown>): Promise<Record<string, unknown> | null>;
  query(table: string, partialKey: Record<string, unknown>): Promise<Record<string, unknown>[]>;
  delete(table: string, key: Record<string, unknown>): Promise<void>;
}
