/* eslint-disable @typescript-eslint/no-explicit-any */
import TABLES from "@/infrastructures/supabase/tables";
import { createClient } from "../infrastructures/supabase/server";

export default class SupabaseService<Entity> {
  table: keyof typeof TABLES;

  constructor(table: keyof typeof TABLES) {
    this.table = table;
  }

  async create(requestData: Partial<Entity>): Promise<string> {
    const serverClient = await createClient();
    const { data, error } = await serverClient.from(this.table).insert(requestData).select("id");
    if (error) throw new Error(error.message);
    return data[0].id;
  }

  async readOne<K extends keyof Entity>(query: Record<K, Entity[K]>, selector?: (keyof Entity)[]): Promise<Entity> {
    const serverClient = await createClient();
    const selectorArray = selector ? selector.join(", ") : "*";
    let querySnapshot = serverClient.from(this.table).select(selectorArray);
    for (const key in query) {
      querySnapshot = querySnapshot.eq(key, query[key] as any);
    }
    const { data, error } = await querySnapshot;
    if (error) throw new Error(error.message);
    return data[0] as Entity;
  }

  async readAll<K extends keyof Entity>(query: Record<K, Entity[K]>, selector?: (keyof Entity)[]): Promise<Entity[]> {
    const serverClient = await createClient();
    const selectorArray = selector ? selector.join(", ") : "*";
    let querySnapshot = serverClient.from(this.table).select(selectorArray);
    for (const key in query) {
      querySnapshot = querySnapshot.eq(key, query[key] as any);
    }
    const { data, error } = await querySnapshot;
    if (error) throw new Error(error.message);
    return data as Entity[];
  }

  async readExcept<K extends keyof Entity>(query: Record<K, Entity[K]>, selector: K[]): Promise<Entity[]> {
    const serverClient = await createClient();
    const selectorArray = selector.join(", ");

    let querySnapshot = serverClient.from(this.table).select(selectorArray);
    for (const key in query) {
      querySnapshot = querySnapshot.neq(key, query[key] as any);
    }
    const { data, error } = await querySnapshot;
    if (error) throw new Error(error.message);
    return data as Entity[];
  }

  async readInclude<BaseKey extends keyof Entity, ColumnKey extends keyof Entity>(
    baseQuery: Record<BaseKey, Entity[BaseKey]>,
    query: string,
    columns: ColumnKey[],
    selector?: BaseKey[],
  ): Promise<Entity[]> {
    const serverClient = await createClient();
    const selectorArray = selector ? selector.join(", ") : "*";
    let querySnapshot = serverClient.from(this.table).select(selectorArray);

    for (const key in baseQuery) {
      querySnapshot = querySnapshot.eq(key, baseQuery[key as BaseKey] as any);
    }

    const ilikeString = columns.map((column) => `${String(column)}.ilike.%${query}%`).join(",");
    const { data, error } = await querySnapshot.or(ilikeString);

    if (error) throw new Error(error.message);
    return data as Entity[];
  }

  async update(id: string, requestData: Partial<Entity>) {
    const serverClient = await createClient();
    const { error } = await serverClient.from(this.table).update(requestData).eq("id", id);
    if (error) throw new Error(error.message);
  }

  async deleteByID(id: string): Promise<void> {
    const serverClient = await createClient();
    const { error } = await serverClient.from(this.table).delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async deleteAll<K extends keyof Entity>(query: Record<K, Entity[K]>): Promise<void> {
    const serverClient = await createClient();
    let querySnapshot = serverClient.from(this.table).delete();
    for (const key in query) {
      querySnapshot = querySnapshot.eq(key, query[key] as any);
    }
    const { error } = await querySnapshot;
    if (error) throw new Error(error.message);
  }

  async count<K extends keyof Entity>(query: Record<K, Entity[K]>): Promise<number> {
    const serverClient = await createClient();
    let querySnapshot = serverClient.from(this.table).select("id");
    for (const key in query) {
      querySnapshot = querySnapshot.eq(key, query[key] as any);
    }
    const { data, error } = await querySnapshot;
    if (error) throw new Error(error.message);
    return data.length;
  }

  async getSimilarVector(embedding: number[], rpc: string, match_count: number = 10, params: object) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc(rpc, {
      query_embedding: embedding,
      match_threshold: 0.78,
      match_count,
      ...params
    });
    if (error) {
      console.error(error);
      throw new Error(error.message);
    }
    return data;
  }
}