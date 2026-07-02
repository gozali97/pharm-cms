import { createServerFn } from "@tanstack/react-start";
import * as repo from "@/lib/server/repo.server";

export const fetchSiteSettings = createServerFn({ method: "GET" }).handler(async () => repo.getSiteSettings());
export const fetchProductCategories = createServerFn({ method: "GET" }).handler(async () => repo.listProductCategories());
export const fetchFeaturedProducts = createServerFn({ method: "GET" }).validator((d: any) => ({ limit: Number(d?.limit ?? 8) })).handler(async ({ data }) => repo.listFeaturedProducts(data.limit));
export const fetchFeaturedServices = createServerFn({ method: "GET" }).validator((d: any) => ({ limit: Number(d?.limit ?? 6) })).handler(async ({ data }) => repo.listFeaturedServices(data.limit));
export const fetchActivePromotions = createServerFn({ method: "GET" }).handler(async () => repo.listActivePromotions());
export const fetchApprovedTestimonials = createServerFn({ method: "GET" }).handler(async () => repo.listApprovedTestimonials());
export const fetchRecentArticles = createServerFn({ method: "GET" }).validator((d: any) => ({ limit: Number(d?.limit ?? 3) })).handler(async ({ data }) => repo.listRecentArticles(data.limit));
export const fetchBranches = createServerFn({ method: "GET" }).handler(async () => repo.listBranches());
export const fetchTeam = createServerFn({ method: "GET" }).handler(async () => repo.listTeam());
export const fetchFAQs = createServerFn({ method: "GET" }).handler(async () => repo.listFaqs());
export const fetchProducts = createServerFn({ method: "GET" }).validator((d: any) => ({ category: d?.category, search: d?.search })).handler(async ({ data }) => repo.listProducts({ category: data.category, search: data.search }));
export const fetchProductBySlug = createServerFn({ method: "GET" }).validator((d: any) => ({ slug: String(d?.slug ?? "") })).handler(async ({ data }) => repo.getProductBySlug(data.slug));
export const fetchServices = createServerFn({ method: "GET" }).handler(async () => repo.listServices());
export const fetchArticles = createServerFn({ method: "GET" }).handler(async () => repo.listArticles());
export const fetchArticleBySlug = createServerFn({ method: "GET" }).validator((d: any) => ({ slug: String(d?.slug ?? "") })).handler(async ({ data }) => repo.getArticleBySlug(data.slug));
