import cors from "cors";
import express from "express";
import fs from "fs";
import multer from "multer";
import OpenAI from "openai";

import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());

// store uploaded files in "uploads/" temporarily
const upload = multer({ dest: "uploads/" });

// initialize OpenAI client (make sure you have an .env file with your API key)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// endpoint for your app to call
app.post("/analyze-sparkplug", upload.single("photo"), async (req, res) => {
  try {
    const imagePath = req.file.path;

    // Read the file so we can send it to OpenAI as base64
    const imageData = fs.readFileSync(imagePath, { encoding: "base64" });

    // Send image + instruction to OpenAI Vision model
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini", // supports vision
      messages: [
        {
          role: "system",
          content:
            "You are an automotive expert. Analyze the car's spark plug image and provide a short, clear diagnosis of its condition and what it might mean for engine health.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Here’s the spark plug image:" },
            {
              type: "image_url",
              image_url: `data:image/jpeg;base64,${imageData}`,
            },
          ],
        },
      ],
    });

    // remove the uploaded file to keep the folder clean
    fs.unlinkSync(imagePath);

    res.json({ text: result.choices[0].message.content });
  } catch (err) {
    console.error("Error analyzing spark plug:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// start the server
app.listen(3000, () =>
  console.log("✅ Backend running on http://localhost:3000")
);
