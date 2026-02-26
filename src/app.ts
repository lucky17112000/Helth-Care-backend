import express, { Application, Request, Response } from "express";
import { prisma } from "./app/lib/prisma";
const app: Application = express();
app.use(express.json()); // Add this line to enable JSON parsing in the request body
app.use(express.urlencoded({ extended: true })); // Add this line to enable URL-encoded data parsing in the request body

app.get("/", async (req: Request, res: Response) => {
  const speciality = await prisma.speciality.create({
    data: {
      title: "Cardiology",
    },
  });
  res.status(200).json({
    success: true,
    data: speciality,
    message: "Speciality created successfully",
  });
});
export default app;
