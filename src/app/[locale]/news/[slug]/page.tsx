import PostClient from "./PostClient";
import { WPPost } from "@/types/wp";

interface Props {
	params: { slug: string };
}

async function getPost(slug: string): Promise<WPPost | null> {
	const res = await fetch(
		`https://chest4.tmweb.ru/wp-json/wp/v2/posts?slug=${slug}&_embed&_yoast_head_json=true`,
		{ next: { revalidate: 60 } } // ISR 60 сек
	);

	if (!res.ok) return null;
	const data: WPPost[] = await res.json();
	return data.length ? data[0] : null;
}

async function getRelatedPosts(currentPost: WPPost): Promise<WPPost[]> {
	if (!currentPost.categories?.length) return [];

	const res = await fetch(
		`https://chest4.tmweb.ru/wp-json/wp/v2/posts?categories=${currentPost.categories[0]}&_embed&_yoast_head_json=true`,
		{ next: { revalidate: 60 } }
	);

	if (!res.ok) return [];
	const posts: WPPost[] = await res.json();

	// убираем текущий пост и берём только 2
	return posts.filter((p) => p.id !== currentPost.id).slice(0, 2);
}

// ---------- METADATA ----------
export async function generateMetadata({ params }: Props) {
	const post = await getPost(params.slug);
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
	const post = await getPost(params.slug);
	if (!post) return <div>Пост не найден</div>;

	const related = await getRelatedPosts(post);

	return <PostClient post={post} related={related} />;
}
