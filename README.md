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
<li>Provides an asynchronous method for finding data based on the id in the parameters and updates the id.</li>
<li> Provides an asynchronous method for deleting data from the json file using the id based on a query.</li>

### Schema
<li><b>Data Type Validation:</b> Ensures data adheres to the specified types (String, Number, Boolean, uuid, Mixed, Array).</li>
<li><b>Required Fields:</b> Checks for the presence of mandatory fields.</li>
<li><b>Default Values:</b> Assigns default values if properties are missing in the provided data.</li>
<li><b>Uniqueness:</b> Enables entering of unique characters in the data.</li>


## Features Summary

```js
const jsondb = require('@samuelpaschalson/json-db');
````
The `jsondb` uses a json file as a database, providing user the same experience a mongodb or mysql modules provides them, but while offline. Note this is just the first release, more releases coming soon with more functionalities.

### Creates An instance Schema()

Creates a new `.Schema()` object, it accepts object data using the following parameters.<br>
A new _id is generated for each data, but the _id can be replaced by your own id, a tutorial would be provided below. 

```js
    new jsondb.Schema({ 
        name: { type: String, default: 'john', required: true, unqiue: true }
    })
````

#### Accepted **object** Type For Schema

String, Array, UUID(), Boolean, Number etc [more types coming...]

### Creates An instance model()

This creates a model function that enables you run the schema and inserts your data. Some parameters are passed into the model to enable smooth running


```js
    jsondb.model(name_of_the_file, Schema_name, json_database_name)
````

#### Accepted datas for model

**name_of_the_file:** this should be the same name as the js file that is the model folder<br>
**Schema_name:** this should be the same name as the schema in the js file<br>
**json_database_name:** this should be a file without a .json extension<br>
**Note:** all three datas should be the same

```js
    jsondb.model('User', User, 'user')
````

## API Summary

