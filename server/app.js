require('dotenv').config()

const { GoogleGenAI } = require("@google/genai");
const fs = require("node:fs");
const express = require('express');
const UserController = require('./controllers/UserController');
const ProductController = require('./controllers/ProductController');
const errorHandler = require('./middlewares/errorHandler');
const adminOnly = require('./helpers/adminOnly');
const authentication = require('./helpers/authentication');
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

app.use(authentication)

// products with login and role admin
app.post('/products', adminOnly, ProductController.add)
app.put('/products/:id', adminOnly, ProductController.edit)
app.delete('/products/:id', adminOnly,ProductController.delete)

app.use(errorHandler)

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})
