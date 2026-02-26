import express, { Application, Request, Response } from "express";

const app: Application = express();
const port = process.env.PORT || 5000;

app.use(express.json()); // Add this line to enable JSON parsing in the request body
app.use(express.urlencoded({ extended: true })); // Add this line to enable URL-encoded data parsing in the request body

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript Express!");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
