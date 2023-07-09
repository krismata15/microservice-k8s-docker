const express = require('express')
var jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const app = express()
const port = 3000
let connection;

async function connectToDatabase() {
    console.log('aqui sss');
    console.log(process.env.DB_HOST);
    console.log(process.env.DB_USER);
    connection = await mysql.createConnection({
        host     : process.env.DB_HOST,
        user     : process.env.DB_USER,
        password : process.env.DB_PASSWORD,
        database : process.env.DB_DATABASE,
        port: process.env.DB_PORT,
      });
      
    await connection.connect();

    console.log('Connected');
}

connectToDatabase();

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/login', async (req, res) => {
  encodeJwt = req.headers.authorization;

    const [rows, fields] = await connection.execute('SELECT * FROM `user` WHERE `email` = ? AND `password` = ? LIMIT 1', ['test@email.com', 'test']);

    console.log(rows);
    console.log(rows.length);

    if(rows.length < 1) {
        return res.status(401).json({
            'message' : 'invalid credentials'
        });
    }

    const token =  jwt.sign({'username': 'test@email.com', 'admin' : true}, process.env.JWT_SECRET_KEY)

    return res.status(200).json({
        'message' : token
    });

});


app.post('/validate', async (req, res) => {

  const encodeJwt = req.headers.authorization;

  if(!encodeJwt){
    return res.status(401).json({"message" : "Not permitted"});
  }

  const token = encodeJwt.split(' ')[1];

  if(!token){
    return res.status(401).json({"message" : "Token format error"});
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    return res.status(200).json({
      'data' : decoded
    });

  } catch(err) {
    res.status(401).json({"message" : "Invalid Token"});
  }
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})