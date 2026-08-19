import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

type ClerkErrorDetails = {
	message: string;
	paramName?: string;
};

export function toClerkError(
	error: unknown,
	fallback: string,
): ClerkErrorDetails {
	if (!isClerkAPIResponseError(error)) {
		return { message: fallback };
	}

	const first = error.errors[0];

	if (!first) {
		return { message: fallback };
	}

	return {
		message: first.longMessage ?? first.message ?? fallback,
		paramName: first.meta?.paramName,
	};
}
