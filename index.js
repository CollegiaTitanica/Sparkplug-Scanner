import cors from "cors";
import express from "express";
import fs from "fs";
import multer from "multer";
import OpenAI from "openai";

import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());


console.log("PORT:", process.env.PORT);
console.log("OPENAI_API_KEY set?", !!process.env.OPENAI_API_KEY);

// store uploaded files in "uploads/" temporarily
const upload = multer({ dest: "uploads/" });

// initialize OpenAI client (make sure you have an .env file with your API key)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log("Image size (bytes):", imageData.length);

// endpoint for your app to call
app.post("/analyze-sparkplug", upload.single("photo"), async (req, res) => {
  try {
    const imagePath = req.file.path;

    // Read the file so we can send it to OpenAI as base64
    const imageData = fs.readFileSync(imagePath, { encoding: "base64" });

    // Send image + instruction to OpenAI Vision model
    const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an automotive expert. Analyze the spark plug image and provide a short diagnosis."
      },
      {
        role: "user",
        content: `Analyze this spark plug image: data:image/jpeg;base64,${imageData}`
      }
    ]
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
