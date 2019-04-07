window.onload = function(){
    if(document.cookie === undefined || document.cookie === null && document.cookie === ""){
        window.location.href = "index.html";
    }else{
        var jwtToken = document.cookie;
        jwtToken = jwtToken.split('=');
        if(jwtToken[1] === undefined || jwtToken[1] === "" || jwtToken === null){
            window.location.href = "index.html";
        }else{
            showBuyOrders();            
        }
    }    
}
function showBuyOrders(){
    try{       
        let buyUrl = "http://localhost:3001/api/searchbuyorder"; 
        axios.get(buyUrl).then(res=>{
            generateCards(res,"row1","Buy");
        }).catch(err=>{
            alert("Failed to fetch buy orders: ",err);
        })
    }catch(e){
        alert("Error fetching buy orders.");
    }
}

function generateCards(res,id,type){
    try{
        console.log("id: ",id);
        let holder = document.getElementById(id);
        if(res.status === 200){             
            if(res.data && !res.errMessage && res.data.length > 0){                
                let tot_str = "";
                let div_str = "<h1>"+type+" Orders</h1>";
                res = res.data;
                tot_str = div_str;                
                for(let i=0;i<res.length;i++){                      
                    let card = "<div class=\"card\" style=\"width: 24rem;\"><div class=\"card-body\">";                  
                    let header =  "<h5 class=\"card-title\">"+res[i].itemName+"</h5>"
                    let cardContent = "<p class=\"card-text\">Price: "+res[i].price+"$</p><p class=\"card-text\">Created Time: "+res[i].orderCreatedTime+"</p>";                     
                    let inputVal = "<div class=\"form-group1\"><label for=\"bidPrice\">Bid Price:</label><input type=\"number\" class=\"form-control1\" id=\""+"txt"+res[i].orderID+"\"></div>";
                    let confirm = "<button  type=\"button\" id=\""+res[i].orderID+"\" class=\"btn btn-secondary custButton\">Place Bid</button>"             
                    card += header+cardContent+inputVal+confirm+"</div></div>";
                    tot_str += card;
                }                         
                holder.innerHTML = tot_str;
            }else{
                let no_lbl = "<h1>"+type+" Orders</h1><label id = \"noData\" class=\"fileContainer\">No Order Data!</label>"                
                holder.innerHTML = no_lbl;
            }
        }else{
            alert("Unable to process your request at this point of time.")
        }
    }catch(e){
        console.log("Exception in geneteCards: ",e);
    }
}

document.addEventListener('click', function (event) {    	
    try{
        let orderID = event.target.id;
        if(orderID !== "submitOrder" && orderID.length === 64){
            let txtfld = "txt"+orderID;
            let bidPrice = document.getElementById(txtfld).value;
            if(bidPrice > 0){
                let data = {};
                data.orderID = orderID;
                data.bidPrice = bidPrice;
                let buyurl = "http://localhost:3001/api/buyorder";
                axios.post(buyurl,data).then(res=>{
                    alert("Buy order created successfully.");
                    console.log(res);
                }).catch(err=>{
                    alert("Failed to create Sell order: ",err);
                })
            }else{
                alert("Please give a valid input.");
            }
        }
    }catch(e){
        console.log("Exception in posting Buy Order.");
    }
}, false);

function postSellOrder(){
    try{
        console.log("Creating sell Order");
        let itemName = document.getElementById("itmn").value;
        let price = document.getElementById("prc").value;
        let lowestSellPrice = document.getElementById("lep").value;
        if(itemName.length > 0 && price > 0 && lowestSellPrice > 0){
            if(lowestSellPrice < price){
                let data = {itemName,price,lowestSellPrice};
                let Sellurl = "http://localhost:3001/api/sellorder";
                axios.post(Sellurl,data).then(res=>{
                    document.getElementById("itmn").value = "";
                    document.getElementById("prc").value = "";
                    document.getElementById("lep").value = "";                    
                    alert("Sell Order created successfully");
                    console.log(res);
                }).catch(err=>{
                    alert("Failed to create Sell order: ",err);
                })
            }else{
                alert("Least selling price should be less that price.");
            }
        }else{
            alert("Please give valid input.");
        }
    }catch(e){
        alert("Unable to place a sell order at this point of time.");
    }
}

function logout(){
    document.cookie = "";
    window.location.href = 'index.html';
}