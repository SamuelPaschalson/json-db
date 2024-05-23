const fs = require('fs');
const path = require('path');
const Schema = require('../schema');
const {v4: uuid} = require('uuid');
// const { Set } = require('imm')
const mysql = require('mysql');

class Model {
  constructor(name, Schema, db) {
    this.name = name;
    this.Schema = Schema;
    this.db = db + '.json';
    this.data = null;
    this.loaded = false; // Flag to track loading status
  }

  async load() {
    if (!this.loaded) {
      const dbFolderPath = path.join(
        process.cwd(),
        '\\node_modules\\@samuelpaschalson\\json-db\\lib\\db',
      );
      const dbPath = path.join(dbFolderPath, this.db);
      // console.log(process.cwd());
      try {
        await fs.promises.mkdir(dbFolderPath, {recursive: true}); // Create folder recursively
        console.log('Created "db" folder');
      } catch (err) {
        if (err.code !== 'EEXIST') {
          // Ignore EEXIST (folder already exists)
          console.error('Error creating "db" folder:', err);
        }
      }
      try {
        // Check if file exists
        await fs.promises.access(dbPath, fs.constants.F_OK);
        console.log('JSON file already exists, skipping creation.');
      } catch (err) {
        if (err.code === 'ENOENT') {
          // File not found, create it
          console.log('JSON file not found, creating...');
          await fs.promises.writeFile(dbPath, JSON.stringify([], null, 2)); // Create an empty JSON file
        } else {
          console.error('Error checking file:', err);
        }
      } finally {
        // Attempt to load data regardless of file creation (might be empty)
        try {
          const data = await fs.promises.readFile(dbPath, 'utf-8');
          this.data = JSON.parse(data);
          // this.updateUniqueFields();
          for (const item of this.data) {
            const validatedItem = this.validate(item);
            if (!validatedItem) {
              console.error('Invalid data found in JSON file:', item);
            }
          }
        } catch (err) {
          this.data = null; // Set data to null on error
          console.error('Error loading data:', err);
          throw new Error(`Error loading schema: ${err.message}`);
        }
        this.loaded = true; // Mark loading as complete
      }
    }
  }

  validate(data) {
    const errors = [];
    const seenValues = new Set();
    const sanitizedData = {};
    for (const field in this.Schema.definition) {
      const schemaField = this.Schema.definition[field];
      let value = data[field];
      // Default field validation
      if (!value) {
        sanitizedData[field] = schemaField.default;
      } else {
        sanitizedData[field] = value;
      }
    }
    for (const field in sanitizedData) {
      if (!this.Schema.definition[field]) {
        delete sanitizedData[field];
      } else {
        const schemaField = this.Schema.definition[field];
        // Required field validation
        if (schemaField.required && !sanitizedData[field]) {
          errors.push(`"${field}" is required`);
        }
        // ref validation
        if (schemaField.ref) {
          if (
            (typeof sanitizedData[field] || typeof data[field]) !== 'string' ||
            !this.isValidObjectId(sanitizedData[field] || data[field])
          ) {
            throw new Error(`"${field}" must be a valid ObjectId`);
          }
        }
        // Type validation
        switch (schemaField.type) {
          case String:
            if (
              (typeof sanitizedData[field] || typeof data[field]) !== 'string'
            ) {
              errors.push(`"${field}" must be a string`);
            } else {
              // const trimmedValue = sanitizedData[field].trim()
              if (
                this.Schema.definition[field].unique &&
                seenValues.has(sanitizedData[field])
              ) {
                errors.push(
                  `"${field}" value "${sanitizedData[field]}" must be unique`,
                );
              } else {
                seenValues.add(sanitizedData[field]);
              }
            }
            break;
          case Number:
            if (
              (typeof sanitizedData[field] || typeof data[field]) !==
                'number' ||
              isNaN(sanitizedData[field])
            ) {
              errors.push(`"${field}" must be a number`);
            }
            break;
          case Boolean:
            if (
              (typeof sanitizedData[field] || typeof data[field]) !== 'boolean'
            ) {
              errors.push(`"${field}" must be a boolean`);
            }
            break;
          case Array:
            if (!Array.isArray(sanitizedData[field] || data[field])) {
              errors.push(`"${field}" must be an array`);
            }
            break;
          // Add more type checks as needed
          default:
            break;
        }
      }
    }
    console.log(errors);
    return errors.length === 0 ? sanitizedData : null; // Return null for failed validation
  }

