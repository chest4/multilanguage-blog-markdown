import getPostMetadata from "../../../components/getPostMetadata";
import PostPreview from "../../../components/PostPreview";
import PageLayout from '../../../components/PageLayout';


export default function Home() {
	const postMetadata = getPostMetadata();

	const postPreviews = postMetadata.map((post) => (
		<PostPreview key={post.slug} {...post} />
	));
	return (
		<PageLayout title="Blog">
			<ul className="grid grid-cols-2 gap-5">
				{postPreviews}
			</ul>
		</PageLayout>
	)
}
