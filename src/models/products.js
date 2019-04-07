var mongoose = require('mongoose');
var helper = require('../helper');
var productsSchema = new mongoose.Schema({
    orderID:{
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    price:{
        type:Number,        
        required:true
    },
    lowestSellPrice:{
        type:Number,        
        required:true
    },
    itemName:{
        type:String,
        trim:true,
        required:true
    },
    createdUser:{
        type: String,        
        required: true,
        trim: true
    },
    orderCreatedTime : {
        type:String,
        default:helper.timeCalc(),
        trim:true
    },
    bidUsers : [{
        email:{
            type: String,                             
            trim: true
        },
        bidPrice:{
            type: Number,                           
        }         
    }],
    executionStatus:{
        type:Boolean,
        default:false
    },
    maxPricedBid : [{
        email:{
            type: String,                    
            trim: true
        },
        bidPrice:{
            type: Number,                           
        }         
    }]    
});

productsSchema.index({orderID:1});
var Products = mongoose.model('Products', productsSchema);

module.exports = Products;