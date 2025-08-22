import getPostMetadata from "@/components/getPostMetadata";
import RandomPreviews from "@/components/RandomPreviews";
import PageLayout from '@/components/PageLayout';


export default function RandomStates() {

	const postMetadata = getPostMetadata();

	const postRandom = postMetadata.sort(() => Math.random() - 0.5);

	const postPreviews = postRandom.slice(0, 2).map((post) => (
		<RandomPreviews key={post.slug} {...post} />
	));

	return (
		<PageLayout title="Blog">
			<ul className="grid grid-cols-2 gap-5">
				{postPreviews}
			</ul>
		</PageLayout>
	)
}
