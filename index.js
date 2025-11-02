import express from "express";
import cors from "cors";
import multer from "multer";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
console.log("OPENAI_API_KEY", process.env.OPENAI_API_KEY)
// Endpoint for analyzing spark plug
app.post("/analyze-sparkplug", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const imageBase64 = req.file.buffer.toString("base64");
    console.log("Received image, bytes:", req.file.size);

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this spark plug image and give a short, clear diagnosis." },
            { type: "image", image_url: `data:image/jpeg;base64,${imageBase64}` }
          ]
        }
      ]
    });

    // Send back the text output
    res.json({ text: response.output_text });
  } catch (err) {
    console.error("Error analyzing spark plug:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
