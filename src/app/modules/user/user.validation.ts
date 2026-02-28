import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

export const createDoctorZodeSchema = z.object({
  password: z
    .string("Password is required")
    .min(6, "Password must be at least 6 characters long")
    .max(20, "Password must be less than 20 characters long"),
  doctor: z.object({
    name: z
      .string("name is required")
      .min(3, "name must be at least 3 characters long")
      .max(30, "name must be less than 30 characters long"),
    email: z.email("email must be a valid email address"),
    profilePhoto: z
      .string("profilePhoto is required")
      .url("profilePhoto must be a valid URL")
      .optional(),
    contactNumber: z
      .string("contactNumber is required")
      .min(11, "contactNumber must be at least 11 characters long")
      .max(14, "contactNumber must be less than 14 characters long"),
    address: z
      .string("address is required")
      .min(10, "address must be at least 10 characters long")
      .max(100, "address must be less than 100 characters long")
      .optional(),
    registrationNumber: z
      .string("registrationNumber is required")
      .min(5, "registrationNumber must be at least 5 characters long")
      .max(20, "registrationNumber must be less than 20 characters long"),
    experince: z
      .int("experince must be a int")
      .nonnegative("experince must be a non-negative integer")
      .optional(),
    gender: z
      .enum(
        [Gender.FEMALE, Gender.MALE, Gender.OTHER],
        "Gender must be either 'FEMALE', 'MALE', or 'OTHER'",
      )
      .optional(),
    appointmentFee: z
      .number("appointmentFee must be a number")
      .nonnegative("appointmentFee must be a non-negative number"),
    qualification: z
      .string("qualification is required")
      .min(2, "qualification must be at least 5 characters long")
      .max(100, "qualification must be less than 100 characters long"),
    currentWorkingPlace: z
      .string("currentWorkingPlace is required")
      .min(2, "currentWorkingPlace must be at least 5 characters long")
      .max(100, "currentWorkingPlace must be less than 100 characters long"),
    designation: z
      .string("designation is required")
      .min(2, "designation must be at least 5 characters long")
      .max(100, "designation must be less than 100 characters long"),
  }),
  specialities: z
    .array(z.uuid("Each speciality must be a valid UUID"))
    .min(1, "At least one speciality is required"),
});

export const createAdminValidationSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  admin: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email format"),
    profilePhoto: z.url("Invalid URL format").optional(),
    contactNumber: z.string().min(1, "Contact number is required"),
  }),
});
