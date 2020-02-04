const express = require('express');
const app = express();
const requestPromise = require('request-promise');
const request = require('request');
const bodyParser = require('body-parser');
const port = process.env.PORT || 5002;

const https = require('https');
const http = require('http');
const mio = require('./socket');
app.use(bodyParser.urlencoded({extended: true}));

let stock = {
    data: {
    }
}
let stockData1 = {}

let stockUrl = "http://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData?symbol=sh000001&scale=5&ma=no&datalen=1";
app.get('/home', function (req, res) {
    res.status(200).json(stock)   
});
let options = {json: true};

function stockData() {
    setInterval(() => {
        requestPromise(stockUrl, {json: true })
        .then(function(htmlString) {
          const rs = htmlString.toString().split(",");
          console.log(rs[0]);      
        })
        .catch(function(err) {
            console.log(err)
        });

       

    },1000)
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