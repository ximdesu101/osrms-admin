import { z } from "zod";

export const teacherSchema = z.object({
    teacherId: z.string().min(1, "Employee ID is required"),
    firstName: z.string().min(1, "First name is required"),
    middleName: z.string().optional(),
    lastName: z.string().min(1, "Last name is required"),
    suffix: z.string().default("none"),
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .regex(/^[a-zA-Z0-9._-]+$/, "Only letters, numbers, dots, dashes, underscores"),
    position: z.string().min(1, "Position is required"),
    classAdvisory: z.string().min(1, "Class advisory is required"),
    region: z.string().min(1, "Region is required"),
    province: z.string().optional(),
    cityMunicipality: z.string().min(1, "City / Municipality is required"),
    barangay: z.string().min(1, "Barangay is required"),
    contactNumber: z
        .string()
        .min(1, "Contact number is required")
        .max(20, "Contact number must be 20 characters or fewer")
        .regex(/^[\d\s\+\-\(\)]+$/, "Contact number may only contain digits, spaces, +, -, and parentheses"),
});