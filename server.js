const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

//? Use express bodyParser
app.use(express.json());

//* Port
const port = process.env.PORT || 5000;

//? Config

//? Using library

app.use(express.json());
app.use(cors());

app.use('/uploads', express.static('uploads'));

// *Import Module
const routers = require('./src/routes/');

app.use('/api/v1', routers);

app.listen(port, () => console.log(`server is running on localhost:${port}`));
