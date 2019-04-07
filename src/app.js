const express = require('express');
const app = express();
const Port = process.env.PORT || 3001;
require('./mongo/mongo');
const User = require('./models/users');
const Products = require('./models/products');
const SinUserInfo = require('./models/user_prods');
const jwt = require('./jsonwebtokenMngr');
const helper = require('./helper');

app.use(express.json());
app.use(express.static('public'));
// app.use((_req, res, next) => {    
//     res.header('Access-Control-Expose-Headers', 'X-auth-token');
//     res.header('Access-Control-Allow-Headers', 'X-auth-token');    
//     next();
// });
app.post('/api/login',     (req,res)=>{
    try{
        let email = req.body.email;
        let password = req.body.password;     
        User.find({email})
        .then((result)=>{   
            console.log(result);
            if(result){        
                let dbPassword = result[0].password;                
                if(dbPassword){      
                    if(helper.compare(password,dbPassword)){
                        let jwtToken = jwt.jwtTokenGen({email,password});                                      
                        res.header({'X-auth-token':jwtToken}).json({"Message":'LoggedIn successfully.'});                   
                    }else{                        
                        res.status(401).json({"errMessage":'User Unauthorized.'});
                    }
                }  
            }else{                
                res.status(404).json({"errMessage":'User doesn\'t exist.'});
            }
        }).catch((err)=> res.status(500).json({message: err.message})); 
    }catch(e){
        res.status(500).json({'errMessage':'Internal Server Error'});
    }
});//Login Route
app.post('/api/signup',    (req,res)=>{
    try{        
        let email = req.body.email;
        let password = req.body.password;
        let username = req.body.username;        
        User.find({email})
        .then((result)=>{                      
            if(result.length > 0){        
                res.status(409).json({"errMessage":"User already exists."});
            } else {
                
                password =  helper.hash(password);        
                let new_User = new User({username,password,email});
                new_User.save()
                .then(result=>{
                    res.json({"Message":"User created successfully."});
                }).catch(err=>{
                    res.status(500).json({"errMessage":'Unable to create user. Please try again later.'});
                })
            }
        }).catch((e)=> res.status(500).json({'errMessage':'Internal Server Error'}));
    }catch(e){        
        res.status(500).json({'errMessage':'Internal Server Error'});
    }
});//SignUp Route
app.post('/api/searchbuyorder',  (req,res)=>{
    try{
        let {SearchStr} = req.body;
        let userID = req.body.email;
        // let token = req.headers.cookie;        
        // let jwt_token = token.split('email=')[0];
        // jwt_token = jwt_token.split('jwt=')[1];        
        // if(jwt.verify(jwt_token)){
        Products.find({}).then(results=>{
            console.log(results);
            if(results){
                let res_Searches = [];
                if(results.length > 0){
                    for(let i=0;i<results.length;i++){
                        if(results[i].itemName.toUpperCase().indexOf(SearchStr.toUpperCase()) !== -1 && 
                        userID !== results[i].createdUser){
                            res_Searches.push(results[i]);
                        }
                    }
                    if(res_Searches.length > 0){
                        res.json(res_Searches);
                    }else{
                        res.status(404).json({'errMessage':'No records found matching search.'});
                    }
                }else{
                    res.status(404).json({'errMessage':'No records found matching search.'});
                }
            }else{                    
                res.status(500).json({'errMessage':'Internal Server Error'});
            }
        }).catch(err=>{                
            res.status(500).json({'errMessage':'Internal Server Error'});
        });
        // }else{
        //     res.status(401).json({'errMessage':'User Unauthorized.'});
        // }        
    }catch(e){        
        res.status(500).json({'errMessage':'Internal Server Error: '+e});
    }
});//Search buy order for a user Route
app.post('/api/buyorder',(req,res)=>{``
try{
    let {orderID,email,bidPrice} = req.body;
    let latest_bidPrice = [];
    let bid_Users = [];
    Products.find({orderID}).then(result=>{
        if(result && result.length > 0){                
            bid_Users = result[0].bidUsers;
            if(bid_Users === null || bid_Users === undefined || bid_Users === ""){
                bid_Users = [];
            }                                
            bid_Users.push({email,bidPrice})
            if(result[0].maxPricedBid !== undefined && result[0].maxPricedBid.length > 0){
                if(result[0].maxPricedBid < bidPrice && bidPrice > result[0].lowestSellPrice){
                    latest_bidPrice = {email,bidPrice};
                }else{
                    latest_bidPrice = result[0].maxPricedBid || {};
                }
            }else{
                if(bidPrice > result[0].lowestSellPrice){
                    latest_bidPrice = {email,bidPrice};
                }
            }                
            Products.findOneAndUpdate({orderID},
                {$set:{
                    "bidUsers": bid_Users,
                    "maxPricedBid": latest_bidPrice
                }
            },{new: true}).then(result1=>{
                SinUserInfo.find({"userID":email}).then(reslt=>{ 
                    if(reslt && reslt.length > 0){
                        let bordrUsr = reslt[0].buyOrders;
                        let found_fl = false;
                        for(let i=0;i<bordrUsr.length;i++){
                            if(bordrUsr[i].orderID === orderID){
                                found_fl = true;
                                break;
                            }
                        }
                        if(!found_fl){                                
                            bordrUsr.push({"orderID":orderID});                            
                            SinUserInfo.findOneAndUpdate({"userID":email},{
                                $set:{
                                    "buyOrders":bordrUsr
                                }
                            },{new:true}).then(newOrdr=>{
                                res.json(newOrdr);
                            }).catch(error=>{
                                res.status(500).json({'errMessage':'Internal Server Error: '+error});
                            })
                        }else{
                            res.json(reslt);
                        }                            
                    }
                    else{                            
                        let data = {};
                        data.userID = email;
                        data.buyOrders = [{orderID}];
                        data.sellOrders = [];
                        data.executedOrders = [];                            
                        let userOrderInfo = new SinUserInfo(data);   
                        console.log(data);
                        userOrderInfo.save().then(usercretInf=>{
                            console.log(usercretInf);                               
                            if(usercretInf){
                                res.json(usercretInf);
                            }else{
                                res.status(500).json({'errMessage':'Internal Server Error:'});
                            }
                        }).catch(errr=>{
                            res.status(500).json({'errMessage':'Internal Server Error:'+errr});
                        });                         
                    }                        
                }).catch(err=>{
                    res.status(500).json({'errMessage':'Internal Server Error:'+err});
                })                    
            }).catch(e=>{
                res.status(500).json({'errMessage':'Internal Server Error:'+e});
            })
        }
    }).catch(e=>{
        res.status(500).json({'errMessage':'Internal Server Error:'+e});
    })
    
}catch(e){
    res.status(500).json({'errMessage':'Internal Server Error'});
}
});
app.get('/api/buyorder', (req,res)=>{
    try{
        let  userID = req.body;             
        SinUserInfo.find(userID).then(userrslt=>{            
            if(userrslt && userrslt.length > 0){
                let buyOrders = [];
                let orderID = userrslt[0].orderID;
                for(let i=0;i<userrslt[0].buyOrders.length;i++){
                    buyOrders.push(userrslt[0].buyOrders[i].orderID);
                }
                if(buyOrders.length > 0){
                    Products.find({orderID:{$in:buyOrders}}).then(buyres=>{
                        res.json(buyres);
                    }).catch(buyerr=>{
                        res.status(500).json({'errMessage':'Internal Server Error: '+buyerr});
                    })
                }else{
                    res.json({'errMessage':'No buy orders for user'});
                }
            }else{
                res.json({'errMessage':'No buy orders for user'});
            }
        }).catch(usererr=>{
            res.status(500).json({'errMessage':'Internal Server Error: '+usererr});
        })
        
    }catch(e){
        res.status(500).json({'errMessage':'Internal Server Error'});
    }
});//Get buy order for a user Route
app.post('/api/sellorder', (req,res)=>{
    try{
        // let token = req.headers.cookie;        
        // let jwt_token = token.split('email=')[0];
        // jwt_token = jwt_token.split('jwt=')[1];        
        // if(jwt.verify(jwt_token)){
        let data = {};            
        let orderIDGentd  = helper.orderIDGen();
        data.orderID = orderIDGentd;
        data.itemName = req.body.itemName;
        data.createdUser = req.body.email;
        let email = req.body.email
        data.price = req.body.price;
        data.lowestSellPrice = req.body.lowestSellPrice;
        data.bidUsers = [];
        data.maxPricedBid = [];
        let orderItenary = new Products(data);
        orderItenary.save().then(result=>{
            if(result){
                SinUserInfo.find({"userID":email}).then(finres=>{                      
                    let sellOrdrs = (finres[0] && finres[0].sellOrders) || [];
                    sellOrdrs.push({"orderID":orderIDGentd});                    
                    SinUserInfo.findOneAndUpdate({"userID":email},{
                        $set:{
                            sellOrders: sellOrdrs
                        }
                    },{upsert:true,new:true}).then(userres=>{
                        res.json(userres);
                    }).catch(usererr=>{
                        res.status(500).json({'errMessage':'Unable to create an order: '+usererr});
                    })                   
                }).catch(finerr=>{
                    res.status(500).json({'errMessage':'Unable to create an order: '+finerr});
                })
            }else{
                res.status(500).json({'errMessage':'Unable to create an order'});
            }
        }).catch(err=>{
            res.status(500).json({'errMessage':'Unable to create an order: '+err});
        })
        // }else{
        //     res.status(401).json({'errMessage':'User Unauthorized.'});
        // } 
        
    }catch(e){
        res.status(500).json({'errMessage':'Internal Server Error:'+e});
    }
});//Create sell order for a user Route
app.get('/api/sellorder',  (req,res)=>{
    try{
        let  userID = req.body;             
        SinUserInfo.find(userID).then(userrslt=>{            
            if(userrslt && userrslt.length > 0){
                let sellOrders = [];
                let orderID = userrslt[0].orderID;
                for(let i=0;i<userrslt[0].sellOrders.length;i++){
                    sellOrders.push(userrslt[0].sellOrders[i].orderID);
                }
                if(sellOrders.length > 0){
                    Products.find({orderID:{$in:sellOrders}}).then(buyres=>{
                        res.json(buyres);
                    }).catch(buyerr=>{
                        res.status(500).json({'errMessage':'Internal Server Error: '+buyerr});
                    })
                }else{
                    res.json({'errMessage':'No sell orders for user'});
                }
            }else{
                res.json({'errMessage':'No sell orders for user'});
            }
        }).catch(usererr=>{
            res.status(500).json({'errMessage':'Internal Server Error: '+usererr});
        })
    }catch(e){
        res.status(500).json({'errMessage':'Internal Server Error'});
    }
});//Get sell order for a user Route
app.get('/api/aggregator',  (req,res)=>{
    try{
        Products.find({}).then(Prodres=>{            
            if(Prodres && Prodres.length > 0){  
                console.log("Here-->1");
                let ordersToExec = [];
                for(let i=0;i<Prodres.length;i++){
                    console.log("In Here-> ",i);
                    if(Prodres[i].maxPricedBid && Prodres[i].maxPricedBid.length > 0 && !Prodres[i].executionStatus){
                        let te_bid = Prodres[i].maxPricedBid[0];
                        te_bid["orderID"] = Prodres[i].orderID;
                        ordersToExec.push(te_bid);
                        Products.findOneAndUpdate({"orderID":Prodres[i].orderID},{
                            $set:{
                                "executionStatus":true
                            }
                        },{upsert:true,new:true}).then(prodtbres=>{
                            console.log("Updated order with orderID: ",Prodres[i].orderID);
                        }).catch(prodtberr=>{
                            console.log("Failed to update order with orderID: ",Prodres[i].orderID);
                        })
                    }
                }
                console.log(ordersToExec);
                if(ordersToExec.length > 0){
                    for(let i=0;i<ordersToExec.length;i++){
                        console.log("In Here too-> ",i)
                        let userID = ordersToExec[i].email;
                        let orderID = ordersToExec[i].orderID;
                        SinUserInfo.findOneAndUpdate({userID},
                            {"executedOrders":[{"orderID":orderID}]},
                            {upsert:true,new:true}).then(finUpres=>{
                                if(i === ordersToExec.length-1){
                                    finalAggregator(res);
                                }
                            }).catch(finUperr=>{
                                console.log("Failed to update order with userID: ",userID);
                            });
                        }
                    }else{
                        res.json({"errMessage":"No orders to execute."});
                    }
                    
                }else{
                    res.json({'errMessage':'No orders present.'});
                }
            }).catch(Proderr=>{
                res.status(500).json({'errMessage':'Internal Server Error: '+Proderr});
            })
        }catch(e){
            res.status(500).json({'errMessage':'Internal Server Error'});
        }
});//Aggregator route for excuting all orders till then.
    
var finalAggregator = (res) =>{
    try{
        Products.find({}).then(finalResult=>{
            let execOrders = [];
                let unExecOrders = [];
                for(let i=0;i<finalResult.length;i++){
                    if(finalResult[i].executionStatus){
                        execOrders.push(finalResult[i]);
                    }else{
                        unExecOrders.push(finalResult[i]);
                    }
                }
                let finRes = {
                    "execOrders":execOrders,
                    "unExecOrders":unExecOrders
                };
                res.json(finRes);
            }).catch(finalErr=>{
                res.status(500).json({'errMessage':'Internal Server Error: '+finalErr});
            })
        }catch(e){
            res.status(500).json({'errMessage':'Internal Server Error: '+e});
        }
    }
    
    app.get('/',(req,res)=>{
        res.status(404).json({'errMessage':'ROute not found'});
    })
    
    app.listen(Port,()=>{
        console.log(`Server is listening on port ${Port}.`);
    });