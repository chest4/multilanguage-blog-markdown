"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import { WPPost } from "@/types/wp";
import SkeletonPost from "@/components/SkeletonPost";

async function fetchPost(slug: string): Promise<WPPost | null> {
	const res = await fetch(
		`https://chest4.tmweb.ru/wp-json/wp/v2/posts?slug=${slug}&_embed&_yoast_head_json=true`,
		{ cache: "no-store" }
	);
	if (!res.ok) return null;
	const data: WPPost[] = await res.json();
	return data.length > 0 ? data[0] : null;
}

async function fetchPosts(): Promise<WPPost[]> {
	const res = await fetch(
		"https://chest4.tmweb.ru/wp-json/wp/v2/posts?_embed&_yoast_head_json=true",
		{ cache: "no-store" }
	);
	if (!res.ok) return [];
	return res.json();
}

export default function PostPage() {
	const { slug } = useParams<{ slug: string }>();
	const locale = useLocale();

	const [post, setPost] = useState<WPPost | null>(null);
	const [allPosts, setAllPosts] = useState<WPPost[]>([]);
	const [loading, setLoading] = useState(true);
	const [relatedPosts, setRelatedPosts] = useState<WPPost[]>([]);

	useEffect(() => {
		if (!slug) return;

		Promise.all([fetchPost(slug), fetchPosts()]).then(([data, posts]) => {
			setPost(data);
			setAllPosts(posts);

			if (data) {
				const categoryId = data.categories[0]; // берем первую категорию
				const filtered = posts.filter(
					(p) => p.id !== data.id && p.categories.includes(categoryId)
				);
				// выбираем 2 случайных поста
				const shuffled = filtered.sort(() => 0.5 - Math.random()).slice(0, 2);
				setRelatedPosts(shuffled);
			}

			setLoading(false);
		});
	}, [slug]);

	if (loading) {
		return (
			<main className="max-w-4xl mx-auto py-12 px-4">
				<SkeletonPost />
			</main>
		);
	}

	if (!post) {
		return (
			<main className="max-w-4xl mx-auto py-12 px-4">
				<p>Пост не найден.</p>
				<Link href={`/${locale}/blog`} className="text-blue-600 hover:underline">
					Назад в блог
				</Link>
			</main>
		);
	}

	const image =
		(post as any)._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
		"/default.jpg";

	return (
		<main className="max-w-4xl mx-auto py-12 px-4">
			<img
				src={image}
				alt={post.title.rendered}
				className="w-full h-72 object-cover rounded-lg mb-6"
			/>
			<h1 className="text-4xl font-bold mb-4">{post.title.rendered}</h1>
			<div
				className="prose"
				dangerouslySetInnerHTML={{ __html: post.content.rendered }}
			/>

			{/* Ссылка назад */}
			<div className="mt-8 mb-12">
				<Link href={`/${locale}/blog`} className="text-blue-600 hover:underline">
					← Назад в блог
				</Link>
			</div>

			{/* Похожие посты */}
			{relatedPosts.length > 0 && (
				<section className="mt-12">
					<h2 className="text-2xl font-bold mb-6">Похожие посты</h2>
					<div className="grid grid-cols-2 gap-6">
						{relatedPosts.map((p) => {
							const img =
								(p as any)._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
								"/default.jpg";
							return (
								<article key={p.id} className="border rounded-lg overflow-hidden">
									<Link href={`/${locale}/blog/${p.slug}`}>
										<img
											src={img}
											alt={p.title.rendered}
											className="w-full h-48 object-cover"
										/>
										<h3 className="p-4 text-lg font-semibold">{p.title.rendered}</h3>
									</Link>
								</article>
							);
						})}
					</div>
				</section>
			)}
		</main>
	);
}
