import Image from "next/image";
import { type BlogPost, COVER_PHOTOS } from "../posts";
import s from "./blog.module.css";

/** First sentence, for the "agent reply" bubble. */
function firstSentence(text: string) {
	const m = text.match(/^.*?[.!?](\s|$)/);
	return (m ? m[0] : text).trim();
}

/**
 * Cover: a homepage nature photo with the post's category and a real
 * question + answer from its FAQ as a chat.
 */
export function PostCover({
	post,
	className = "",
}: {
	post: BlogPost;
	className?: string;
}) {
	const faq = post.faq[0];
	return (
		<div className={`${s.cover} ${className}`} aria-hidden="true">
			<Image
				src={COVER_PHOTOS[post.cover].src}
				alt=""
				fill
				sizes="(max-width: 1050px) 100vw, 1180px"
				className={s.coverImg}
			/>
			<span className={s.coverTag}>{post.category}</span>
			{faq ? (
				<>
					<span className={`${s.bubble} ${s.bubbleUser}`}>{faq.question}</span>
					<span className={`${s.bubble} ${s.bubbleBot}`}>
						{firstSentence(faq.answer)}
					</span>
				</>
			) : null}
		</div>
	);
}
