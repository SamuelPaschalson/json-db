
const fs = require('fs');
const path = require('path');
const Schema = require('../schema');
const { v4: uuid } = require("uuid")
// const { Set } = require('imm')

class Model {
  constructor(name, Schema, db) {
    this.name = name;
    this.Schema = Schema;
    this.db = db + '.json';
    this.data = null;
    this.loaded = false; // Flag to track loading status
  }
  
  async load(){
    if (!this.loaded) {
      const dbPath = path.join(process.cwd(), "\\node_modules\\@samuelpaschalson\\json-db\\lib\\db\\", this.db);
      console.log(process.cwd());
      try {
        // Check if file exists
        await fs.promises.access(dbPath, fs.constants.F_OK);
        console.log('JSON file already exists, skipping creation.');
      } catch (err) {
        if (err.code === 'ENOENT') { // File not found, create it
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
            const validatedItem = this.validate(item)
            if (!validatedItem) {
              console.error('Invalid data found in JSON file:', item)
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
      // console.log(data);
      let value = data[field];
      // console.log(value);
      // Default field validation
      if (!value) {
        sanitizedData[field] = schemaField.default;
      } else{
        sanitizedData[field] = value;
      }
    }
    for (const field in sanitizedData) {
      if (!this.Schema.definition[field]) {
        delete sanitizedData[field]
      } else{
        const schemaField = this.Schema.definition[field];
        // Required field validation
        if (schemaField.required && !sanitizedData[field]) {
          errors.push(`"${field}" is required`);
        }
        // Type validation
        switch (schemaField.type) {
          case String:
            if ((typeof sanitizedData[field] || typeof data[field]) !== 'string') {
              errors.push(`"${field}" must be a string`);
            } else{
              // const trimmedValue = sanitizedData[field].trim()
              if (this.Schema.definition[field].unique && seenValues.has(sanitizedData[field])) {
                errors.push(`"${field}" value "${sanitizedData[field]}" must be unique`)
              } else {
                seenValues.add(sanitizedData[field])
              }
            }
            break;
          case Number:
            if ((typeof sanitizedData[field] || typeof data[field]) !== 'number' || isNaN(sanitizedData[field])) {
              errors.push(`"${field}" must be a number`);
            }
            break;
          case Boolean:
            if ((typeof sanitizedData[field] || typeof data[field]) !== 'boolean') {
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

  async save(data) {
    // loads the json database data
    if (!this.data) {
      await this.load();
    }
    // Validate Data against Schema data
    const validatedData = this.validate(data);
    if (!validatedData) {
      throw new Error('Validation failed'); // Throw error on validation failure
    }
    // assign an id to the validated data, if the data has no id
    validatedData._id = uuid();
    // push the validated data with id to the database data
    this.data.push(validatedData);
    try {
      // database path
      const dbPath = path.join(process.cwd(), "\\node_modules\\@samuelpaschalson\\json-db\\lib\\db\\", this.db);
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
      const idIndex = idData.findIndex(find => find.id === idData._id);
      // if the id is found
      if (idIndex !== -1) {
        idData[idIndex] = { ...idData[idIndex], ...validatedData }; // Update the data object
        // path of the database file
        const dbPath = path.join(process.cwd(), "\\node_modules\\@samuelpaschalson\\json-db\\lib\\db\\", this.db);
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
      const deletedIndex = deleteData.findIndex((deleted) => deleted._id === id);
      // deletes the data
      if (deletedIndex !== -1) {
        const deletedItem = deleteData.splice(deletedIndex, 1)[0]; // Remove the data at the found index
        const dbPath = path.join(process.cwd(), "\\node_modules\\@samuelpaschalson\\json-db\\lib\\db\\", this.db);
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
      switch (operation || operations || operation11 || operation1 || operations1 || operation2 || operations2) {
        // $match operation
        case '$match':
          currentData = currentData.filter((item) => {
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
          const { _id, ...groupFields } = stage.$group;
          currentData = currentData.reduce((acc, item) => {
            const groupKey = _id ? _id(item) : item;
            const existingGroup = acc.find((g) => g._id === groupKey);
            if (existingGroup) {
              for (const field in groupFields) {
                existingGroup[field] += groupFields[field](item);
              }
            } else {
              acc.push({ _id: groupKey, ...Object.entries(groupFields).reduce((obj, [field, fn]) => ({ ...obj, [field]: fn(item) }), {}) });
            }
            return acc;
          }, []);
          break;
        // $project operations
        case '$project':
          currentData = currentData.map((item) => this.projectItem(item, $project)); // Apply projection
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
    // loads the data
    if (!this.data) {
      await this.load();
    }
    try{
      // searches the data for the query and returns the result
      const result = this.data.find((item) => {
        for (const key in query) {
          if (item[key] !== query[key]) {
            return false;
          }
        }
        return true;
      });
      console.log(result);
      return result;
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
    try{
      // finds the id against the data loaded from the database file
      const idData = this.data;
      const idIndex = idData.findIndex(find => find._id === id);
      console.log(id);
      // if the id is found
      if (idIndex !== -1) {
        console.log(idIndex);
        // console.log(idData);
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


}

module.exports = Model;