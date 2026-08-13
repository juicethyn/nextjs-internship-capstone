import { nanoid } from "nanoid";

export function generateWorkspaceSlug() {
	return nanoid(8);
}

export function generateProjectSlug() {
	return `p-${nanoid(6)}`;
}
