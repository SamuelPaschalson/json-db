
const fs = require('fs');
const path = require('path');
const Schema = require('../schema');
const { v4: uuid } = require("uuid")

class Model {
  constructor(name, Schema, db) {
    this.name = name;
    this.Schema = Schema;
    this.db = db + '.json';
    this.data = null;
  }
  
  async create(folderName, fileName){
    try{
      const dbPath = path.join(folderName, fileName);
      const jsonData = JSON.stringify([], null, 2);
      await fs.promises.writeFile(dbPath, jsonData);
      console.log('file created successfully');
    } catch (err) {
      console.error('Error saving data to JSON file:', err);
    }
  }

  async load(){
    const check = !fs.existsSync(process.cwd(), "\\jsondb\\package\\lib\\db\\", this.db);
    const isFalse = fs.statSync(process.cwd(), "\\jsondb\\package\\lib\\db\\", this.db).isFile()
    if (check === false && isFalse === false) {
      await this.create((process.cwd()+ "\\jsondb\\package\\lib\\db\\"), this.db);
    }
    // console.log(fs.statSync(process.cwd(), "\\jsondb\\package\\lib\\db\\", this.db).isFile());
    try {
      const dbPath = path.join(process.cwd(), "\\jsondb\\package\\lib\\db\\", this.db);
      console.log(dbPath);
      const response = await fs.promises.readFile(dbPath, 'utf-8');
      const data = JSON.parse(response) || [];
      this.data = data;
    } catch (error){
      console.error(`Error loading data from ${this.db}`, error)
    }
  }

  async save(data) {
    const validateErrors = [];
    for (const field in this.Schema) {
      if (!this.Schema[field] && !data[field]) {
        validateErrors.push(`Field '${field}' is required but missing`)
      }
    }
    if (validateErrors.length) {
      throw new Error(`Validation errors: ${validateErrors.join(', ')}`)
    }
    if (!this.data) {
      await this.load();
    }
    console.log(this.data);
    data._id = uuid();
    this.data.push(data);
    try {
      const dbPath = path.join(process.cwd(), "\\jsondb\\package\\lib\\db\\", this.db);
      const jsonData = JSON.stringify(this.data, null, 2);
      fs.writeFileSync(dbPath, jsonData);
      console.log('Data saved to JSON file successfully!');
      return this.data
    } catch (err) {
      console.error('Error saving data to JSON file:', err);
    }
  }
  
