const bcrypt = require('bcrypt');
const User = require('./models/user');

const saltRounds = 10;

var helper = {};

helper.hash = (Password)=>{    
    return bcrypt.hashSync(Password, saltRounds);
}

helper.compare = (Password,hash)=>{
    if(bcrypt.compareSync(Password, hash)) {        
        return true;
    } else {        
        return false;
    }
}

module.exports = helper;
