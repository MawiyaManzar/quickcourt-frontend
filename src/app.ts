import express from "express";

const app = express();

app.use(express.json());

// Basic health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "quickcourt-backend" });
});

export default app;
