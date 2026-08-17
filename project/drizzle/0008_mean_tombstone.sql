ALTER TABLE "tasks" ALTER COLUMN "description" SET DATA TYPE jsonb USING (
	CASE
		WHEN "description" IS NULL OR "description" = '' THEN NULL
		ELSE jsonb_build_object(
			'type', 'doc',
			'content', jsonb_build_array(
				jsonb_build_object(
					'type', 'paragraph',
					'content', jsonb_build_array(
						jsonb_build_object('type', 'text', 'text', "description")
					)
				)
			)
		)
	END
);
