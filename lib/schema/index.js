class Schema {
  constructor(schemaDefinition, options = {}) {
    this.definition = schemaDefinition;
    this.options = options;
  }

  add(field, options) {
    this.definition[field] = options;
    return this;
  }
}

module.exports = Schema;
