const express = require('express');
const app = express();
const requestPromise = require('request-promise');
const bodyParser = require('body-parser');
const port = process.env.PORT || 5006;
const {successResponse, errorHandler,notFoundError,badRequestError} = require('./utils/utils');
const mio = require('./socket');
app.use(bodyParser.urlencoded({extended: true}));

let stock ={}; 


app.get('/home', function (req,res) {
    return res.send(successResponse(stock,"sh000001"));
});

async function stockData() { 
        
    let stockUrl = "http://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData?symbol=sh000001&scale=5&ma=no&datalen=140";

    requestPromise(stockUrl, {json: true })
    .then(function(res){      
        
        // replace all string object
        var data = res.replace(/{day:/g,'{"day":').replace(/,open:/g,',"open":').replace(/,high:/g,',"high":').replace(/,low:/g,',"low":').replace(/,close:/g,',"close":').replace(/,volume:/g,',"volume":');

        arrayData = [];     
        
        // Sting convert to JSON
        let finalStock = JSON.parse(data); 
        // Count Json Object Data
        console.log(typeof finalStock);
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
        // array will be reverse and latest data will be first
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