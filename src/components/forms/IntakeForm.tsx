"use client";

import { FieldDef, FormState, initialFormState } from "@/lib/intake/validation";
import { useActionState } from "react";

type Props = {
    fields: FieldDef[];
    action: (prev: FormState, formData: FormData) => Promise<FormState>;
    submitLabel: string;
};

export function IntakeForm({ fields, action, submitLabel }: Props) {
    const [ state, formAction, pending ] = useActionState(action, initialFormState);

    if (state.status === "success") {
        return (
            <div className="form-notice" role="status">
                <h2>Request Recieved</h2>
                <p>{state.message}</p>
            </div>
        )
    };

    return (
        <form action={formAction} className="form" noValidate>
            {state.status === "error" && (
                <p className="form-notice form-notice--error" role="alert">
                    {state.message}
                </p>
            )}

            {fields.map((field) => {
                const id = `field-${field.name}`;
                const error = state.errors[field.name];
                const common = {
                    id,
                    name: field.name,
                    required: field.required,
                    maxLength: field.maxLength,
                    "aria-invalid": error ? true : undefined,
                    "aria-describedby": error ? `${id}-error` : field.hint ? `${id}-hint` : undefined,
                    defaultValue: state.values[field.name] ?? "",
                } as const;

                return (
                    <div className="field" key={field.name}>
                        <label htmlFor={id}>{field.label}</label>
                        {field.type === "textarea" ? (
                            <textarea rows={5} {...common} />
                        ) : field.type === "select" ? (
                            <select {...common} defaultValue={state.values[field.name] ?? ""}>
                                <option value="" disabled>
                                    Select…
                                </option>
                                {field.options?.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input type={field.type} {...common} />
                        )}
                        {field.hint && !error && (
                            <span id={`${id}-hint`} className="muted" style={{ fontSize: "0.85rem" }}>
                                {field.hint}
                            </span>
                        )}
                        {error && (
                            <p id={`${id}-error`} className="field-error">
                                {error}
                            </p>
                        )}
                    </div>
                );
            })}

            <div>
                <button type="submit" className="btn btn-primary" disabled={pending}>
                    {pending ? "Sending…" : submitLabel}
                </button>
            </div>
        </form>
    );
} 