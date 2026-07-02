// Thin client wrappers — call server functions with matching signatures.
import {
  fetchSiteSettings as _settings,
  fetchProductCategories as _cats,
  fetchFeaturedProducts as _featuredProducts,
  fetchFeaturedServices as _featuredServices,
  fetchActivePromotions as _promos,
  fetchApprovedTestimonials as _testimonials,
  fetchRecentArticles as _recentArticles,
  fetchBranches as _branches,
  fetchProducts as _products,
  fetchProductBySlug as _productBySlug,
  fetchServices as _services,
  fetchArticles as _articles,
  fetchArticleBySlug as _articleBySlug,
  fetchTeam as _team,
  fetchFAQs as _faqs,
} from "@/lib/queries.functions";

export async function fetchSiteSettings() {
  return _settings();
}
export async function fetchProductCategories() {
  return _cats();
}
export async function fetchFeaturedProducts(limit = 8) {
  return _featuredProducts({ data: { limit } });
}
export async function fetchFeaturedServices(limit = 6) {
  return _featuredServices({ data: { limit } });
}
export async function fetchActivePromotions() {
  return _promos();
}
export async function fetchApprovedTestimonials() {
  return _testimonials();
}
export async function fetchRecentArticles(limit = 3) {
  return _recentArticles({ data: { limit } });
}
export async function fetchBranches() {
  return _branches();
}
export async function fetchProducts(opts: { category?: string; search?: string } = {}) {
  return _products({ data: opts });
}
export async function fetchProductBySlug(slug: string) {
  return _productBySlug({ data: { slug } });
}
export async function fetchServices() {
  return _services();
}
export async function fetchArticles() {
  return _articles();
}
export async function fetchArticleBySlug(slug: string) {
  return _articleBySlug({ data: { slug } });
}
export async function fetchTeam() {
  return _team();
}
export async function fetchFAQs() {
  return _faqs();
}
