require('dotenv').config()

const { GoogleGenAI } = require("@google/genai");
const fs = require("node:fs");
const express = require('express');
const UserController = require('./controllers/UserController');
const ProductController = require('./controllers/ProductController');
const errorHandler = require('./middlewares/errorHandler');
const app = express()
const port = 3000

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// register & login
app.post('/register', UserController.register)
app.post('/login', UserController.login)

// products
app.get('/products', ProductController.showAll)
app.get('/products/:id', ProductController.detail)

app.use(errorHandler)

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})
