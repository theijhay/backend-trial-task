const { PrismaClient } = require('@prisma/client');
const createPrismaClient = () => {
  const dbUrl = process.env.DATABASE_URL;
  
  if (dbUrl) {
    console.log('Using DATABASE_URL connection');
    return new PrismaClient();
  }
  
  // Fallback to individual parameters
  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_SSL } = process.env;
  
  if (DB_HOST && DB_PORT && DB_NAME && DB_USER && DB_PASSWORD) {
    const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}${DB_SSL === 'true' ? '?sslmode=require' : ''}`;
    console.log('Using individual parameters connection');
    console.log('Connection string:', connectionString);
    
    return new PrismaClient({
      datasources: {
        db: {
          url: connectionString
        }
      }
    });
  }
  
  throw new Error('No database connection parameters found');
};

module.exports = { createPrismaClient };
