import { createServerFn } from "@tanstack/react-start";
import * as repo from "@/lib/server/repo.server";
import { requireAdmin } from "@/lib/server/session";

export type ListConfig = {
  table: string;
  orderBy?: { column: string; ascending?: boolean };
  searchField?: string;
};

export const cmsList = createServerFn({ method: "GET" })
  .validator((d: any) => ({ config: d.config as ListConfig, search: d.search as string | undefined }))
  .handler(async ({ data }) => {
    requireAdmin();
    return repo.listTableRows(data.config.table, {
      orderBy: data.config.orderBy,
      searchField: data.config.searchField,
      search: data.search,
    });
  });

export const cmsInsert = createServerFn({ method: "POST" })
  .validator((d: any) => ({ table: d.table as string, payload: d.payload as Record<string, any> }))
  .handler(async ({ data }) => {
    requireAdmin();
    repo.insertRow(data.table, data.payload);
    return { ok: true };
  });

export const cmsUpdate = createServerFn({ method: "POST" })
  .validator((d: any) => ({ table: d.table as string, id: d.id as string, payload: d.payload as Record<string, any> }))
  .handler(async ({ data }) => {
    requireAdmin();
    repo.updateRow(data.table, data.id, data.payload);
    return { ok: true };
  });

export const cmsDelete = createServerFn({ method: "POST" })
  .validator((d: any) => ({ table: d.table as string, id: d.id as string }))
  .handler(async ({ data }) => {
    requireAdmin();
    repo.deleteRow(data.table, data.id);
    return { ok: true };
  });

export const cmsOptions = createServerFn({ method: "GET" })
  .validator((d: any) => ({ table: d.table as string, labelField: d.labelField as string }))
  .handler(async ({ data }) => {
    requireAdmin();
    return repo.listOptions(data.table, data.labelField);
  });

export const cmsCount = createServerFn({ method: "GET" })
  .validator((d: any) => ({ table: d.table as string, filter: d.filter as Record<string, any> | undefined }))
  .handler(async ({ data }) => {
    requireAdmin();
    return repo.countRows(data.table, data.filter);
  });
