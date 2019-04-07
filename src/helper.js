const bcrypt = require('bcrypt');
const User = require('./models/users');

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
helper.timeCalc = ()=>{
    let time = new Date();
    let Date_t = time.getDate().toString()
    Date_t = (Date_t.length === 1) ? ('0'+Date_t):Date_t;
    let Month = (time.getMonth()+1).toString();
    Month = (Month.length === 1) ? ('0'+Month):Month;
    let hour = time.getHours().toString();
    hour = (hour.length === 1) ? ('0'+hour):hour;
    let minute = time.getMinutes().toString();
    minute = (minute.length === 1) ? ('0'+minute):minute;
    time =  Date_t+ "-" + Month + "-" + time.getFullYear()+" "+hour+":"+minute;
    return time;
}
helper.orderIDGen = (length=64) => {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
    if (! length) {
        length = Math.floor(Math.random() * chars.length);
    }
    var str = '';
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}
module.exports = helper;