  async findByIdAndUpdate(id, data) {
    const validateErrors = [];
    for (const field in this.Schema) {
      if (!this.Schema[field] && !data[field]) {
        validateErrors.push(`Field '${field}' is required but missing`)
      }
    }
    if (validateErrors.length) {
      throw new Error(`Validation errors: ${validateErrors.join(', ')}`)
    }
    if (!this.data) {
      await this.load();
    }
    try {
      const idData = this.data;
      const idIndex = idData.findIndex(find => find.id === idData._id);
      
      if (idIndex !== -1) {
        idData[idIndex] = { ...idData[idIndex], ...data }; // Update the data object
        const dbPath = path.join(process.cwd(), "\\jsondb\\package\\lib\\db\\", this.db);
        const jsonData = JSON.stringify(idData, null, 2);
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
    const validateErrors = [];
    for (const field in this.Schema) {
      if (!this.Schema[field] && !data[field]) {
        validateErrors.push(`Field '${field}' is required but missing`)
      }
    }
    if (validateErrors.length) {
      throw new Error(`Validation errors: ${validateErrors.join(', ')}`)
    }
    if (!this.data) {
      await this.load();
    }
    try {
      const deleteData = this.data;
      const deletedIndex = deleteData.findIndex((deleted) => deleted._id === id);
      if (deletedIndex !== -1) {
        const deletedItem = deleteData.splice(deletedIndex, 1)[0]; // Remove the movie at the found index
        const dbPath = path.join(process.cwd(), "\\jsondb\\package\\lib\\db\\", this.db);
        const jsonData = JSON.stringify(deleteData, null, 2);
        fs.writeFileSync(dbPath, jsonData);
        console.log('Data deleted successfully!');
        return deletedItem
      } else {
        console.error('Data not found for deletion!');
        return null; // Indicate no update happened (optional)
      }
    } catch (err) {
      console.error('Error deleting data:', err);
      throw err; // Re-throw the error for handling in the route
    }
  }

  async aggregate(filters = {}, sampleSize) {
    const validateErrors = [];
    for (const field in this.Schema) {
      if (!this.Schema[field] && !data[field]) {
        validateErrors.push(`Field '${field}' is required but missing`)
      }
    }
    if (validateErrors.length) {
      throw new Error(`Validation errors: ${validateErrors.join(', ')}`)
    }
    if (!this.data) {
      await this.load();
    }
    try {
      const filteredAggregate = this.data.filter((aggregates) => {
        let matches = true;
        for (const key in filters) {
          if (aggregates[key] !== filters[key]) {
            matches = false;
            break;
          }
        }
        return matches;
      });
      // Sample the filtered aggregate if sampleSize is provided
      const sampledAggregate = sampleSize
      ? filteredAggregate.sort(() => 0.5 - Math.random()).slice(0, sampleSize)
      : filteredAggregate;

      const randomMovieIndex = Math.floor(Math.random() * sampledAggregate.length);
      const randomMovie = sampledAggregate[randomMovieIndex];
      console.log(randomMovie);
      return randomMovie;
    } catch (err) {
      console.error('Error aggregating data:', err);
      throw err; // Re-throw the error for handling in the route
    }
  }

  async getAll() {
    const validateErrors = [];
    for (const field in this.Schema) {
      if (!this.Schema[field] && !data[field]) {
        validateErrors.push(`Field '${field}' is required but missing`)
      }
    }
    if (validateErrors.length) {
      throw new Error(`Validation errors: ${validateErrors.join(', ')}`)
    }
    if (!this.data) {
      await this.load();
    }
    try {
      return this.data;
    } catch (err) {
      console.error('Error retrieving data:', err);
      throw err; // Re-throw the error for handling in the route
    }
  }

  async findOne(data){
    const validateErrors = [];
    for (const field in this.Schema) {
      if (!this.Schema[field] && !data[field]) {
        validateErrors.push(`Field '${field}' is required but missing`)
      }
    }
    if (validateErrors.length) {
      throw new Error(`Validation errors: ${validateErrors.join(', ')}`)
    }
    if (!this.data) {
      await this.load();
    }
    try {
      const idData = this.data;
      const idIndex = idData.findIndex((find) => find.data === idData.data);
      console.log(idIndex);
      console.log(data);
      if (idIndex !== -1) {
        // idData[idIndex] = { ...idData[idIndex], ...data }; // Update the data object
        // const dbPath = path.join(process.cwd(), "\\jsondb\\package\\lib\\db\\", this.db);
        // const jsonData = JSON.stringify(idData, null, 2);
        // fs.writeFileSync(dbPath, jsonData);
        console.log('Data displayed successfully!');
        return idData[idIndex]; // Return the updated data object
      } else {
        console.error('Data not found!');
        return null; // Indicate no update happened (optional)
      }
    } catch (err) {
      console.error('Error updating data:', err);
      throw err; // Re-throw the error for handling in the route
    }
  }

}


// function Model(name, Schema){
//   if (!name && !Schema) {
//     throw new TypeError('name and schema is required')
//   }

//   async function getAll(dataPath) {
//     const data = await fs.promises.readFile(dataPath, 'utf8');
//     return JSON.parse(data) || [];
//   }
//   return getAll;
  
//   async function save(dataPath) {
//     try {
//       const saveData = await fs.readFile(dataPath, 'utf-8');
//       console.log(saveData);
//       const save = JSON.parse(saveData) || [];

//       save.push(this); // Add the new movie to the array

//       await fs.writeFile(dataPath, JSON.stringify(save, null, 2));
//       console.log('Data saved to JSON file successfully!');
//     } catch (err) {
//       console.error('Error saving data to JSON file:', err);
//     }
//   }
// }

module.exports = Model;