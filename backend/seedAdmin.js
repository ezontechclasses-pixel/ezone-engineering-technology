require('dotenv').config();
const connectDB = require('./config/db');
const Admin = require('./models/Admin');

const seedAdmin = async () => {
  try {
    await connectDB();

    const email = process.env.ADMIN_SEED_EMAIL || 'ezontechclasses@gmail.com';
    const password = process.env.ADMIN_SEED_PASSWORD || 'admin123456';

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });

    if (existingAdmin) {
      console.log(`ℹ️ Admin with email "${email}" already exists. Skipping creation.`);
      process.exit(0);
    }

    await Admin.create({
      email,
      password,
    });

    console.log(`✅ Admin account created successfully for: ${email}`);
    process.exit(0);
  } catch (err) {
    console.error(`❌ Error seeding admin: ${err.message}`);
    process.exit(1);
  }
};

seedAdmin();
