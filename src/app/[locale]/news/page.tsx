// app/[locale]/news/page.tsx

import BlogClient from "./BlogClient";
import { WPPost, WPCategory } from "@/types/wp";

async function getPosts(page = 1, perPage = 4, category?: number): Promise<WPPost[]> {
	const url = new URL("https://chest4.tmweb.ru/wp-json/wp/v2/posts");
	url.searchParams.set("_embed", "");
	url.searchParams.set("per_page", String(perPage));
	url.searchParams.set("page", String(page));
	if (category) url.searchParams.set("categories", String(category));

	const res = await fetch(url.toString(), { next: { revalidate: 60 } }); // ISR
	if (!res.ok) return [];
	return res.json();
}

async function getCategories(): Promise<WPCategory[]> {
	const res = await fetch("https://chest4.tmweb.ru/wp-json/wp/v2/categories?hide_empty=true", {
		next: { revalidate: 60 },
	});
	if (!res.ok) return [];
	return res.json();
}

export default async function BlogPage() {
	const [posts, categories] = await Promise.all([getPosts(1, 4), getCategories()]);

	return <BlogClient initialPosts={posts} categories={categories} />;
}
