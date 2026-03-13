const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false,
    },
    role: {
        type: String,
        default: 'admin',
        enum: ['admin'],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    }
});

// Hash password before saving
adminSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Instance method to check password
adminSchema.methods.comparePassword = async function (candidatePassword, adminPassword) {
    return await bcrypt.compare(candidatePassword, adminPassword);
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
