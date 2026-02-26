import app from "./app";

const port = process.env.PORT || 5000;

const bootstrap = async () => {
  try {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};
bootstrap();
