import yaml from "js-yaml"

/*
### Example

name: Calculator Plugin
description: Use the Calculator plugin to perform basic arithmetic operations, including addition (+), subtraction (-), multiplication (*), division (/), power (^), and square root (√). Provide the numbers and the operation symbol in your query, and the plugin will return the calculated result.
className: calculator
method: calculate
description: Perform basic arithmetic operations
parameters:
  - name: operation
    description: The operation to perform
    required: true
    type: string
    mustBe:
      - add
      - subtract
      - multiply
      - divide  
  - name: a
    description: The first number
    required: true
    type: number
  - name: b
    description: The second number
    required: true
    type: number


*/


export function gen_ref_3_0_1({ openapi }){
    var json = {}
    
    json.methods = []
    for (let i = 0; i < Object.keys(openapi.paths).length; i++) {
      const paths = Object.values(openapi.paths)[i];
      for (let i = 0; i <  Object.keys(paths).length; i++) {
        const method = Object.values(paths)[i];
        if(!method.responses) continue
        var method_json = {
          method: method.operationId,
          description: method.summary,
          parameters: []
        }
        
        for (let i = 0; i < Object.keys(method.parameters).length; i++) {
          const parameter = Object.values(method.parameters)[i];
          var mustBe = parameter.schema.enum
          method_json.parameters.push({
            name: parameter.name, 
            description: parameter.description,
            required: parameter.required,
            type: parameter.schema.type, 
            mustBe
          })
        }
        json.methods.push(method_json)
        
      }
      

      
    }
    return json
}

export function gen_ref_3_0_2({openapi }){
    var json = {}
    
    json.methods = []
    for (let i = 0; i < Object.keys(openapi.paths).length; i++) {
      const paths = Object.values(openapi.paths)[i];
      for (let i = 0; i <  Object.keys(paths).length; i++) {
        const method = Object.values(paths)[i];
        if(!method.responses) continue
        var method_json = {
          method: method.operationId,
          description: method.summary,
          parameters: []
        }
        
        for (let i = 0; i < Object.keys(method.parameters).length; i++) {
          const parameter = Object.values(method.parameters)[i];
          var mustBe = parameter.schema.enum
          var { example, description, type } = parameter.schema
          method_json.parameters.push({
            name: parameter.name, 
            description,
            required: parameter.required,
            type, 
            example,
            mustBe
          })
        }
        json.methods.push(method_json)
        
      }
      

      
    }
    return json
}


export function genDoc({name,description, openapi, manifest }){
    var ref = {}
    if(manifest){
      ref.name = manifest.name_for_model.replaceAll(' ', '_').replaceAll('-', '_').replaceAll('.', '_').trim()
      ref.description = manifest.description_for_model
    }else{
      ref.name = openapi.info.title.replaceAll(' ', '_').replaceAll('-', '_').replaceAll('.', '_').trim()
      ref.description = openapi.info.description
    }
    if(description) ref.description = description

    if(openapi.openapi == '3.0.1'){
      var methods = gen_ref_3_0_1({openapi })  
      ref =  Object.assign(ref, methods)
    }else if(openapi.openapi == '3.0.2'){
      var methods = gen_ref_3_0_2({openapi })  
      ref =  Object.assign(ref, methods)
    }else{
        console.log('OpenAPI version not supported')
        if(manifest) console.log(manifest.name_for_model)
        console.log(openapi.info.title)
        console.log(openapi.openapi)
    }


    return yaml.safeDump(JSON.parse(JSON.stringify(ref)));
   
}