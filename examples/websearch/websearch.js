import dotenv from "dotenv";
import { Configuration, OpenAIPluginApi , Plugins} from "../../src/index.js";

//var dotenv = require('dotenv');
//var { Configuration, OpenAIPluginApi , Plugins} = require("../../src/index.js");
dotenv.config();


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIPluginApi(configuration);

(async () => {

    var plugins = new Plugins([
      {
        name: 'Web Search Plugin', 
        manifest: 'https://websearch.plugsugar.com/.well-known/ai-plugin.json'
      }
    ])
    var completion = await openai.createChatCompletionPlugin({
      model: "gpt-3.5-turbo-0301",
      messages: [{role: "user", content: "Who is the current president of Brazil ?"}],
      plugins 
    });
    
    console.log(completion.completions.map(completion => completion.message));

    completion = await openai.createChatCompletionPlugin({
      model: "gpt-3.5-turbo-0301",
      messages: [{role: "user", content: 'When Ukraine launched a counterattack against Russia ?'}],
      plugins 
    });
    
    console.log(completion.completions.map(completion => completion.message));

  
})();