  isValidObjectId(id) {
    return typeof id === 'string' && id.length === 36; // Basic validation for UUIDs
  }

  async save(data) {
    // loads the json database data
    if (!this.data) {
      await this.load();
    }
    console.log(data);
    // Validate Data against Schema data
    const validatedData = this.validate(data);
    if (!validatedData) {
      throw new Error('Validation failed'); // Throw error on validation failure
    }
    // assign an id to the validated data, if the data has no id and add timestamps if timestamps is set
    if (this.Schema.options.timestamps === true) {
      const now = new Date();
      validatedData.createdAt = now.toISOString();
      validatedData.updatedAt = now.toISOString();
      if (validatedData._id !== undefined || null) {
        this.data.push(validatedData);
      } else if (validatedData._id === undefined || null) {
        validatedData._id = uuid();
        this.data.push(validatedData);
      }
    } else if (this.Schema.options.timestamps === undefined) {
      if (validatedData._id !== undefined || null) {
        this.data.push(validatedData);
      } else if (validatedData._id === undefined || null) {
        validatedData._id = uuid();
        this.data.push(validatedData);
      }
    }
    try {
      // database path
      const dbPath = path.join(
        process.cwd(),
        '\\node_modules\\@samuelpaschalson\\json-db\\lib\\db\\',
        this.db,
      );
      // sets the data up for storage
      const jsonData = JSON.stringify(this.data, null, 2);
      // saves the data in the database path file
      fs.writeFileSync(dbPath, jsonData);
      // display success message and returns the data
      console.log('Data saved to JSON file successfully!');
      return this.data;
    } catch (err) {
      // throws an error
      console.error('Error saving data to JSON file:', err);
    }
  }

  async findByIdAndUpdate(data, _id) {
    // loads the json database data
    if (!this.data) {
      await this.load();
    }
    // Validate Data against Schema data
    const validatedData = this.validate(data);
    if (!validatedData) {
      throw new Error('Validation failed'); // Throw error on validation failure
    }
    try {
      // finds the id against the data loaded from the database file
      const idData = this.data;
      const idIndex = idData.findIndex(find => find._id === _id);
      // if the id is found
      if (idIndex !== -1) {
        // update the timestamps to the found data, if timestamps is set
        if (this.Schema.options.timestamps === true) {
          const now = new Date();
          idData[idIndex].createdAt = now.toISOString();
          idData[idIndex].updatedAt = now.toISOString();
        }
        idData[idIndex] = {...idData[idIndex], ...validatedData}; // Update the data object
        // path of the database file
        const dbPath = path.join(
          process.cwd(),
          '\\node_modules\\@samuelpaschalson\\json-db\\lib\\db\\',
          this.db,
        );
        // sets up the data for storage
        const jsonData = JSON.stringify(idData, null, 2);
        // saves the data to the database file
        fs.writeFileSync(dbPath, jsonData);
        console.log('Data updated successfully!');
        return idData[idIndex]; // Return the updated data object
      } else {
        console.error('Data not found for update!');
        return null; // Indicate no update happened (optional)
      }
    } catch (err) {
      console.error('Error updating data:', err);
      throw err; // Re-throw the error for handling in the route
    }
  }

  async findByIdAndDelete(id) {
    // loads data from the database file
    if (!this.data) {
      await this.load();
    }
    try {
      // searches for the id in the data
      const deleteData = this.data;
      const deletedIndex = deleteData.findIndex(deleted => deleted._id === id);
      // deletes the data
      if (deletedIndex !== -1) {
        const deletedItem = deleteData.splice(deletedIndex, 1)[0]; // Remove the data at the found index
        const dbPath = path.join(
          process.cwd(),
          '\\node_modules\\@samuelpaschalson\\json-db\\lib\\db\\',
          this.db,
        );
        const jsonData = JSON.stringify(deleteData, null, 2);
        fs.writeFileSync(dbPath, jsonData);
        console.log('Data deleted successfully!');
        return deletedItem;
      } else {
        console.error('Data not found for deletion!');
        return null; // Indicate no update happened (optional)
      }
    } catch (err) {
      console.error('Error deleting data:', err);
      throw err; // Re-throw the error for handling in the route
    }
  }