|  |  |
| --- | --- |
| [`User.save(req.body)`](#save) | The .save(req.body), saves the posted request to the json database |
| [`.findByIdAndUpdate(req.body)`](#findbyidandupdate) | The .findByIdAndUpdate(req.body), finds the data by the id in the parameters and pushes the req.body to the id |
| [`.findByIdAndDelete(req.params.id)`](#findbyidanddelete) | The .findByIdAndDelete(req.params.id), deletes the data from the id inserted into the parameter  |
| [`.aggregate(pipeline)`](#aggregate) | The .aggregate performs aggregation operations on the loaded data from the json file based on provided pipelines, check the accepted pipelines below |
| [`.getAll()`](#getall) | This displays all the data in the json file |
| [`.findOne(req.body)`](#findone) | This finds a single object matching the provided query object |

## API

### User.save(req.body)

The .save(req.body), saves the posted request to the json database

<h4>Example</h4>

```javascript
const jsondb = require('@samuelpaschalson/json-db');

// Instantiate a new Schema
const User = new jsondb.Schema({ 
    name: { type: String, default: 'john', required: true, unqiue: true },
    gender: { type: String, default: 'male', required: true, unqiue: true },
    age: { type: Number, required: true, unqiue: true },
    isStudent: { type: Boolean },
    school: { type: STring }
})

// Call the model function
module.exports = jsondb.model('User', User, 'user')

// if your User.js file is in another folder, else then do not add this line
const User = require('path-to-folder/User');

// CREATE NEW DATA
router.post('/', async (req, res) => {
  const userdata = req.body; // Assuming the post data is in the request body
  // Post the data using your exported model data
  try {
    const userMovie = await User.save(userdata)
    res.status(200).json({ message: 'User saved successfully' }); //display success message
  } catch (err) {
    res.status(500).json(err); //display error message
  }
});

```

### User.findByIdAndUpdate(req.body)

The .findByIdAndUpdate(req.body), finds the data by the id in the parameters and pushes the req.body to the id

<h4>Example</h4>

```javascript
const jsondb = require('@samuelpaschalson/json-db');

// Instantiate a new Schema
const User = new jsondb.Schema({ 
    name: { type: String, default: 'john', required: true, unqiue: true },
    gender: { type: String, default: 'male', required: true, unqiue: true },
    age: { type: Number, required: true, unqiue: true },
    isStudent: { type: Boolean },
    school: { type: STring }
})

// Call the model function
module.exports = jsondb.model('User', User, 'user')

// if your User.js file is in another folder, else then do not add this line
const User = require('path-to-folder/User');

// UPDATE EXISTING DATA
router.put('/:id', async (req, res) => {
  // const userId = req.params.id; // Assuming the ID is in the URL parameter
  const updates = req.body; // Assuming the update data is in the request body

  // Update the users using your User
  try {
    const updatedUser = await User.findByIdAndUpdate(updates)
    if (updatedUser) {
      res.status(200).json(updatedUser); // Send the updated movie data
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error finding or updating user' });
  }
});

```

### User.findByIdAndDelete(req.body)

The .findByIdAndDelete(req.params.id), deletes the data from the id inserted into the parameters

<h4>Example</h4>

```javascript
const jsondb = require('@samuelpaschalson/json-db');

// Instantiate a new Schema
const User = new jsondb.Schema({ 
    name: { type: String, default: 'john', required: true, unqiue: true },
    gender: { type: String, default: 'male', required: true, unqiue: true },
    age: { type: Number, required: true, unqiue: true },
    isStudent: { type: Boolean },
    school: { type: STring }
})

// Call the model function
module.exports = jsondb.model('User', User, 'user')

// if your User.js file is in another folder, else then do not add this line
const User = require('path-to-folder/User');

// DELTE DATA BY ID
router.delete('/:id', async (req, res) => {
  const deleteId = req.params.id; // Assuming the ID is in the URL parameter
  console.log(deleteId);
  // Delete the user using your User
  try {
    const deletedUser = await User.findByIdAndDelete(deleteId)
    if (deletedUser) {
      res.status(200).json({message: 'User deleted successfully!'}); // Send the deleted message
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error finding or deleting user' });
  }
});

```

### User.aggregate(pipeline)

The .aggregate performs aggregation operations on the loaded data from the json file based on provided pipelines, check the accepted pipelines below

<h4>Example</h4>

```javascript
const jsondb = require('@samuelpaschalson/json-db');

// Instantiate a new Schema
const User = new jsondb.Schema({ 
    name: { type: String, default: 'john', required: true, unqiue: true },
    gender: { type: String, default: 'male', required: true, unqiue: true },
    age: { type: Number, required: true, unqiue: true },
    isStudent: { type: Boolean },
    school: { type: STring }
})

// Call the model function
module.exports = jsondb.model('User', User, 'user')

// if your User.js file is in another folder, else then do not add this line
const User = require('path-to-folder/User');

// DELTE DATA BY ID
router.get('/randomUser', async (req, res) => {
  const age = req.query.age; // Assuming age is an optional filter in the query string
  let user = [];
  try {
    const filter = age >== 14 ? { isStudent: "true" } : { isStudent: "false" }; // Dynamic filter based on age
    user = await User.aggregate([
      { $match: filter },
      { $group:  },
      { $sort:  },
      { $sample: 5 } // Allow filtering by any field in the query string
    ]);
    res.status(200).json(user); // Return the user datas from the array
  } catch (err) {
    console.error('Error getting random user:', err);
    res.status(500).json({ message: 'Error finding random user' });
  }
});

```


### User.getAll()

This displays all the data in the json file

<h4>Example</h4>

```javascript
const jsondb = require('@samuelpaschalson/json-db');

// Instantiate a new Schema
const User = new jsondb.Schema({ 
    name: { type: String, default: 'john', required: true, unqiue: true },
    gender: { type: String, default: 'male', required: true, unqiue: true },
    age: { type: Number, required: true, unqiue: true },
    isStudent: { type: Boolean },
    school: { type: STring }
})

// Call the model function
module.exports = jsondb.model('User', User, 'user')

// if your User.js file is in another folder, else then do not add this line
const User = require('path-to-folder/User');

// DISPLAY ALL THE DATA
router.get('/', async (req, res) => {
  // console.log(req);
  try {
    const users = await User.getAll();
    res.status(200).json(users);
  } catch (err) {
    console.error('Error getting all users:', err);
    res.status(500).json({ message: 'Error retrieving users' });
  }
});

```


### User.findOne(req.body)

This finds a single object matching the provided query object

<h4>Example</h4>

```javascript
const jsondb = require('@samuelpaschalson/json-db');

// Instantiate a new Schema
const User = new jsondb.Schema({ 
    name: { type: String, default: 'john', required: true, unqiue: true },
    gender: { type: String, default: 'male', required: true, unqiue: true },
    age: { type: Number, required: true, unqiue: true },
    isStudent: { type: Boolean },
    school: { type: STring }
})

// Call the model function
module.exports = jsondb.model('User', User, 'user')

// if your User.js file is in another folder, else then do not add this line
const User = require('path-to-folder/User');

router.post('/login', async (req, res) => {
  const userdata = ({
      name: req.body.name
  });
  console.log(req.body);
  // Post the data using your exported model data
  try {
    const newUser = await User.findOne(userdata)
    res.status(200).json(newUser); //display user data
  } catch (err) {
    res.status(500).json(err); //display error message
  }
});

```

<!-- ## Buy Me A Cup Of Coffee
Like the npm package? and would like to see more functionalities, buy me a cup of coffee to fuel me while working<br>
**Bitcoin:** [Wallet Address: bc1qw9p3gud48d9c8dhnepj8weudfugjtdehnw0ztu](bc1qw9p3gud48d9c8dhnepj8weudfugjtdehnw0ztu)<br>
**Ethereum:** [Wallet Address: 0xE495F4EE4CF614B34b51714d4711AE458f224c2D](0xE495F4EE4CF614B34b51714d4711AE458f224c2D)<br>
**Paypal:** [Paypal Address: iyasarachinomso35@gmail.com](iyasarachinomso35@gmail.com)<br>
**Binance:** [Wallet Address: 0xE495F4EE4CF614B34b51714d4711AE458f224c2D](0xE495F4EE4CF614B34b51714d4711AE458f224c2D)<br> -->

## Contact Me
Have a feature or a functionality which you would like to see, send me a message on Gmail [samuelpaschalson@gmail.com](samuelpaschalson@gmail.com)

## License
[MIT](LICENSE.md) © [Samuel Paschalson aka Chinomso Iyasara](https://samuel-paschalson.netlify.app/)


[npm-downloads-image]: https://badgen.net/npm/dm/express
[npm-downloads-url]: https://npmcharts.com/compare/express?minimal=true
[npm-install-size-image]: https://badgen.net/packagephobia/install/express
[npm-install-size-url]: https://packagephobia.com/result?p=express
[npm-url]: https://npmjs.org/package/express
[npm-version-image]: https://badgen.net/npm/v/express

