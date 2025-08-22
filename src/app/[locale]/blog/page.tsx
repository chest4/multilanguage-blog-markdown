"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { WPPost, WPCategory } from "@/types/wp";
import SkeletonPost from "@/components/SkeletonPost";
import Image from "next/image";

async function fetchPosts(): Promise<WPPost[]> {
	const res = await fetch(
		"https://chest4.tmweb.ru/wp-json/wp/v2/posts?_embed&_yoast_head_json=true",
		{ cache: "no-store" }
	);
	if (!res.ok) throw new Error("Ошибка загрузки постов");
	return res.json();
}

async function fetchCategories(): Promise<WPCategory[]> {
	const res = await fetch("https://chest4.tmweb.ru/wp-json/wp/v2/categories", {
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
	const [visibleCount, setVisibleCount] = useState(4); // 👈 сколько постов показываем

	const locale = useLocale();

	useEffect(() => {
		Promise.all([fetchPosts(), fetchCategories()]).then(([posts, cats]) => {
			setPosts(posts);

			const usedCategoryIds = new Set(posts.flatMap((p) => p.categories));
			const filteredCats = cats.filter((cat) => usedCategoryIds.has(cat.id));
			setCategories(filteredCats);

			setLoading(false);
		});
	}, []);

	const filteredPosts =
		selectedCategory === "all"
			? posts
			: posts.filter((post) => post.categories.includes(selectedCategory as number));

	const visiblePosts = filteredPosts.slice(0, visibleCount); // 👈 только часть постов

	return (
		<main className="w-full max-w-4xl mx-auto py-12 px-4">
			<h1 className="text-4xl font-bold mb-8">Блог</h1>

			{/* Кнопки категорий */}
			{!loading && (
				<div className="flex flex-wrap gap-2 mb-8">
					<button
						onClick={() => {
							setSelectedCategory("all");
							setVisibleCount(4); // 👈 сбрасываем при смене категории
						}}
						className={`px-4 py-2 rounded-full ${selectedCategory === "all"
							? "bg-blue-600 text-white"
							: "bg-gray-200"
							}`}
					>
						Все
					</button>
					{categories.map((cat) => (
						<button
							key={cat.id}
							onClick={() => {
								setSelectedCategory(cat.id);
								setVisibleCount(4); // 👈 сбрасываем при смене категории
							}}
							className={`px-4 py-2 rounded-full ${selectedCategory === cat.id
								? "bg-blue-600 text-white"
								: "bg-gray-200"
								}`}
						>
							{cat.name}
						</button>
					))}
				</div>
			)}

			{/* Посты */}
			<div className="grid grid-cols-2 gap-6">
				{loading
					? Array.from({ length: 4 }).map((_, i) => <SkeletonPost key={i} />)
					: visiblePosts.map((post) => {
						const image =
							(post as any)._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
							"/default.jpg";

						return (
							<article key={post.id} className="border-b pb-6">
								<div className="w-full h-64 object-cover rounded-lg mb-4 relative">
									<Image
										src={image}
										alt={post.title.rendered}
										className="max-w-full object-cover"
										fill
									/>
								</div>
								<h2 className="text-2xl font-semibold mb-2">
									<Link
										href={`/${locale}/blog/${post.slug}`}
										className="text-blue-600 hover:underline"
									>
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
			{!loading && visibleCount < filteredPosts.length && (
				<div className="flex justify-center mt-8">
					<button
						onClick={() => setVisibleCount((prev) => prev + 4)}
						className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
					>
						Показать ещё
					</button>
				</div>
			)}
		</main>
	);
}
