const mongoose = require('mongoose');
const uri = "mongodb+srv://bruce_wayne:Batman%40123@playmongo-iaepa.mongodb.net/BondE";
mongoose.connect(uri,{useCreateIndex:true,useNewUrlParser:true},(err)=>{
    (!err)?(console.log('Connected to db.')):(console.log('Error connecting to db.'));  
});

