import type { FieldDef } from "./validation";

// Sales and support are separate on purpose: different fields, different
// validation, and different downstream automation.

export const proposalFields: FieldDef[] = [
    { name: "name", label: "Your name", type: "text", required: true, maxLength: 120 },
    { name: "email", label: "Work email", type: "email", required: true, maxLength: 254 },
    { name: "company", label: "Company", type: "text", required: true, maxLength: 160 },
    {
        name: "service_interest",
        label: "What are you looking for?",
        type: "select",
        required: true,
        options: ["Workflow automation", "AI agents for operations", "Reporting and visibility", "Not sure yet"],
    },
    {
        name: "timeline",
        label: "Timeline",
        type: "select",
        required: true,
        options: ["As soon as possible", "Within 3 months", "Just exploring"],
    },
    {
        name: "details",
        label: "What do you want to improve?",
        type: "textarea",
        required: true,
        maxLength: 2000,
        hint: "A few sentences on the work you want off your team's plate.",
    },
];

export const supportFields: FieldDef[] = [
    { name: "name", label: "Your name", type: "text", required: true, maxLength: 120 },
    { name: "email", label: "Account email", type: "email", required: true, maxLength: 254 },
    { name: "organization", label: "Organization", type: "text", required: true, maxLength: 160 },
    { name: "subject", label: "Subject", type: "text", required: true, maxLength: 150 },
    {
        name: "urgency",
        label: "Urgency",
        type: "select",
        required: true,
        options: ["Low", "Normal", "High"],
    },
    {
        name: "details",
        label: "What do you need help with?",
        type: "textarea",
        required: true,
        maxLength: 2000,
    },
];
