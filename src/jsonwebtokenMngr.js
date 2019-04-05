const fs   = require('fs');
const jwt  = require('jsonwebtoken');
let jwtToken = {};
// PRIVATE and PUBLIC key
const dir = __dirname
const privateKEY  = fs.readFileSync(dir+'/../keys/private.key', 'utf8');
const publicKEY  = fs.readFileSync(dir+'/../keys/public.key', 'utf8');
let i  = 'Mysoft corp';          // Issuer 
let s  = 'some@user.com';        // Subject 
let a  = 'http://mysoftcorp.in'; // Audience
// SIGNING OPTIONS
let signOptions = {
    issuer:  i,
    subject:  s,
    audience:  a,
    expiresIn:  "30d",
    algorithm:  "RS256"
};
let verifyOptions = {
    issuer:  i,
    subject:  s,
    audience:  a,
    expiresIn:  "30d",
    algorithm:  ["RS256"]
};
jwtToken.jwtTokenGen = (payload) => {    
    return jwt.sign(payload, privateKEY, signOptions);        
}
jwtToken.verify = (token) => {
    try{
        return jwt.verify(token, publicKEY, verifyOptions);
    }catch (err){
        return false;
    }
}
jwtToken.decode = (token) => {
    return jwt.decode(token, {complete: true});
    //returns null if token is invalid
 }
module.exports = jwtToken;