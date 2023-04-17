import dotenv from "dotenv";
import { Configuration, OpenAIPluginApi , Plugins} from "../../src/index.js";

dotenv.config();


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIPluginApi(configuration);

(async () => {

    var plugins = new Plugins([
      {
        name: 'Calculator Plugin', 
        manifest: 'https://chat-calculator-plugin.supportmirage.repl.co/.well-known/ai-plugin.json'
      }
    ])
    var completion = await openai.createChatCompletionPlugin({
      model: "gpt-3.5-turbo-0301",
      messages: [{role: "user", content: "How much is 3849 x 382 ?"}],
      plugins 
    });
    
    console.log(completion.completions.map(completion => completion.message));

    completion = await openai.createChatCompletionPlugin({
      model: "gpt-3.5-turbo-0301",
      messages: [{role: "user", content: 'What is the square root of 225?'}],
      plugins 
    });
    
    console.log(completion.completions.map(completion => completion.message));

  
})();