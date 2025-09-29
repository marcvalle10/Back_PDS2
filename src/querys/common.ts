import { DataSource, EntityTarget, Repository, ObjectLiteral } from 'typeorm';

export const repo = <T extends ObjectLiteral>(
  ds: DataSource,
  entity: EntityTarget<T>
): Repository<T> => ds.getRepository<T>(entity);

// Helper utilitario
export const toStr = (v: unknown) =>
  v === null || v === undefined ? null : String(v);
