import cors from "cors";
import express from "express";
import multer from "multer";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

// Use memory storage so no file writes needed
const upload = multer({ storage: multer.memoryStorage() });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/analyze-sparkplug", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const imageData = req.file.buffer.toString("base64");
    console.log("Received image, size (bytes):", req.file.size);

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

    res.json({ text: result.output_text });
  } catch (err) {
    console.error("Error analyzing spark plug:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
