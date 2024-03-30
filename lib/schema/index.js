class Schema {
  constructor(schemaDefinition) {
    this.definition = schemaDefinition;
  }

  add(field, options) {
    this.definition[field] = options;
    return this;
  }
}

module.exports = Schema;
