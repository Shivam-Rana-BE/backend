import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize, DataTypes } from 'sequelize';
import configFile from '../../config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.NODE_ENV || 'development';
const config = configFile[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], {
    ...config,
    // logging: console.log, 
  });
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      ...config,
      // logging: console.log, 
    }
  );
}

// Dynamically load models from the 'models' directory

// Dynamically load models
const modelFiles = fs.readdirSync(__dirname)
  .filter(file => file.indexOf('.') !== 0 && file !== path.basename(__filename) && file.slice(-3) === '.js');
for (const file of modelFiles) {
  const modelPath = new URL(file, import.meta.url).href;
  const { default: model } = await import(modelPath);
  const modelInstance = model(sequelize, DataTypes);
  db[modelInstance.name] = modelInstance; // Attach to db object
}

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db); // Set up associations if defined
  }
});

// Log the available models
console.log('Available models:', Object.keys(db));

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
