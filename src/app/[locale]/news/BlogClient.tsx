"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { WPPost, WPCategory } from "@/types/wp";
import SkeletonPost from "@/components/SkeletonPost";

// Фетч постов
async function fetchPosts(page: number, perPage: number, category?: number): Promise<WPPost[]> {
	const url = new URL("https://chest4.tmweb.ru/wp-json/wp/v2/posts");
	url.searchParams.set("_embed", "");
	url.searchParams.set("per_page", String(perPage));
	url.searchParams.set("page", String(page));
	if (category) url.searchParams.set("categories", String(category));

	const res = await fetch(url.toString(), { cache: "no-store" });
	if (!res.ok) return [];
	return res.json();
}

type Props = {
	initialPosts: WPPost[];
	categories: WPCategory[];
};

export default function BlogClient({ initialPosts, categories }: Props) {
	const locale = useLocale();
	const perPage = 4;

	const [posts, setPosts] = useState<WPPost[]>(initialPosts);
	const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(initialPosts.length === perPage);

	// Локальный кеш категорий
	const [cache, setCache] = useState<Record<string, WPPost[]>>({ all: initialPosts });

	// Функция загрузки постов (с проверкой кеша)
	const loadPosts = async (category: number | "all") => {
		const key = category === "all" ? "all" : category.toString();

		// если есть кеш → мгновенно отображаем
		if (cache[key]) {
			setPosts(cache[key]);
			setHasMore(cache[key].length === perPage);
			setPage(1);
			setSelectedCategory(category);
			return;
		}

		setLoading(true);
		setPage(1);
		const newPosts = await fetchPosts(1, perPage, category === "all" ? undefined : category);
		setCache((prev) => ({ ...prev, [key]: newPosts }));
		setPosts(newPosts);
		setHasMore(newPosts.length === perPage);
		setSelectedCategory(category);
		setLoading(false);
	};

	// Подгрузка следующей страницы
	const loadMore = async () => {
		if (loadingMore) return;
		setLoadingMore(true);
		const nextPage = page + 1;
		const key = selectedCategory === "all" ? "all" : selectedCategory.toString();
		const newPosts = await fetchPosts(nextPage, perPage, selectedCategory === "all" ? undefined : selectedCategory);
		setPosts((prev) => [...prev, ...newPosts]);
		setCache((prev) => ({ ...prev, [key]: [...(prev[key] || []), ...newPosts] }));
		setPage(nextPage);
		if (newPosts.length < perPage) setHasMore(false);
		setLoadingMore(false);
	};

	// Prefetch остальных категорий после рендера
	useEffect(() => {
		categories.forEach((cat) => {
			const key = cat.id.toString();
			if (!cache[key]) {
				fetchPosts(1, perPage, cat.id).then((data) => {
					setCache((prev) => ({ ...prev, [key]: data }));
				});
			}
		});
	}, [categories]);

	return (
		<main className="w-full max-w-4xl mx-auto py-12 px-4">
			<h1 className="text-4xl font-bold mb-8">Блог</h1>

			{/* Кнопки категорий */}
			<div className="flex flex-wrap gap-2 mb-8">
				<button
					onClick={() => loadPosts("all")}
					className={`px-4 py-2 rounded-full ${selectedCategory === "all" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
				>
					Все
				</button>
				{categories.map((cat) => (
					<button
						key={cat.id}
						onClick={() => loadPosts(cat.id)}
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
								<div className="prose" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
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
