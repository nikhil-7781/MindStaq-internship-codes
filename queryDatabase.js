import 'dotenv/config'; // Using import syntax for dotenv
import OpenAI from 'openai';
import readline from 'readline';
import { MongoClient } from 'mongodb';
import { Tool } from 'experts';

const secretKey = "sk-proj-E9UyU4Gk7DQ2dZM7vWfXT3BlbkFJulFJ5pgZ4xfNQrFKuNjY";
const openai = new OpenAI({
  apiKey: secretKey,
});
const mongoUri = 'mongodb+srv://nikv7781:alpha7781@cluster0.ggpsptz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'travel';
const collectionName = 'bus2';

export class QueryDatabaseTool extends Tool {
  constructor() {
    super();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async getBusData(query) {
    const client = new MongoClient(mongoUri, {});
    try {
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(collectionName);

      const busData = await collection.find({}).toArray();

      const context = busData.map(bus => {
        return `Sl. No.: ${bus['Sl. No.']}, Depot: ${bus['Depot']}, Route No.: ${bus['Route No.']}, From: ${bus['From']}, To: ${bus['To']}, Route Length: ${bus['Route Length']}, Type: ${bus['Type']}, No. of Service: ${bus['No.of Service']}, Departure Timings: ${bus['Departure Timings']}`;
      }).join('\n');

      return `You have the following bus data:\n${context}\n\nAnswer the following query:\n${query}. Do not use any other sources. This bus data should only be the source of your information`;
    } catch (error) {
      console.error("Error querying the database:", error);
    } finally {
      await client.close();
    }
  }

  async queryOpenAI(question) {
    try {
      const prompt = await this.getBusData(question);

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: question }
        ],
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error querying the OpenAI API:", error);
    }
  }

  async askQuestion(question) {
    return new Promise((resolve, reject) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }

  async run() {
    try {
      console.log("Hello there");

      let keepAsking = true;
      while (keepAsking) {
        const userQuestion = await this.askQuestion("\nWhat is your question? ");
        const answer = await this.queryOpenAI(userQuestion);

        if (answer) {
          console.log(`${answer} \n`);
        }

        const continueAsking = await this.askQuestion("Do you want to ask another question? (yes/no) ");
        keepAsking = continueAsking.toLowerCase() === "yes";

        if (!keepAsking) {
          console.log("Thanks for using\n");
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      this.rl.close();
    }
  }
}

const queryDatabaseTool = new QueryDatabaseTool();
queryDatabaseTool.run();
