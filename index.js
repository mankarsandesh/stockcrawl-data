const express = require('express');
const app = express();
const requestPromise = require('request-promise');
const request = require('request');
const bodyParser = require('body-parser');
const port = process.env.PORT || 5004;

const https = require('https');
// const http = require('http');
const mio = require('./socket');
app.use(bodyParser.urlencoded({extended: true}));

let stock ={};
let stockData1 = {}

let stockUrl = "http://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData?symbol=sh000001&scale=5&ma=no&datalen=3";
app.get('/home', function (req, res) {
    res.status(200).json(stock)   
});
let options = {json: true};

async function stockData() {       
    requestPromise(stockUrl, {json: true })
    .then(function(res){
        // const data = JSON.parse(res.toString());
       
        var data = res.replace(/{day:/g,'{"day":').replace(/,open:/g,',"open":').replace(/,high:/g,',"high":').replace(/,low:/g,',"low":').replace(/,close:/g,',"close":').replace(/,volume:/g,',"volume":');

        arrayData = [];     
        
        let finalStock = JSON.parse(data); 
        var count= Object.keys(finalStock).length;
        console.log(finalStock[0]);   
        const StockData = {}
        for (i = 0; i < count; i++) {
            var obj = {};
           

            obj['date'] = finalStock[i].day;
            obj['open']  = finalStock[i].open;       
            arrayData.push(obj);           
        }
        console.log(arrayData.reverse());     
        // stock.data = StockData;  
       
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