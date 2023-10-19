import { PostMetadata } from "./PostMetadata";
import NavigationLink from './NavigationLink';

const PostPreview = (props: PostMetadata) => {
	return <>
		<li className="flex flex-col mb-10 p-5 bg-slate-200 rounded-xl">
			<NavigationLink href={`/posts/${props.slug}`}>
				<h3>{props.title}</h3>
			</NavigationLink>
			<p className="mb-4 text-slate-400">{props.date}</p>
			<p className="italic text-slate-600">{props.excerpt}</p>
		</li>
	</>
};

export default PostPreview;