"use client";

import { EditorContent, type JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
	content: JSONContent | null;
	onChange?: (value: JSONContent) => void;
	placeholder?: string;
};

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
	const editor = useEditor({
		extensions: [StarterKit],
		content: content ?? undefined,
		immediatelyRender: false,
		editorProps: {
			attributes: {
				class:
					"min-h-32 w-full max-w-none wrap-break-word px-3 py-2 text-sm outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1",
			},
		},
		onUpdate: ({ editor: instance }) => onChange?.(instance.getJSON()),
	});

	if (!editor) {
		return (
			<div
				className="min-h-40 rounded-lg border bg-background"
				aria-busy="true"
			/>
		);
	}

	const toolbar = [
		{
			label: "Bold",
			icon: Bold,
			isActive: editor.isActive("bold"),
			run: () => editor.chain().focus().toggleBold().run(),
		},
		{
			label: "Italic",
			icon: Italic,
			isActive: editor.isActive("italic"),
			run: () => editor.chain().focus().toggleItalic().run(),
		},
		{
			label: "Bullet list",
			icon: List,
			isActive: editor.isActive("bulletList"),
			run: () => editor.chain().focus().toggleBulletList().run(),
		},
		{
			label: "Numbered list",
			icon: ListOrdered,
			isActive: editor.isActive("orderedList"),
			run: () => editor.chain().focus().toggleOrderedList().run(),
		},
	];

	return (
		<div className="overflow-hidden rounded-lg border bg-background focus-within:border-ring">
			<div className="flex shrink-0 items-center gap-1 border-b p-1">
				{toolbar.map((item) => (
					<Button
						key={item.label}
						type="button"
						variant="ghost"
						size="icon-xs"
						aria-label={item.label}
						aria-pressed={item.isActive}
						onClick={item.run}
						className={cn(
							"text-muted-foreground",
							item.isActive && "bg-muted text-foreground",
						)}
					>
						<item.icon />
					</Button>
				))}
			</div>

			<EditorContent editor={editor} />
		</div>
	);
}
