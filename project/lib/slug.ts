import { nanoid } from "nanoid";
import slugify from "slugify";

export function generateWorkspaceSlug() {
	return nanoid(8);
}

export function generateProjectSlug(name: string) {
	const baseSlug = slugify(name, {
		lower: true,
		strict: true,
	});

	return `${baseSlug}-${nanoid(6)}`;
}
