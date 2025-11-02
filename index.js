import express from "express";
import cors from "cors";
import multer from "multer";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

// Memory storage for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Make sure OPENAI_API_KEY is set
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Test route
app.get("/", (req, res) => res.send("Backend alive"));

// Main endpoint
app.post("/analyze-sparkplug", upload.single("photo"), async (req, res) => {
  console.log("Request received");
  console.log("File:", req.file?.originalname, req.file?.size);
  console.log("OPENAI_API_KEY set?", !!process.env.OPENAI_API_KEY);

  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const imageData = req.file.buffer.toString("base64");
    console.log("Sending to OpenAI, length:", imageData.length);

    const result = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this spark plug image" },
            { type: "image", image_url: `data:image/jpeg;base64,${imageData}` }
          ]
        }
      ]
    });

    console.log("OpenAI result received");
    res.json({ text: result.output_text });
  } catch (err) {
    console.error("Error analyzing spark plug:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Critical: use only the port Railway provides
const PORT = process.env.PORT;
if (!PORT) {
  console.error("Error: process.env.PORT not defined! Exiting...");
  process.exit(1);
}

app.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Backend running on port ${PORT}`)
);
