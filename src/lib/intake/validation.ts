// Shared definitions for the two public intake forms.
// Kept out of the "use server" action files, which may only export async functions.

export type FieldDef = {
    name: string;
    label: string;
    type: "text" | "email" | "textarea" | "select";
    required?: boolean;
    maxLength?: number;
    options?: string[];
    hint?: string;
};

export type FormState = {
    status: "idle" | "error" | "success";
    message?: string;
    errors: Record<string, string>;
    values: Record<string, string>;
};

export const initialFormState: FormState = { status: "idle", errors: {}, values: {} };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validate(formData: FormData, fields: FieldDef[]) {
    const values: Record<string, string> = {};
    const errors: Record<string, string> = {};

    for (const field of fields) {
        const raw = formData.get(field.name);
        const value = typeof raw === "string" ? raw.trim() : "";
        values[field.name] = value;

        if (!value) {
            if (field.required) errors[field.name] = `${field.label} is required.`;
            continue;
        }
        if (field.maxLength && value.length > field.maxLength) {
            errors[field.name] = `${field.label} must be ${field.maxLength} characters or fewer.`;
        } else if (field.type === "email" && !EMAIL_PATTERN.test(value)) {
            errors[field.name] = "Enter a valid email address.";
        } else if (field.type === "select" && !field.options?.includes(value)) {
            errors[field.name] = `Choose one of the listed options for ${field.label.toLowerCase()}.`;
        }
    }

    return { values, errors };
}
