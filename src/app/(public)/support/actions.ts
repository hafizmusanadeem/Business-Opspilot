"use server";

import { validate, type FormState } from "@/lib/intake/validation";
import { supportFields } from "@/lib/intake/forms";

export async function submitSupportRequest(
    _prev: FormState,
    formData: FormData
): Promise<FormState> {
    const { values, errors } = validate(formData, supportFields);

    if (Object.keys(errors).length > 0) {
        return { status: "error", message: "Please fix the highlighted fields.", errors, values };
    }

    // Validation only. Saving the request and starting the support workflow
    // comes with the intake automation, so nothing is stored yet.
    return {
        status: "success",
        message:
            "Your details passed validation. Support request storage is not connected yet, so this request was not saved.",
        errors: {},
        values: {},
    };
}
