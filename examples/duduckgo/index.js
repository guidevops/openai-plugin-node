import dotenv from "dotenv";
import DuckDuckGoSearch from "./DuckDuckGoSearch.js";
import { Configuration, OpenAIPluginApi , Plugins} from "../../src/index.js";

dotenv.config();


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIPluginApi(configuration);

(async () => {

    var completion = await openai.createChatCompletionPlugin({
      model: "gpt-3.5-turbo-0301",
      messages: [{role: "user", content: "Who is the current president of Brazil ?"}],
      plugins : { DuckDuckGoSearch }
    });
    
    console.log(completion.completions.map(completion => completion.message));

    completion = await openai.createChatCompletionPlugin({
      model: "gpt-3.5-turbo-0301",
      messages: [{role: "user", content: 'When Ukraine launched a counterattack against Russia ?'}],
      plugins : { DuckDuckGoSearch }
    });
    
    console.log(completion.completions.map(completion => completion.message));

  
})();