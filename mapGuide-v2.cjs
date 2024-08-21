require("dotenv").config();
const OpenAI = require("openai");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});
const {MongoClient}=require("mongodb");

const secretKey ="sk-proj-E9UyU4Gk7DQ2dZM7vWfXT3BlbkFJulFJ5pgZ4xfNQrFKuNjY";
const openai = new OpenAI({
  apiKey: secretKey,
});
let prompt="";

const mongoUri = 'mongodb+srv://nikv7781:alpha7781@cluster0.ggpsptz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'travel';
const collectionName = 'bus2';

async function getBusData(query){
const client = new MongoClient(mongoUri, {});
await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const busData = await collection.find({}).toArray();

    const context = busData.map(bus => {
      return `Sl. No.: ${bus['Sl. No.']}, Depot: ${bus['Depot']}, Route No.: ${bus['Route No.']}, From: ${bus['From']}, To: ${bus['To']}, Route Length: ${bus['Route Length']}, Type: ${bus['Type']}, No. of Service: ${bus['No.of Service']}, Departure Timings: ${bus['Departure Timings']}`;
    }).join('\n');

    prompt = `You have the following bus data:\n${context}\n\nAnswer the following query:\n${query}. Do not use any other sources. This bus data should only be the source of your information`;
}

async function askQuestion(question) {
  return new Promise((resolve, reject) => {
    readline.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  try {

    await getBusData();

    const assistant = await openai.beta.assistants.create({
      name: "mapGuide",
      instructions:prompt,
      tools: [{ type: "file_search" }],
      model: "gpt-4o-mini",
    });
    console.log("\nHello there\n");

    
    const thread = await openai.beta.threads.create();

    
    let keepAsking = true;
    while (keepAsking) {
      const userQuestion = await askQuestion("\nWhat is your question? ");
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: userQuestion,
      });
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.id,
      });

      let runStatus = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
      );

    
      while (runStatus.status !== "completed") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      }
      const messages = await openai.beta.threads.messages.list(thread.id);

    
      const lastMessageForRun = messages.data
        .filter(
          (message) => message.run_id === run.id && message.role === "assistant"
        )
        .pop();

      
      if (lastMessageForRun) {
        console.log(`${lastMessageForRun.content[0].text.value} \n`);
      }

      
      const continueAsking = await askQuestion(
        "Do you want to ask another question? (yes/no) "
      );
      keepAsking = continueAsking.toLowerCase() === "yes";

      
      if (!keepAsking) {
        console.log("Thanks for using\n");
      }
    }

    
    readline.close();
  } catch (error) {
    console.error(error);
  }
}


main();
  