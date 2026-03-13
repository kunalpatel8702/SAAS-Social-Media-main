/**
 * One-time cleanup script: removes duplicate UserSubscription records.
 * For each user+service combination, keeps only the most recently created
 * subscription and deletes all older duplicates.
 *
 * Usage (run from Backend/ directory):
 *   node scripts/cleanupDuplicateSubscriptions.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const UserSubscription = require('../models/UserSubscription');

const run = async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error('❌  MONGO_URI not set in .env');
        process.exit(1);
    }

    console.log('🔗  Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
    });
    console.log('✅  Connected.');

    // Fetch all subscriptions, newest first
    const all = await UserSubscription.find({}).sort({ createdAt: -1 });
    console.log(`📋  Total subscription records: ${all.length}`);

    const seen = new Map(); // "userId_serviceId" → true
    const toDelete = [];

    for (const sub of all) {
        const userId    = sub.user?.toString();
        const serviceId = sub.service?.toString();
        if (!userId || !serviceId) continue;

        const key = `${userId}_${serviceId}`;
        if (seen.has(key)) {
            toDelete.push(sub._id);
        } else {
            seen.set(key, true);
        }
    }

    if (toDelete.length === 0) {
        console.log('✨  No duplicates found. Nothing to clean up.');
    } else {
        console.log(`🗑️   Found ${toDelete.length} duplicate record(s). Deleting...`);
        const result = await UserSubscription.deleteMany({ _id: { $in: toDelete } });
        console.log(`✅  Deleted ${result.deletedCount} duplicate subscription(s).`);
    }

    await mongoose.disconnect();
    console.log('🔌  Disconnected. Done!');
    process.exit(0);
};

run().catch(err => {
    console.error('❌  Script failed:', err.message);
    process.exit(1);
});
