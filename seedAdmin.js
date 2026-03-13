const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

const seedAdmin = async () => {
    try {
        console.log(`Connecting to: ${process.env.MONGO_URI}`);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected.');

        const email = process.env.ADMIN_EMAIL || 'admin@automationowl.com';
        const password = process.env.ADMIN_PASSWORD || 'admin123';

        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            console.log(`Admin user ${email} already exists! Replacing password...`);
            existingAdmin.password = password;
            await existingAdmin.save();
            console.log('Password updated successfully.');
        } else {
            console.log(`Creating admin user: ${email}`);
            await Admin.create({
                name: 'Super Admin',
                email: email,
                password: password,
                role: 'admin'
            });
            console.log('Admin created successfully.');
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
        process.exit(0);
    }
};

seedAdmin();
