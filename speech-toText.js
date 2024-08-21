const fs = require('fs');
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: 'sk-proj-E9UyU4Gk7DQ2dZM7vWfXT3BlbkFJulFJ5pgZ4xfNQrFKuNjY' 
});

async function convert() {
  const response = await openai.audio.transcriptions.create({
    file: fs.createReadStream("time.m4a"),
    model: "whisper-1",
    language: "en",
  });
  return response.text; 
}

module.exports = convert; 
