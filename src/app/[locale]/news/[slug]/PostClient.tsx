"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { WPPost } from "@/types/wp";
import SkeletonPost from "@/components/SkeletonPost";
import Image from "next/image";

interface Props {
	slug: string;

}

async function fetchPost(slug: string): Promise<WPPost | null> {
	const res = await fetch(
		`https://chest4.tmweb.ru/wp-json/wp/v2/posts?slug=${slug}&_embed&_yoast_head_json=true`,
		{ cache: "no-store" }
	);
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

export default function PostClient({ slug }: Props) {
	const locale = useLocale();

	const [post, setPost] = useState<WPPost | null>(null);
	const [allPosts, setAllPosts] = useState<WPPost[]>([]);
	const [relatedPosts, setRelatedPosts] = useState<WPPost[]>([]);
	const [loadingPost, setLoadingPost] = useState(true);
	const [loadingRelated, setLoadingRelated] = useState(true); // skeleton для похожих постов

	useEffect(() => {
		if (!slug) return;

		// сначала загружаем основной пост
		fetchPost(slug).then((data) => {
			setPost(data);
			setLoadingPost(false);

			if (data) {
				// после основного поста загружаем все посты, чтобы выбрать похожие
				fetchPosts().then((posts) => {
					setAllPosts(posts);

					const categoryId = data.categories[0];
					const filtered = posts.filter(
						(p) => p.id !== data.id && p.categories.includes(categoryId)
					);
					const shuffled = filtered.sort(() => 0.5 - Math.random()).slice(0, 2);
					setRelatedPosts(shuffled);
					setLoadingRelated(false); // skeleton исчезает
				});
			} else {
				setLoadingRelated(false); // нет поста → нет похожих
			}
		});
	}, [slug]);

	if (loadingPost) {
		return (
			<main className="w-full max-w-4xl mx-auto py-12 px-4">
				<SkeletonPost />
			</main>
		);
	}

	if (!post) {
		return (
			<main className="w-full max-w-4xl mx-auto py-12 px-4">
				<p>Пост не найден.</p>
				<Link href={`/${locale}/blog`} className="text-blue-600 hover:underline">
					Назад в блог
				</Link>
			</main>
		);
	}

	const image =
		(post as any)._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/default.jpg";

	return (
		<main className="w-full max-w-4xl mx-auto py-12 px-4">
			<div className="w-full h-72 object-cover rounded-lg mb-6 relative">
				<Image
					src={image}
					alt={post.title.rendered}
					fill
					className="max-w-full object-cover"
				/>
			</div>
			<h1 className="text-4xl font-bold mb-4">{post.title.rendered}</h1>
			<div
				className="prose"
				dangerouslySetInnerHTML={{ __html: post.content.rendered }}
			/>

			<div className="mt-8 mb-12">
				<Link href={`/${locale}/blog`} className="text-blue-600 hover:underline">
					← Назад в блог
				</Link>
			</div>

			{/* Похожие посты */}
			<section className="mt-12">
				<h2 className="text-2xl font-bold mb-6">Похожие посты</h2>

				{loadingRelated ? (
					<div className="grid grid-cols-2 gap-6">
						{Array.from({ length: 2 }).map((_, i) => (
							<SkeletonPost key={i} />
						))}
					</div>
				) : relatedPosts.length > 0 ? (
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
				) : (
					<p>Похожие посты не найдены.</p>
				)}
			</section>
		</main>
	);
}
