import PostClient from "./PostClient";
import { WPPost } from "@/types/wp";

interface Props {
	params: { slug: string };
}

// fetch пост по slug
async function fetchPost(slug: string): Promise<WPPost | null> {
	const res = await fetch(
		`https://chest4.tmweb.ru/wp-json/wp/v2/posts?slug=${slug}&_embed&_yoast_head_json=true`,
		{ next: { revalidate: 60 } } // ISR 60 секунд
	);
	const data: WPPost[] = await res.json();
	return data.length > 0 ? data[0] : null;
}

// fetch все посты по категории для похожих постов
async function fetchRelatedPosts(categoryId: number, currentPostId: number): Promise<WPPost[]> {
	const res = await fetch(
		`https://chest4.tmweb.ru/wp-json/wp/v2/posts?_embed&_yoast_head_json=true&categories=${categoryId}&per_page=10`,
		{ next: { revalidate: 60 } }
	);
	if (!res.ok) return [];
	const posts: WPPost[] = await res.json();
	// исключаем текущий пост
	const filtered = posts.filter((p) => p.id !== currentPostId);
	// случайно перемешиваем и берём 2
	return filtered.sort(() => Math.random() - 0.5).slice(0, 2);
}

// ---------- METADATA FOR SEO ----------
export async function generateMetadata({ params }: Props) {
	const post = await fetchPost(params.slug);
	if (!post) return {};

	return {
		title: post.yoast_head_json?.title || post.title.rendered,
		description:
			post.yoast_head_json?.description ||
			post.excerpt.rendered.replace(/<\/?[^>]+(>|$)/g, ""),
	};
}

// ---------- SERVER COMPONENT ----------
export default async function Page({ params }: Props) {
	const post = await fetchPost(params.slug);
	if (!post) return <p>Пост не найден</p>;

	let relatedPosts: WPPost[] = [];
	if (post.categories && post.categories.length > 0) {
		relatedPosts = await fetchRelatedPosts(post.categories[0], post.id);
	}

	return <PostClient post={post} related={relatedPosts} />;
}
