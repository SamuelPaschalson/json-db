var Schema = require('./schema/index');
var Model = require('./model/index');

exports.model = function model(name, Schema, db) {
      return new Model(name, Schema, db);
} || Model;
exports.Schema = Schema;



// exports = module.exports = createApplication;
