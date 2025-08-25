"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { WPPost, WPCategory } from "@/types/wp";
import SkeletonPost from "@/components/SkeletonPost";
import Image from "next/image";

async function fetchPosts(page: number, perPage: number, category?: number): Promise<WPPost[]> {
	const url = new URL("https://chest4.tmweb.ru/wp-json/wp/v2/posts");
	url.searchParams.set("_embed", "");
	url.searchParams.set("per_page", String(perPage));
	url.searchParams.set("page", String(page));
	if (category) url.searchParams.set("categories", String(category));

	const res = await fetch(url.toString(), { cache: "no-store" });
	if (!res.ok) throw new Error("Ошибка загрузки постов");
	return res.json();
}

async function fetchCategories(): Promise<WPCategory[]> {
	const res = await fetch("https://chest4.tmweb.ru/wp-json/wp/v2/categories?hide_empty=true", {
		cache: "no-store",
	});
	if (!res.ok) throw new Error("Ошибка загрузки категорий");
	return res.json();
}

export default function BlogPage() {
	const [posts, setPosts] = useState<WPPost[]>([]);
	const [categories, setCategories] = useState<WPCategory[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	const perPage = 4;
	const locale = useLocale();

	// загружаем категории при первом рендере
	useEffect(() => {
		fetchCategories().then(setCategories).catch(console.error);
	}, []);

	// загружаем посты (сброс при смене категории)
	useEffect(() => {
		setLoading(true);
		setPage(1);
		fetchPosts(1, perPage, selectedCategory === "all" ? undefined : selectedCategory)
			.then((data) => {
				setPosts(data);
				setHasMore(data.length === perPage);
			})
			.finally(() => setLoading(false));
	}, [selectedCategory]);

	const loadMore = async () => {
		if (loadingMore) return;
		setLoadingMore(true);
		const nextPage = page + 1;
		try {
			const newPosts = await fetchPosts(nextPage, perPage, selectedCategory === "all" ? undefined : selectedCategory);
			setPosts((prev) => [...prev, ...newPosts]);
			setPage(nextPage);
			if (newPosts.length < perPage) setHasMore(false);
		} catch (err) {
			console.error(err);
		} finally {
			setLoadingMore(false);
		}
	};

	return (
		<main className="w-full max-w-4xl mx-auto py-12 px-4">
			<h1 className="text-4xl font-bold mb-8">Блог</h1>

			{/* Кнопки категорий */}
			<div className="flex flex-wrap gap-2 mb-8">
				<button
					onClick={() => setSelectedCategory("all")}
					className={`px-4 py-2 rounded-full ${selectedCategory === "all" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
				>
					Все
				</button>
				{categories.map((cat) => (
					<button
						key={cat.id}
						onClick={() => setSelectedCategory(cat.id)}
						className={`px-4 py-2 rounded-full ${selectedCategory === cat.id ? "bg-blue-600 text-white" : "bg-gray-200"}`}
					>
						{cat.name}
					</button>
				))}
			</div>

			{/* Посты */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
				{loading
					? Array.from({ length: perPage }).map((_, i) => <SkeletonPost key={i} />)
					: posts.map((post) => {
						const image = (post as any)._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/default.jpg";

						return (
							<article key={post.id} className="border-b pb-6">
								<div className="w-full h-64 relative mb-4">
									<Image
										src={image}
										alt={post.title.rendered}
										fill
										sizes="(max-width: 768px) 100vw, 50vw"
										className="object-cover rounded-lg"
									/>
								</div>
								<h2 className="text-2xl font-semibold mb-2">
									<Link href={`/${locale}/news/${post.slug}`} className="text-blue-600 hover:underline">
										{post.title.rendered}
									</Link>
								</h2>
								<div
									className="prose"
									dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
								/>
							</article>
						);
					})}
			</div>

			{/* Кнопка "Показать ещё" */}
			{!loading && hasMore && (
				<div className="flex justify-center mt-8">
					<button
						onClick={loadMore}
						disabled={loadingMore}
						className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
					>
						{loadingMore ? "Загрузка..." : "Показать ещё"}
					</button>
				</div>
			)}
		</main>
	);
}
