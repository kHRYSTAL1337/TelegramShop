const {Schema, model} = require('mongoose');


const CatalogSchema = new Schema({
    bankName: {type: String, unique: true},
    country: {type: String},
    account: [
        {
            Login: {type: String},
            Pass: {type: String},
            Price: {type: String},
            Info: {type: String},
            prebuyinfo: {type: String},
            BA: {type: String},
        }
    ]
})

module.exports = model('Catalog', CatalogSchema);