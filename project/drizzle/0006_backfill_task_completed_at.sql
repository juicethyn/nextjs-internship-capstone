UPDATE "tasks" SET "completed_at" = "tasks"."updated_at"
FROM "lists"
WHERE "tasks"."list_id" = "lists"."id"
  AND "lists"."type" = 'done'
  AND "tasks"."completed_at" IS NULL;
