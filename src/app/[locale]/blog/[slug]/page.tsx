import PostClient from "./PostClient";
import { WPPost } from "@/types/wp";

interface Props {
  params: { slug: string };
}

// ---------- METADATA FOR SEO ----------
export async function generateMetadata({ params }: Props) {
  const res = await fetch(
    `https://chest4.tmweb.ru/wp-json/wp/v2/posts?slug=${params.slug}&_embed&_yoast_head_json=true`,
    { cache: "no-store" }
  );
  const data: WPPost[] = await res.json();
  if (!data || data.length === 0) return {};

  const post = data[0];

  return {
    title: post.yoast_head_json?.title || post.title.rendered,
    description:
      post.yoast_head_json?.description ||
      post.excerpt.rendered.replace(/<\/?[^>]+(>|$)/g, ""),
  };
}

// ---------- SERVER COMPONENT ----------
export default function Page({ params }: Props) {
  return <PostClient slug={params.slug} />;
}
