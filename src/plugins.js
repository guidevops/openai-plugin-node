import api from 'api';
import path from 'path';
import { genDoc } from './gen_description.js';
import request from 'sync-request';
import dotenv from 'dotenv';
import yaml from "js-yaml"
dotenv.config();

var yaml2json_api = process.env.YAML2JSON_API ||'https://serveless-yaml2json.vercel.app'
//This workaround is necessary because the api() module is very sensitive to the openapi.json format and I could only call the api() with a URL.
//setup your yaml2json endpoint :

var handleOpenapi = function(openapi){
    openapi = request('GET', openapi).getBody('utf8')
    try {
        var json = JSON.parse(openapi);
    } catch (e) {
        var json = yaml.load(openapi);
    }
    for (var path in json.paths) {
      if(path.includes('.well-known')){
        delete json.paths[path]
      }
    }
    return json
}


export default function Plugins(plugins){
    var response = {}
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i];
      var { name, description, manifest, openapi } = plugin
      if(manifest){
        manifest = JSON.parse(request('GET', manifest).getBody('utf8'))
        name = manifest.name_for_model.replaceAll(' ', '_').replaceAll('-', '_').replaceAll('.', '_').trim()
        openapi = handleOpenapi(manifest.api.url)
      }else if (openapi){
        openapi = handleOpenapi(openapi)
        name = openapi.info.title.replaceAll(' ', '_').replaceAll('-', '_').replaceAll('.', '_').trim()
      }

      response[name] = {
        name: name,
        reference: genDoc({name,description, openapi, manifest }),
        //TODO
        //This code uses the API module to generate the plugin's SDK. Since it wasn't possible to pass the content of the openapi.json file directly, we had to pass the URL. Due to the sensitivity of the format accepted by the module, it was necessary to create a proxy. 
        sdk: api(yaml2json_api + '/api/yaml2json?url=' + manifest.api.url, {
          cacheDir: path.join(process.cwd(), '.api'),
        })
      }

    }
    return response
  
}