  async aggregate(pipeline, data) {
    // loads data from the database file
    if (!this.data) {
      await this.load();
    }
    // Validate Data against Schema data
    const validatedData = this.data.filter(item => this.validate(item));
    if (!validatedData) {
      throw new Error('Validation failed'); // Throw error on validation failure
    }
    // duplicates the data
    let currentData = validatedData.slice();
    // Iterate through the pipeline and apply operations
    for (const stage of pipeline) {
      // checks if pipeline has a data or is null, then starts the operations
      const operation = stage.$match ? Object.keys(stage)[0] : null;
      const operations = stage.$sample ? Object.keys(stage)[0] : null;
      const operation11 = stage.$group ? Object.keys(stage)[0] : null;
      const operation1 = stage.$project ? Object.keys(stage)[0] : null;
      const operations1 = stage.$sort ? Object.keys(stage)[0] : null;
      const operation2 = stage.$skip ? Object.keys(stage)[0] : null;
      const operations2 = stage.$limit ? Object.keys(stage)[0] : null;
      switch (
        operation ||
        operations ||
        operation11 ||
        operation1 ||
        operations1 ||
        operation2 ||
        operations2
      ) {
        // $match operation
        case '$match':
          currentData = currentData.filter(item => {
            for (const key in stage.$match) {
              if (item[key] !== stage.$match[key]) {
                return false;
              }
            }
            return true;
          });
          break;
        // $group operations
        case '$group':
          const {_id, ...groupFields} = stage.$group;
          currentData = currentData.reduce((acc, item) => {
            const groupKey = _id ? _id(item) : item;
            const existingGroup = acc.find(g => g._id === groupKey);
            if (existingGroup) {
              for (const field in groupFields) {
                existingGroup[field] += groupFields[field](item);
              }
            } else {
              acc.push({
                _id: groupKey,
                ...Object.entries(groupFields).reduce(
                  (obj, [field, fn]) => ({...obj, [field]: fn(item)}),
                  {},
                ),
              });
            }
            return acc;
          }, []);
          break;
        // $project operations
        case '$project':
          currentData = currentData.map(item =>
            this.projectItem(item, $project),
          ); // Apply projection
          break;
        // $sort operations
        case '$sort':
          data.sort((a, b) => this.sortItems(a, b, $sort)); // Sort data based on criteria
          break;
        // $limit operations
        case '$limit':
          currentData = currentData.slice(0, $limit); // Limit the number of returned items
          break;
        // $skip operations
        case '$skip':
          currentData = currentData.slice($skip); // Skip a specific number of items
          break;
        // $sample operations
        case '$sample':
          const randomData = [];
          for (let index = 0; index < stage.$sample; index++) {
            const randomIndex = Math.floor(Math.random() * currentData.length);
            randomData.push(currentData[randomIndex]);
          }
          currentData = randomData;
          break;
        // Add more cases for other pipeline stages ($project, $sort, etc.)
        default:
          console.warn(`Unsupported pipeline stage: ${operation}`);
      }
    }
    // returns the pipelined data
    return currentData;
  }

  projectItem(item, projection) {
    const projectedItem = {};
    for (const field in projection) {
      projectedItem[field] = item[projection[field]]; // Include specified fields
    }
    return projectedItem;
  }

  sortItems(item1, item2, sortCriteria) {
    const sortField = Object.keys(sortCriteria)[0]; // Assuming single sort field
    const sortOrder = sortCriteria[sortField]; // Ascending (1) or descending (-1)

    // Implement comparison logic based on your data types
    if (item1[sortField] < item2[sortField]) {
      return sortOrder === 1 ? -1 : 1;
    } else if (item1[sortField] > item2[sortField]) {
      return sortOrder === 1 ? 1 : -1;
    }
    return 0; // Equal values
  }

  async getAll() {
    // loads the data from the json database file
    if (!this.data) {
      await this.load();
    }
    try {
      // returns the data
      return this.data;
    } catch (err) {
      console.error('Error retrieving data:', err);
      throw err; // Re-throw the error for handling in the route
    }
  }

  async findOne(query) {
    const errors = [];

    // loads the data
    if (!this.data) {
      await this.load();
    }
    try {
      // searches the data for the query and returns the result
      const result = this.data.find(item => {
        for (const key in query) {
          console.log(item);
          if (item[key] === query[key]) {
            return true;
          } else {
            errors.push(`"${item[key]}" is not equal to "${query[key]}"`);
            return false;
          }
        }
      });
      console.log(errors);
      return result;
      // console.log(errors);
      // return errors.length === 0 ? result : null;
    } catch (err) {
      console.error('Error retrieving data:', err);
      throw err; // Re-throw the error for handling in the route
    }
  }

