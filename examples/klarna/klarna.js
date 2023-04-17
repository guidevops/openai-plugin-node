import dotenv from "dotenv";
import { Configuration, OpenAIPluginApi, Plugins } from "../../src/index.js";

dotenv.config();


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIPluginApi(configuration);

(async () => {
  var plugins = new Plugins([
    {
      name: 'Calculator', 
      manifest: 'https://chat-calculator-plugin.supportmirage.repl.co/.well-known/ai-plugin.json'
    },
    {
      name: 'open_ai_klarna_product_api',
      manifest: 'https://klarna.com/.well-known/ai-plugin.json'
    },
  ])

  var completion

  var querys = [
    "How much does the Predator Helios 300 cost?",
    "What is the price of the iPhone 13?"

  ]

  for (let i = 0; i < querys.length; i++) {
    const query = querys[i];
    completion = await openai.createChatCompletionPlugin({
      model: "gpt-3.5-turbo",
      messages: [{role: "user", content: query}],
      plugins 
    });
  
    console.log(completion.completions.map(completion => completion.message));
    
  }



  
})();