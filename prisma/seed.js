const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  try {
    // Create admin user
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Delete existing admin user if exists
    await prisma.user.deleteMany({
      where: { email: 'isaacjohn@gmail.com' }
    });

    const adminUser = await prisma.user.create({
      data: {
        email: 'isaacjohn@gmail.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
      },
    });

    console.log('✅ Created admin user:', { id: adminUser.id, email: adminUser.email });

    // Create sample vendors
    console.log('Creating sample vendors...');
    
    // Delete existing vendors if they exist
    await prisma.payment.deleteMany({});
    await prisma.vendor.deleteMany({
      where: { 
        email: { in: ['supplier1@example.com', 'supplier2@example.com'] }
      }
    });

    const vendor1 = await prisma.vendor.create({
      data: {
        name: 'Tech Solutions Ltd',
        email: 'supplier1@example.com',
        phone: '+1-555-0123',
        address: '123 Tech Street, Silicon Valley, CA 94000',
        contactName: 'John Smith',
        status: 'ACTIVE',
      },
    });

    const vendor2 = await prisma.vendor.create({
      data: {
        name: 'Office Supplies Co',
        email: 'supplier2@example.com',
        phone: '+1-555-0456',
        address: '456 Business Ave, New York, NY 10001',
        contactName: 'Jane Doe',
        status: 'ACTIVE',
      },
    });

    console.log('✅ Created vendors:', { 
      vendor1: { id: vendor1.id, name: vendor1.name }, 
      vendor2: { id: vendor2.id, name: vendor2.name } 
    });

    // Create sample payments
    console.log('Creating sample payments...');
    const payment1 = await prisma.payment.create({
      data: {
        amount: 1500.00,
        description: 'Software licensing fees',
        status: 'PAID',
        paymentDate: new Date('2024-12-15'),
        dueDate: new Date('2024-12-20'),
        vendorId: vendor1.id,
      },
    });

    const payment2 = await prisma.payment.create({
      data: {
        amount: 250.75,
        description: 'Office supplies order #12345',
        status: 'PENDING',
        dueDate: new Date('2025-01-15'),
        vendorId: vendor2.id,
      },
    });

    console.log('✅ Created payments:', { 
      payment1: { id: payment1.id, amount: payment1.amount }, 
      payment2: { id: payment2.id, amount: payment2.amount } 
    });
    
    console.log('🎉 Seeding completed successfully!');
    console.log('🔑 Login credentials:');
    console.log('   Email: isaacjohn@gmail.com');
    console.log('   Password: isaac123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
