"use server";

import { redirect } from "next/navigation";
import type { OnboardingPayload } from "@/types/onboarding";
import { createActivity } from "../activity";
import { getCurrentUser } from "../auth";
import { updateUser } from "../db/queries/users";
import { createWorkspace } from "../db/queries/workspaces";
import { onboardingSchema } from "../validations/onboarding";

export async function completeOnboardingAction(data: OnboardingPayload) {
    const user = await getCurrentUser();

    const validatedData = onboardingSchema.safeParse(data);

    if (!validatedData.success) {
        return {
            success: false,
            message: "Invalid onboarding data",
        };
    }

    const workspace = await createWorkspace(
        user.id,
        validatedData.data.workspace,
    );

    await updateUser(user.id, {
        lastWorkspaceId: workspace.id,
        occupation: validatedData.data.occupation,
    });

    await createActivity({
        workspaceId: workspace.id,
        actorId: user.id,
        action: "created",
        entity: "workspace",
        entityId: workspace.id,
    });

    redirect(`/w/${workspace.slug}/dashboard`);
}
