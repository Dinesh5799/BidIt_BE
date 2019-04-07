var mongoose = require('mongoose');
var user_info = new mongoose.Schema({
    userID:{
        type: String,
        unique: true,
        required: true,
        trim: true
    },        
    buyOrders : [{
        orderID:{
            type: String,                    
            trim: true
        }
    }],
    sellOrders : [{
        orderID:{
            type: String,                    
            trim: true
        }
    }],
    executedOrders : [{
        orderID:{
            type: String,                    
            trim: true
        }
    }]    
});
var SinUserInfo = mongoose.model('UserInfo', user_info);
module.exports = SinUserInfo;