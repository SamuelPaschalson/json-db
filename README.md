# @samuelpaschalson/json-db

This is a package that lets users access or use database like structure with Json files

Fast, unopinionated, minimalist web framework for [Node.js](http://nodejs.org).

<!-- [![NPM Version][npm-version-image]][npm-url]
[![NPM Install Size][npm-install-size-image]][npm-install-size-url]
[![NPM Downloads][npm-downloads-image]][npm-downloads-url] -->

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```sh
$ npm install @samuelpaschalson/json-db
```

## Features

### Model

<li>Creates a JSON file and uses it as a database.</li>
<li>Loads data from a JSON file asynchronously.</li>
<li>Performs aggregation operations similar to Mongoose aggregation pipeline. (Currently supports $match, $project, $sample, $sort, $limit, $group and $skip)</li>
<li>Provides an asynchronous method for finding a single object based on a query.</li>
<li> Provides an asynchronous method for inserting new data into the json database file.</li>
<li>Provides an asynchronous method for finding data based on the _id in the parameters and updates the _id.</li>
<li> Provides an asynchronous method for deleting data from the json file using the _id based on a query.</li>

### Schema

<li><b>Data Type Validation:</b> Ensures data adheres to the specified types (String, Number, Boolean, uuid, Mixed, Array).</li>
<li><b>Required Fields:</b> Checks for the presence of mandatory fields.</li>
<li><b>Default Values:</b> Assigns default values if properties are missing in the provided data.</li>
<li><b>Uniqueness:</b> Enables entering of unique characters in the data.</li>

## Features Summary

```js
const jsondb = require('@samuelpaschalson/json-db');
```

The `jsondb` uses a json file as a database, providing user the same experience a mongodb or mysql modules provides them, but while offline. Note this is just the first release, more releases coming soon with more functionalities.

### Creates An instance Schema()

Creates a new `.Schema()` object, it accepts object data using the following parameters.<br>
A new \_id is generated for each data, but the \_id can be replaced by your own \_id, a tutorial would be provided below.

```js
new jsondb.Schema({
  name: {
    type: String,
    default: 'john',
    required: true,
    unqiue: true,
    ref: 'User',
  },
});
```

#### Accepted **object** Type For Schema

String, Array, UUID(), Boolean, Number etc [more types coming...]

### Creates An instance model()

This creates a model function that enables you run the schema and inserts your data. Some parameters are passed into the model to enable smooth running

```js
jsondb.model(name_of_the_file, Schema_name, json_database_name);
```

#### Accepted datas for model

**name_of_the_file:** this should be the same name as the js file that is the model folder<br>
**Schema_name:** this should be the same name as the schema in the js file<br>
**json_database_name:** this should be a file without a .json extension<br>
**Note:** all three datas should be the same

```js
jsondb.model('User', User, 'user');
```

## API Summary

|                                                                    |                                                                                                                                                      |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`.save(req.body)`](#save)                                         | The .save(req.body), saves the posted request to the json database                                                                                   |
| [`.findByIdAndUpdate(req.body, req.param.id)`](#findbyidandupdate) | The .findByIdAndUpdate(req.body, req.param.id), finds the data by the id in the parameters and pushes the req.body to the \_id                       |
| [`.findByIdAndDelete(req.params.id)`](#findbyidanddelete)          | The .findByIdAndDelete(req.params.id), deletes the data from the id inserted into the parameter                                                      |
| [`.aggregate(pipeline)`](#aggregate)                               | The .aggregate performs aggregation operations on the loaded data from the json file based on provided pipelines, check the accepted pipelines below |
| [`.getAll()`](#getall)                                             | This displays all the data in the json file                                                                                                          |
| [`.findOne(req.body)`](#findone)                                   | This finds a single object matching the provided query object                                                                                        |
| [`.findById(req.params.id)`](#findone)                             | This finds a single object matching the provided id                                                                                                  |

## API

### .save(req.body)

For an example checkout the [Usage.md](USAGE.md)

### .findByIdAndUpdate(req.body)

For an example checkout the [Usage.md](USAGE.md)

### .findByIdAndDelete(req.body)

For an example checkout the [Usage.md](USAGE.md)

### .aggregate(pipeline)

For an example checkout the [Usage.md](USAGE.md)

### .getAll()

For an example checkout the [Usage.md](USAGE.md)

### .findOne(req.body)

For an example checkout the [Usage.md](USAGE.md)

### .findById(req.params.id)

For an example checkout the [Usage.md](USAGE.md)

## Contact Me

Have a feature or a functionality which you would like to see, send me a message on Gmail [samuelpaschalson@gmail.com](samuelpaschalson@gmail.com)

## 3rd party DATABASES

### Mysql Support

For an example checkout the [Usage.md](USAGE.md)

### Mongoose support coming soon

## License

[MIT](LICENSE.md) © [Samuel Paschalson aka Chinomso Iyasara](https://samuel-paschalson.netlify.app/)

[npm-downloads-image]: https://badgen.net/npm/dm/express
[npm-downloads-url]: https://npmcharts.com/compare/express?minimal=true
[npm-install-size-image]: https://badgen.net/packagephobia/install/express
[npm-install-size-url]: https://packagephobia.com/result?p=express
[npm-url]: https://npmjs.org/package/express
[npm-version-image]: https://badgen.net/npm/v/express
