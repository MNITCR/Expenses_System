const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Please enter user name"],
        },
        email: {
            type: String,
            required:  true
        },
        password: {
            type: String,
            required:  true
        },
        role: {
            type: String,
            required:  true,
            enum: ["admin", "manager"]
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', userSchema);
