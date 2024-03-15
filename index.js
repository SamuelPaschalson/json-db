const Schema = require('./lib/schema');
const Model = require('./lib/model');

class jsonApi {
  static Schema(definition) {
    return new Schema(definition);
  }

  static model(name, schema) {
    return new Model(name, schema);
  }
}

module.exports = jsonApi;


// module.exports = {
//   Schema: require('./lib/schema'),
//   Model: require('./lib/model'),
//   // Add other exports as needed
// };