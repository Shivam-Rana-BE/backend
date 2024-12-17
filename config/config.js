import "dotenv/config";

const config ={
  "development": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "port":process.env.DB_PORT,
    "dialect": "postgres",
    'dialectOptions': {
      'ssl': {
        'require': true,
        'rejectUnauthorized': false, // Allow self-signed SSL certificates
      },
    },
    'logging': false,
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}

export default config
