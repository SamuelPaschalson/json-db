
class Schema {
    constructor(definition) {
      this.definition = definition; // Store schema definition
      // this.definition = this.validate(definition); // Store schema definition
    }

    // validate(definition) {
    //   if (!definition || typeof definition !== "object") {
    //     throw new Error('Schema definition must be an object.');
    //   }
    //   return definition;

    //   // const validatedFields = {};
    //   //   for (const field in definition) {
    //   //     if (!definition.hasOwnProperty(field)) {
    //   //       continue; // Skip inherited properties
    //   //     }

    //   //   const fieldDef = definition[field];
    //   //   if (!fieldDef || typeof fieldDef !== 'object') {
    //   //     throw new Error(`Field definition for "${field}" must be an object or array.`);
    //   //   }

    //   //   // Basic type validation (expand as needed)
    //   //   if (!fieldDef.hasOwnProperty('type')) {
    //   //     throw new Error(`Field definition for "${field}" requires a "type" property.`);
    //   //   }
        
    //   //   switch (fieldDef.type) {
    //   //     case String:
    //   //     case Number:
    //   //     case Boolean:
    //   //     case Array:
    //   //       validatedFields[field] = fieldDef;
    //   //       break;
    //   //     default:
    //   //       throw Error(`Unsupported field type: ${fieldDef.type}`);
    //   //   }
    //   // }
    //   return validatedFields;
    // }
}
  
module.exports = Schema;