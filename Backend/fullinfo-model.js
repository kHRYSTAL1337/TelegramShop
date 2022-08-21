const {Schema, model} = require('mongoose');


const FullInfoSchema = new Schema({
    State: {type: String, unique: true},
    data: [
        {
            Info: {type: String},
            Price: {type: String},
            state: {type: String},
        }
    ]
})

module.exports = model('FullInfo', FullInfoSchema);