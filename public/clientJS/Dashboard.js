window.onload = function(){
    if(document.cookie === undefined || document.cookie === null && document.cookie === ""){
        window.location.href = "index.html";
    }else{
        var jwtToken = document.cookie;
        jwtToken = jwtToken.split('=');
        if(jwtToken[1] === undefined || jwtToken[1] === "" || jwtToken === null){
            window.location.href = "index.html";
        }else{
            OrderFetcher();
        }
    }    
}

function OrderFetcher(){
    console.log("Fetching Orders.");
    try{
        var Buyurl = "/api/buyorder";                      
        axios.get(Buyurl).then(res=>{
            generateCards(res,"BuyOrders", "Buy");
        }).catch(err=>{
            alert("Failed to fetch buy orders: ",err);
        })
        var Sellurl = "/api/sellorder";                      
        axios.get(Sellurl).then(res=>{
            generateCards(res,"SellOrders","Sell");
        }).catch(err=>{
            alert("Failed to fetch Sell orders: ",err);
        })
        var Execurl = "/api/execOrders";                      
        axios.get(Execurl).then(res=>{
            generateCards(res,"ExecOrders","Executed");
        }).catch(err=>{
            alert("Failed to fetch Executed orders: ",err);
        })
    }catch(e){
        alert("Failed to fetch orders.");
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
                    let cardContent = "<p class=\"card-text\">Price: "+res[i].price+"$</p><p class=\"card-text\">Created Time: "+res[i].orderCreatedTime+"</p></div></div>"; 
                    card += header+cardContent;
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

function logout(){
    document.cookie = "";
    window.location.href = 'index.html';
}