import { nanoid } from "nanoid";
import slugify from "slugify";

export function generateSlug(name: string) {
	const baseSlug = slugify(name, {
		lower: true,
		strict: true,
	});

	return `${baseSlug}-${nanoid(6)}`;
}
