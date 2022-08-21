const {
    Schema,
    model
} = require('mongoose');

const UserSchema = new Schema({
    chatId: {
        type: String,
        unique: true,
        required: true
    },
    username: {
        type: String
    },
    lastPurchased: [{
        Login: String,
        Pass: String,
        Info: String,
        bankName: String,
        price: Number,
        date: String,
    }],
    balance: {
        type: Number
    },
    countPurchased: {
        type: Number
    },
})

module.exports = model('User', UserSchema);