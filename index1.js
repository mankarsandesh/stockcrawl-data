const express = require('express');
const app = express();
const requestPromise = require('request-promise');
const bodyParser = require('body-parser');
const port = process.env.PORT || 5006;
const {successResponse, errorHandler,notFoundError,badRequestError} = require('./utils/utils');
const mio = require('./socket');
app.use(bodyParser.urlencoded({extended: true}));

let stock ={};


let stockUrl = "https://quotes.sina.cn/cn/api/jsonp_v2.php/var%20_sh000001_5_1553569576264=/CN_MarketDataService.getKLineData?symbol=sh000300&scale=5&ma=no&datalen=2";

app.get('/home', function (req,res) {
    return res.send(successResponse(stock,"sh000300"));
});

async function stockData() {       
    requestPromise(stockUrl, {json: true })
    .then(function(res){      
        
             
        
        console.log(res);
        var newData = res.replace("/*<script>location.href='//sina.com';</script>*/",'');
        var data = newData.replace("var _sh000001_5_1553569576264=(",'');
        var FinalData = data.replace(");",'');

        arrayData = [];   
        console.log("start");
        let finalStock = JSON.parse(FinalData); 

        console.log(finalStock);
        // // Sting convert to JSON
        // let finalStock = JSON.parse(newData); 
        // console.log(finalStock);
        // // Count Json Object Data
        var count= Object.keys(finalStock).length;
        
        // For Loop for create new Response
        for (i = 0; i < count; i++) {
            var obj = {};
            const open = finalStock[i].open;            
            obj['date'] = finalStock[i].day;
            obj['no1']  = open.charAt(open.length-2);  
            obj['no2']  = open.charAt(open.length-1);       
            obj['PT'] = open;

            // all object data will store in arrayData 
            arrayData.push(obj);           
        }
        // // array will be reverse and latest data will be first
        stockReverse = arrayData.reverse();    
        // stockReverse array store in stock data array    
        stock = stockReverse;  
       
    })
    .catch(function(err) {
        // Crawling failed...
        console.log(err)
    });

    
}

const server = app.listen(port, () => {
    stockData();
    const io = require('./socket').init(server)

    io.on('connection', socket => {
        console.log('client connected')
    })


    setInterval(function(str1, str2) {
        
        mio.getIO().emit('stock', stock)
        
    }, 1000);

    console.log(`Server is up on port ${port}`);
});

module.exports = app