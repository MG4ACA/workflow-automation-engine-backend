/**
 * Database configuration and Prisma client setup
 * Provides centralized database access for the application
 */

const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client with error formatting and logging
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
});

/**
 * Connect to database
 */
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

/**
 * Disconnect from database
 */
async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
  }
}

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase,
};
