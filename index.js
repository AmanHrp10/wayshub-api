require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

const port = process.env.PORT || 5000;

//? Use express bodyParser
app.use(express.json());

//* Port

//? Using library
app.use(cors());

app.use('/uploads', express.static('uploads'));

// *Import Module
const routers = require('./src/routes');

app.use('/api/v1', routers);

app.get('/', (req, res) => {
  res.send('Wayshub API');
});

app.listen(port, () => console.log(`server is running on localhost:${port}`));
