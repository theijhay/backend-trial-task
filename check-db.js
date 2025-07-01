const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('Checking database connection...');
    
    // Check if users exist
    const users = await prisma.user.findMany();
    console.log('Users in database:', users.length);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
    });

    // Check if vendors exist
    const vendors = await prisma.vendor.findMany();
    console.log('Vendors in database:', vendors.length);
    vendors.forEach(vendor => {
      console.log(`- ${vendor.name} (${vendor.email})`);
    });

    // Check if payments exist
    const payments = await prisma.payment.findMany();
    console.log('Payments in database:', payments.length);

  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
