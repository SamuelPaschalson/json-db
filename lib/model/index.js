
const fs = require('fs');
const path = require('path');
const Schema = require('../schema');

class Model {
  constructor(name, Schema) {
    this.name = name;
    this.Schema = Schema;
  }

  async getAll(dataPath) {
    const data = await fs.promises.readFile(dataPath, 'utf8');
    return JSON.parse(data) || [];
  }

  async save(dataPath) {
    try {
      const saveData = await fs.readFile(dataPath, 'utf-8');
      console.log(saveData);
      const save = JSON.parse(saveData) || [];

      save.push(this); // Add the new movie to the array

      await fs.writeFile(dataPath, JSON.stringify(save, null, 2));
      console.log('Data saved to JSON file successfully!');
    } catch (err) {
      console.error('Error saving data to JSON file:', err);
    }
  }
  
  async findByIdAndUpdate(dataPath,updates) {
    try {
      const findsData = await fs.readFile(dataPath, 'utf-8');
      const finds = JSON.parse(findsData) || [];
  
      const findIndex = finds.findIndex(find => find.id === this.id);
  
      if (findIndex !== -1) {
        finds[findIndex] = { ...finds[findIndex], ...updates }; // Update the data object
        await fs.writeFile(dataPath, JSON.stringify(finds, null, 2));
        console.log('Data updated successfully!');
        return finds[findIndex]; // Return the updated data object
      } else {
        console.error('Data not found for update!');
        return null; // Indicate no update happened (optional)
      }
    } catch (err) {
      console.error('Error updating data:', err);
      throw err; // Re-throw the error for handling in the route
    }
  }

  async findByIdAndDelete(dataPath, deleteId) {
    try {
      const deletesData = await fs.readFile(dataPath, 'utf-8');
      const deletes = JSON.parse(deletesData) || [];
  
      const deletedIndex = deletes.findIndex(deleted => deleteId === this.id);
  
      if (deletedIndex !== -1) {
        deletes.splice(deletedIndex, 1); // Remove the movie at the found index
        await fs.writeFile(dataPath, JSON.stringify(deletes, null, 2));
        console.log('Data deleted successfully!');
      } else {
        console.error('Data not found for deletion!');
        return null; // Indicate no update happened (optional)
      }
    } catch (err) {
      console.error('Error deleting data:', err);
      throw err; // Re-throw the error for handling in the route
    }
  }

  async aggregate(dataPath, filters = {}, sampleSize = 1) {
    try {
      const aggregateData = await fs.readFile(dataPath, 'utf-8');
      const aggregate = JSON.parse(aggregateData) || [];
      // Filter aggregate based on provided filters (assuming simple object comparisons)
      const filteredAggregate = aggregate.filter(aggregates => {
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
        console.log(sampledAggregate);
      // return sampledAggregate;
      const randomAggregatesIndex = Math.floor(Math.random() * sampledAggregate.length);
      const randomAggregates = sampledAggregate[randomAggregatesIndex];
  
      return randomAggregates;
    } catch (err) {
      console.error('Error aggregating data:', err);
      throw err; // Re-throw the error for handling in the route
    }
  }

}

module.exports = Model;