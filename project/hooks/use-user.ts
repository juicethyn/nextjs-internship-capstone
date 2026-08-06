import { useUser } from "@clerk/nextjs";

export function useCurrentUser() {
	const { user, isLoaded } = useUser();

	return {
		user,
		email: user?.primaryEmailAddress?.emailAddress,
		isLoading: !isLoaded,
	};
}
