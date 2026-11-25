"use server";

import { validate, type FormState } from "@/lib/intake/validation";
import { proposalFields } from "@/lib/intake/forms";

export async function submitProposalRequest(
    _prev: FormState,
    formData: FormData
): Promise<FormState> {
    const { values, errors } = validate(formData, proposalFields);

    if (Object.keys(errors).length > 0) {
        return { status: "error", message: "Please fix the highlighted fields.", errors, values };
    }

    // Validation only. Saving the lead and starting the sales workflow comes
    // with the intake automation, so nothing is stored yet.
    return {
        status: "success",
        message:
            "Your details passed validation. Lead storage is not connected yet, so this request was not saved.",
        errors: {},
        values: {},
    };
}
