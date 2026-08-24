type FeedComment = {
	id: string;
	createdAt: Date | string;
};

type FeedActivity = {
	id: string;
	createdAt: Date | string;
};

export type FeedEntry<TComment, TActivity> =
	| { kind: "comment"; id: string; createdAt: Date; comment: TComment }
	| { kind: "activity"; id: string; createdAt: Date; activity: TActivity };

function toDate(value: Date | string) {
	return value instanceof Date ? value : new Date(value);
}

export function mergeTaskFeed<
	TComment extends FeedComment,
	TActivity extends FeedActivity,
>(
	comments: TComment[],
	activity: TActivity[],
	showActivity: boolean,
): FeedEntry<TComment, TActivity>[] {
	const entries: FeedEntry<TComment, TActivity>[] = comments.map((comment) => ({
		kind: "comment",
		id: comment.id,
		createdAt: toDate(comment.createdAt),
		comment,
	}));

	if (showActivity) {
		for (const item of activity) {
			entries.push({
				kind: "activity",
				id: item.id,
				createdAt: toDate(item.createdAt),
				activity: item,
			});
		}
	}

	return entries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}
