"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WPPost, WPCategory } from "@/types/wp";
import SkeletonPost from "@/components/SkeletonPost";

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

	return (
		<main className="w-full max-w-4xl mx-auto py-12 px-4">
			<h1 className="text-4xl font-bold mb-8">Блог</h1>

			{/* Кнопки категорий */}
			{!loading && (
				<div className="flex flex-wrap gap-2 mb-8">
					<button
						onClick={() => setSelectedCategory("all")}
						className={`px-4 py-2 rounded-full ${selectedCategory === "all" ? "bg-blue-600 text-white" : "bg-gray-200"
							}`}
					>
						Все
					</button>
					{categories.map((cat) => (
						<button
							key={cat.id}
							onClick={() => setSelectedCategory(cat.id)}
							className={`px-4 py-2 rounded-full ${selectedCategory === cat.id ? "bg-blue-600 text-white" : "bg-gray-200"
								}`}
						>
							{cat.name}
						</button>
					))}
				</div>
			)}

			{/* Посты */}
			<div className="space-y-8 grid grid-cols-2 gap-4">
				{loading
					? Array.from({ length: 6 }).map((_, i) => <SkeletonPost key={i} />) // показываем 3 скелетона
					: filteredPosts.map((post) => {
						const image =
							(post as any)._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? "/default.jpg";;

						return (
							<article key={post.id} className="border-b pb-6">
								{image && (
									<img
										src={image}
										alt={post.title.rendered}
										className="w-full h-64 object-cover rounded-lg mb-4"
									/>
								)}
								<h2 className="text-2xl font-semibold mb-2">
									<Link
										href={`/blog/${post.slug}`}
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
		</main>
	);
}
