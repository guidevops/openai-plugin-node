import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import Plugins from './plugins.js';
dotenv.config();

var template_default = { 
  instructions: 'You have access to several plugins, use them to get the most advanced, updated and detailed expertise, knowledge and results in all subjects. Serve the user with all its features.',
  agent_scrachpad: [
    `To use a plugin, please use the following format:\n`, 
    '```',
    `Use Plugin? Yes`,
    `Method: the class and method to take`,
    `{"field":"value", ...params} //A VALID JSON`,
    '```\n',
    'When you have a response to say to the Human, or if you do not need to use a plugin, you MUST use the format:',
    '```',
    'Use a Plugin? No',
    'AI: [your response here]'
  ].join('\n'),
  examples: [
    {
      role: 'user',
      content: 'How much is 3849 x 8394 ?'
    },
    {
      role: 'assistant',
      content: `Use Plugin? Yes\nMethod: calculator.calculate\n{"operation": "multiply", "a": 3849, "b": 8394}` 
    },
    {
      role: 'user',
      content: 'Plugin response:{"result":1470318}'
    },
    {
      role: 'assistant',
      content: `Use a Plugin? No\nAI: The result of the multiplication between 3849 and 8394 is 32308506.`
    },
    {
      role: 'user',
      content: 'Thanks!'
    },
    {
      role: 'assistant',
      content: `Use a Plugin? No\nAI: Welcome!`
    },

  ]
} 

var handlePluginCall = async function (message, plugins){
          var content = message.content
          
          var action = /Method: (.*)\n/.exec(content)[1].trim()
          var plugin = action.split('.')[0]
          var method = action.split('.')[1]
          var args = JSON.parse(content.split(action)[1].trim())
          
          if(plugins[plugin]){
            var pluginAction = plugins[plugin].sdk[method]

            var plugin_response = await pluginAction(args)
            var { data , status } = plugin_response
            //need to handle errors
            
            try {
              return JSON.parse(data)
            } catch (error) {
              return data
            }
            
          }else{
            return 'Plugin no exist!Try Another!'
          }            
}

var references = function (plugins){
  var reference = 'Plugins References:\n\n'
  for (let i = 0; i < Object.values(plugins).length; i++) {
    const plugin = Object.values(plugins)[i];
    reference = reference + plugin.reference
  }
  return reference
}

function OpenAIPluginApi(configuration) {

  const openai = new OpenAIApi(configuration);

  openai.createChatCompletionPlugin = async function (options) {
    var messages = options.messages
    var { plugins } = options

    delete options.plugins
    var instructions = template_default.instructions + '\n\n' + references(plugins) + '\n\n'+ template_default.agent_scrachpad
    instructions = [{role: "system", content: instructions}]
    //var agent_scrachpad = [{role: "system", content: template_default.agent_scrachpad}]
    messages = [...instructions, ...template_default.examples, ...messages]
    
    
    var responses = []
    while(true){
      options.messages = [...messages]//options.messages = [...messages, ...agent_scrachpad]
      var completion = await this.createChatCompletion(options);
      messages.push(completion.data.choices[0].message)

      //console.log(completion.data.choices[0].message.content)
      if(completion.data.choices[0].message.content.toUpperCase().startsWith('Use Plugin? Yes'.toUpperCase())){

        responses.push({
          usage: completion.data.usage,
          type: 'plugin_trigger',
          message : completion.data.choices[0].message
         })

        var plugin_response = {
          role: "user", 
          content: 'Plugin response:' + JSON.stringify(await handlePluginCall(completion.data.choices[0].message, plugins)) 
        }

        messages.push(plugin_response)
        //console.log(plugin_response)

        responses.push({
          usage: {},
          type: 'plugin_response',
          //add more details here about plugin execution and response
          message : plugin_response
          })

      }else {
        
        responses.push({
          usage: completion.data.usage,
          type: 'assistant_response',
          message : {role: "assistant", content: completion.data.choices[0].message.content}//message : {role: "assistant", content: completion.data.choices[0].message.content.split('AI:')[1].trim()}
         })
        completion.completions = responses
        return completion
      }
          
    }
  };
  
  return openai
}

export { Configuration, OpenAIPluginApi, Plugins }