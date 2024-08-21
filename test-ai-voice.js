const { MongoClient } = require('mongodb');
const { OpenAI } = require('openai'); 
const transcribeAudio = require("./speech-toText.js");

const openai = new OpenAI({
  apiKey: 'sk-proj-E9UyU4Gk7DQ2dZM7vWfXT3BlbkFJulFJ5pgZ4xfNQrFKuNjY'
});

const mongoUri = 'mongodb+srv://nikv7781:alpha7781@cluster0.ggpsptz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'travel';
const collectionName = 'bus';

async function getBusData(query) {
  const client = new MongoClient(mongoUri, {});

  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  const busData = await collection.find({}).toArray();

  const context = busData.map(bus => {
    return `Sl. No.: ${bus['Sl. No.']}, Depot: ${bus['Depot']}, Route No.: ${bus['Route No.']}, From: ${bus['From']}, To: ${bus['To']}, Route Length: ${bus['Route Length']}, Type: ${bus['Type']}, No. of Service: ${bus['No.of Service']}, Departure Timings: ${bus['Departure Timings']}`;
  }).join('\n');

  const prompt = `You have the following bus data:\n${context}\n\nAnswer the following query:\n${query}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200,
    temperature: 0.7,
  });

  await client.close();
  return response.choices[0].message.content.trim();
}

async function main() {
  const userQuery = await transcribeAudio();
  if (userQuery) {
    const answer = await getBusData(userQuery);
    console.log(`Query: ${userQuery}`);
    console.log(`Answer: ${answer}`);
  } else {
    console.error('Failed to transcribe audio.');
  }
}

main();
