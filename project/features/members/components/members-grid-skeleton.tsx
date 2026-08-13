import { MemberCardSkeleton } from "./member-card-skeleton";

const PLACEHOLDERS = ["a", "b", "c", "d", "e", "f"];

export function MembersGridSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
			{PLACEHOLDERS.map((id) => (
				<MemberCardSkeleton key={id} />
			))}
		</div>
	);
}
