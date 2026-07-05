import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // or pass string

async function test() {
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Hello"
    });
    console.log(result.text);
  } catch (err) {
    console.error("Error in generateContent:", err);
  }
}

test();
