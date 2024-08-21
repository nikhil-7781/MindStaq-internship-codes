const { MongoClient } = require('mongodb');
const { OpenAI } = require('openai'); 

const openai = new OpenAI({
  apiKey: 'sk-proj-E9UyU4Gk7DQ2dZM7vWfXT3BlbkFJulFJ5pgZ4xfNQrFKuNjY'
});

const mongoUri = 'mongodb+srv://nikv7781:alpha7781@cluster0.ggpsptz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'travel';
const collectionName = 'bus';

async function getBusData(query) {
  const client = new MongoClient(mongoUri, {});

  try {
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

    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}
async function main(quest){
const userQuery =quest;
getBusData(userQuery).then(answer => {
  console.log(`Query: ${userQuery}`);
  console.log(`Answer: ${answer}`);
}).catch(err => {
  console.error('Error:', err);
});
}
module.exports = main;
