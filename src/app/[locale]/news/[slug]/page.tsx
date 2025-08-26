import { notFound } from "next/navigation";
import PostClient from "./PostClient";
import { WPPost } from "@/types/wp";

export const revalidate = 60;

async function fetchPost(slug: string): Promise<WPPost | null> {
	const res = await fetch(
		`https://chest4.tmweb.ru/wp-json/wp/v2/posts?slug=${slug}&_embed&_yoast_head_json=true`,
		{ next: { revalidate } }
	);
	if (!res.ok) return null;
	const data: WPPost[] = await res.json();
	return data.length > 0 ? data[0] : null;
}

async function fetchPosts(): Promise<WPPost[]> {
	const res = await fetch(
		"https://chest4.tmweb.ru/wp-json/wp/v2/posts?_embed&_yoast_head_json=true",
		{ next: { revalidate } }
	);
	if (!res.ok) return [];
	return res.json();
}

async function getData(slug: string) {
	const [post, allPosts] = await Promise.all([
		fetchPost(slug),
		fetchPosts(),
	]);

	if (!post) return null;

	const categoryId = post.categories?.[0];
	const related = allPosts
		.filter((p) => p.id !== post.id && p.categories.includes(categoryId))
		.sort(() => 0.5 - Math.random())
		.slice(0, 2);

	return { post, related };
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
	const post = await fetchPost(params.slug);
	if (!post) return {};

	return {
		title: post.yoast_head_json?.title || post.title.rendered,
		description:
			post.yoast_head_json?.description ||
			post.excerpt.rendered.replace(/<\/?[^>]+(>|$)/g, ""),
	};
}

export default async function Page({ params }: { params: { slug: string } }) {
	const data = await getData(params.slug);
	if (!data) return notFound(); // ⬅️ если поста нет — 404

	return <PostClient post={data.post} related={data.related} />;
}
