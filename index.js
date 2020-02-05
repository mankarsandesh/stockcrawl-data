const express = require('express');
const app = express();
const requestPromise = require('request-promise');
const bodyParser = require('body-parser');
const port = process.env.PORT || 5006;
const {successResponse, errorHandler,notFoundError,badRequestError} = require('./utils/utils');
const mio = require('./socket');
app.use(bodyParser.urlencoded({extended: true}));

const { getStock } = require('./controller/sh000001');

let stock ={}; 


app.get('/home', function async (req,res) {
    const data = await getStock();
    return res.send(successResponse(data,"sh000001"));
});



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