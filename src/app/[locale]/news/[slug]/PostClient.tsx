"use client";

import Link from "next/link";
import Image from "next/image";
import { WPPost } from "@/types/wp";

interface Props {
	post: WPPost;
	related: WPPost[];
}

export default function PostClient({ post, related }: Props) {
	const image = (post as any)._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/default.jpg";

	return (
		<main className="w-full max-w-4xl mx-auto py-12 px-4">
			{/* Основной пост */}
			<div className="w-full h-72 object-cover rounded-lg mb-6 relative">
				<Image src={image} alt={post.title.rendered} fill className="object-cover" />
			</div>

			<h1 className="text-4xl font-bold mb-4">{post.title.rendered}</h1>
			<div className="prose" dangerouslySetInnerHTML={{ __html: post.content.rendered }} />

			<div className="mt-8 mb-12">
				<Link href="/news" className="text-blue-600 hover:underline">
					← Назад в блог
				</Link>
			</div>

			{/* Похожие посты */}
			{related.length > 0 && (
				<section className="mt-12">
					<h2 className="text-2xl font-bold mb-6">Похожие посты</h2>
					<div className="grid grid-cols-2 gap-6">
						{related.map((p) => {
							const img = (p as any)._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/default.jpg";
							return (
								<article key={p.id} className="border rounded-lg overflow-hidden">
									<Link href={`/news/${p.slug}`}>
										<img src={img} alt={p.title.rendered} className="w-full h-48 object-cover" />
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
