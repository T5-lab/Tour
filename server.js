const express = require('express');
const mongoose = require('mongoose');
const conf = require('./conf.js')
const routes = require('./routes')

mongoose.connect(conf.DB, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('connected to mongodb')).catch(e => console.log(e))

const PORT = process.env.PORT || 9000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/', routes());

app.listen(PORT, () => console.log(`Server Is Listening to port ${PORT}`));