  async findById(id) {
    // loads the data
    if (!this.data) {
      await this.load();
    }
    try {
      console.log(id);
      // finds the id against the data loaded from the database file
      const idData = this.data;
      const idIndex = idData.findIndex(find => find._id === id);
      // if the id is found
      if (idIndex !== -1) {
        return idData[idIndex]; // Return the updated data object
      } else {
        console.error('Data not found for update!');
        return null; // Indicate no update happened (optional)
      }
    } catch (err) {
      console.error('Error retrieving data:', err);
      throw err; // Re-throw the error for handling in the route
    }
  }

  async moveKeyToBottom(obj, keyToMove) {
    console.log(keyToMove);
    if (!obj.hasOwnProperty(keyToMove)) {
      return obj;
    }
    const {[keyToMove]: value, ...rest} = obj;
    return {...rest, [keyToMove]: value};
  }

  async findOneAndUpdate(filter, update) {
    // load the json database data
    if (!this.data) {
      await this.load();
    }
    const validatedData = this.validate(update);
    if (!validatedData) {
      throw new Error('Validation failed'); // Throw error on validation failure
    }
    const index = this.data.findIndex(item => {
      for (const key in filter) {
        if (item[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });

    if (index !== -1) {
      // Update existing document
      const updatedDocument = {...this.data[index], ...update};
      const updatedt = await this.moveKeyToBottom(updatedDocument, 'createdAt');
      const updatedt1 = await this.moveKeyToBottom(updatedt, 'updatedAt');
      const updatedt2 = await this.moveKeyToBottom(updatedt1, '_id');
      if (this.Schema.options.timestamps === true) {
        const now = new Date();
        updatedt2.createdAt = now.toISOString();
        updatedt2.updatedAt = now.toISOString();
      }
      this.data[index] = updatedt2;
    } else {
      // Create new document if not found
      const newDocument = {...update};
      // assign an id to the validated data, if the data has no id and add timestamps if timestamps is set
      if (this.Schema.options.timestamps === true) {
        const now = new Date();
        newDocument.createdAt = now.toISOString();
        newDocument.updatedAt = now.toISOString();
        if (newDocument._id !== undefined || null) {
          this.data.push(validatedData);
        } else if (validatedData._id === undefined || null) {
          newDocument._id = uuid();
          this.data.push(newDocument);
        }
      } else if (this.Schema.options.timestamps === undefined) {
        if (newDocument._id !== undefined || null) {
          this.data.push(newDocument);
        } else if (newDocument._id === undefined || null) {
          newDocument._id = uuid();
          this.data.push(newDocument);
        }
      }
    }
    try {
      // database path
      const dbPath = path.join(
        process.cwd(),
        '\\node_modules\\@samuelpaschalson\\json-db\\lib\\db\\',
        this.db,
      );
      // sets the data up for storage
      const jsonData = JSON.stringify(this.data, null, 2);
      // saves the data in the database path file
      fs.writeFileSync(dbPath, jsonData);
      // display success message and returns the data
      console.log('Data saved to JSON file successfully!');
      return this.data;
    } catch (err) {
      // throws an error
      console.error('Error saving data to JSON file:', err);
    }
  }
  async Mongoose() {}
  async Mysql(connector, tableName) {
    // MySQL database connection configuration
    const connection = mysql.createConnection(connector);
    connection.connect(err => {
      if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
      }
      console.log('Connected to MySQL database');
    });
    // loads the data from the json database file
    if (!this.data) {
      await this.load();
    }
    try {
      // Insert each record into the database
      this.data.forEach(record => {
        const columns = Object.keys(record).join(', ');
        const values = Object.values(record);
        const placeholders = values.map(() => '?').join(', ');
        const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
        connection.query(sql, values, (err, result) => {
          if (err) {
            console.error('Error inserting record:', err);
          } else {
            console.log(`Inserted record with ID ${result.insertId}`);
          }
        });
      });
      const resultMessage = {
        message: `Your data has been pushed to MYSQL`,
      };
      return resultMessage;
    } catch (err) {
      // throws an error
      console.error('Error pushing data to Mysql Database:', err);
    }
  }
}

module.exports = Model;
