import { WPPost } from "@/types/wp";

async function fetchPost(slug: string): Promise<WPPost> {
	const res = await fetch(
		`https://chest4.tmweb.ru/wp-json/wp/v2/posts?slug=${slug}&_embed&_yoast_head_json=true`,
		{ cache: "no-store" }
	);
	const data: WPPost[] = await res.json();
	return data[0];
}

interface PostPageProps {
	params: { slug: string };
}

export async function generateMetadata({ params }: PostPageProps) {
	const post = await fetchPost(params.slug);

	return {
		title: post.yoast_head_json?.title || post.title.rendered,
		description: post.yoast_head_json?.description || post.excerpt.rendered,
	};
}

export default async function PostPage({ params }: PostPageProps) {
	const post = await fetchPost(params.slug);

	return (
		<main className="max-w-3xl mx-auto py-12 px-4">
			<h1 className="text-4xl font-bold mb-4">{post.title.rendered}</h1>
			<div
				className="prose"
				dangerouslySetInnerHTML={{ __html: post.content.rendered }}
			/>
		</main>
	);
}
