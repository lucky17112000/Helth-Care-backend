import z from "zod";

const createSpecialityZodSchema = z.object({
  title: z.string("Title is required"),
  description: z.string("Description is required").optional(),
});

export const SpecialityValidation = {
  createSpecialityZodSchema,
};
