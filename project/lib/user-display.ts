export type DisplayUser = {
	firstName: string;
	lastName: string;
	email: string;
};

export function memberDisplayName(user: DisplayUser) {
	const fullName = [user.firstName, user.lastName]
		.filter(Boolean)
		.join(" ")
		.trim();

	return fullName || user.email;
}

export function getInitials(firstName: string, lastName: string) {
	return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function filterMembersBySearch<T extends { user: DisplayUser }>(
	members: T[],
	search: string,
) {
	const term = search.trim().toLowerCase();

	if (!term) {
		return members;
	}

	return members.filter(
		(member) =>
			memberDisplayName(member.user).toLowerCase().includes(term) ||
			member.user.email.toLowerCase().includes(term),
	);
}
