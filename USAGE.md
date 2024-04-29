# Usage

Here's a simple example. To use the functions of `@samuelpaschalson/json-db`:

## .save(req.body)

<h4>Example</h4>

```javascript
const jsondb = require('@samuelpaschalson/json-db');

// Instantiate a new Schema
const User = new jsondb.Schema({
  name: {type: String, required: true, unqiue: true},
  gender: {type: String, default: 'male', required: true, unqiue: true},
  age: {type: Number, required: true, unqiue: true},
  isStudent: {type: Boolean},
  school: {type: String},
});

// Call the model function
module.exports = jsondb.model('User', User, 'user');

// if your User.js file is in another folder, else then do not add this line
const User = require('path-to-folder/User');

// CREATE NEW DATA
router.post('/', async (req, res) => {
  const userdata = req.body; // Assuming the post data is in the request body
  // Post the data using your exported model data
  try {
    const userMovie = await User.save(userdata);
    res.status(200).json({message: 'User saved successfully'}); //display success message
  } catch (err) {
    res.status(500).json(err); //display error message
  }
});
```

## .findByIdAndUpdate(req.body, req.param.id)

<h4>Example:</h4>

```javascript
const jsondb = require('@samuelpaschalson/json-db');

// Instantiate a new Schema
const User = new jsondb.Schema({
  name: {type: String, required: true, unqiue: true},
  gender: {type: String, default: 'male', required: true, unqiue: true},
  age: {type: Number, required: true, unqiue: true},
  isStudent: {type: Boolean},
  school: {type: String},
});

// Call the model function
module.exports = jsondb.model('User', User, 'user');

// if your User.js file is in another folder, else then do not add this line
const User = require('path-to-folder/User');

// UPDATE EXIStING DATA
router.put('/:id', async (req, res) => {
  const userId = req.params.id; // Assuming the ID is in the URL parameter
  const updates = req.body; // Assuming the update data is in the request body

  // Update the users using your User
  try {
    const updatedUser = await User.findByIdAndUpdate(updates, userId);
    if (updatedUser) {
      res.status(200).json(updatedUser); // Send the updated movie data
    } else {
      res.status(404).json({message: 'User not found'});
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({message: 'Error finding or updating user'});
  }
});
```

## .findByIdAndDelete(req.body)

<h4>Example:</h4>

```javascript
const jsondb = require('@samuelpaschalson/json-db');

// Instantiate a new Schema
const User = new jsondb.Schema({
  name: {type: String, required: true, unqiue: true},
  gender: {type: String, default: 'male', required: true, unqiue: true},
  age: {type: Number, required: true, unqiue: true},
  isStudent: {type: Boolean},
  school: {type: String},
});

// Call the model function
module.exports = jsondb.model('User', User, 'user');

// if your User.js file is in another folder, else then do not add this line
const User = require('path-to-folder/User');

// DELTE DATA BY ID
router.delete('/:id', async (req, res) => {
  const deleteId = req.params.id; // Assuming the ID is in the URL parameter
  console.log(deleteId);
  // Delete the user using your User
  try {
    const deletedUser = await User.findByIdAndDelete(deleteId);
    if (deletedUser) {
      res.status(200).json({message: 'User deleted successfully!'}); // Send the deleted message
    } else {
      res.status(404).json({message: 'User not found'});
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({message: 'Error finding or deleting user'});
  }
});
```

## .aggregate(pipeline)

<h4>Example:</h4>

```javascript
const jsondb = require('@samuelpaschalson/json-db');

// Instantiate a new Schema
const User = new jsondb.Schema({
    name: { type: String, required: true, unqiue: true },
    gender: { type: String, default: 'male', required: true, unqiue: true },
    age: { type: Number, required: true, unqiue: true },
    isStudent: { type: Boolean },
    school: { type: String }
})

// Call the model function
module.exports = jsondb.model('User', User, 'user')

// if your User.js file is in another folder, else then do not add this line
const User = require('path-to-folder/User');

// AGGREGATE DATA
router.get('/randomUser', async (req, res) => {
  const age = req.query.age; // Assuming age is an optional filter in the query string
  let user = [];
  try {
    const filter = age >= 14 ? { isStudent: "true" } : { isStudent: "false" }; // Dynamic filter based on age
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

## .getAll()

<h4>Example:</h4>

```javascript
const jsondb = require('@samuelpaschalson/json-db');

// Instantiate a new Schema
const User = new jsondb.Schema({
  name: {type: String, required: true, unqiue: true},
  gender: {type: String, default: 'male', required: true, unqiue: true},
  age: {type: Number, required: true, unqiue: true},
  isStudent: {type: Boolean},
  school: {type: String},
});

// Call the model function
module.exports = jsondb.model('User', User, 'user');

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
    res.status(500).json({message: 'Error retrieving users'});
  }
});
```

## .findOne(req.body)

<h4>Example:</h4>

```javascript
const jsondb = require('@samuelpaschalson/json-db');

// Instantiate a new Schema
const User = new jsondb.Schema({
  name: {type: String, required: true, unqiue: true},
  gender: {type: String, default: 'male', required: true, unqiue: true},
  age: {type: Number, required: true, unqiue: true},
  isStudent: {type: Boolean},
  school: {type: String},
});

// Call the model function
module.exports = jsondb.model('User', User, 'user');

// if your User.js file is in another folder, else then do not add this line
const User = require('path-to-folder/User');

// Fetch one data
router.get('/name', async (req, res) => {
  const userdata = {
    name: req.body.name,
  };
  console.log(req.body);
  // Post the data using your exported model data
  try {
    const newUser = await User.findOne(userdata);
    res.status(200).json(newUser); //display user data
  } catch (err) {
    res.status(500).json(err); //display error message
  }
});
```

## .findById(req.params.id)

<h4>Example:</h4>

```javascript
const jsondb = require('@samuelpaschalson/json-db');

// Instantiate a new Schema
const User = new jsondb.Schema({
  name: {type: String, required: true, unqiue: true},
  gender: {type: String, default: 'male', required: true, unqiue: true},
  age: {type: Number, required: true, unqiue: true},
  isStudent: {type: Boolean},
  school: {type: String},
});

// Call the model function
module.exports = jsondb.model('User', User, 'user');

// if your User.js file is in another folder, else then do not add this line
const User = require('path-to-folder/User');

// Fetch one data
router.get('/find/:id', async (req, res) => {
  const userid = req.params.id;
  try {
    const newUser = await User.findById(userid);
    res.status(200).json(newUser); //display user data
  } catch (err) {
    res.status(500).json(err); //display error message
  }
});
```

## Using the ref just like mongoose

```
const School = new jsonDb.Schema(
    {
        userId: { type: String, ref: "User", required: true }, // Reference to User model
        image: { type: String, required: true },
        schoolName: { type: String, required: true },

    },
    { timestamps: true }
);

module.exports = School;


// Route to create a new School
router.post("/school/student", async (req, res) => {
    try {
        const { userId, image, schoolName } = req.body;

        // Check if the userId exists (reference validation)
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Create a new School
        const newSchool = await School.save({
            userId,
            image,
            schoolName
        });

        res.status(201).json(newSchool);
    } catch (error) {
        console.error("Error creating school:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Route to get all school made by a user
router.get("/users/:userId/school", async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find all school with the specified userId
        const userSchool = await School.findById(userId);

        res.json(userSchool);
    } catch (error) {
        console.error("Error fetching school:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
```
