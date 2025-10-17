if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const { GoogleGenAI } = require("@google/genai");
const fs = require("node:fs");
const express = require('express');
const cors = require('cors')
const UserController = require('./controllers/UserController');
const ProductController = require('./controllers/ProductController');
const errorHandler = require('./middlewares/errorHandler');
const adminOnly = require('./helpers/adminOnly');
const authentication = require('./helpers/authentication');
const OrderController = require('./controllers/OrderController');
const CartController = require('./controllers/CartController');
const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// register & login
app.post('/register', UserController.register)
app.post('/google-login', UserController.googleLogin)
app.post('/login', UserController.login)

// products
app.get('/products', ProductController.showAll)
app.get('/products/:id', ProductController.detail)

app.post('/orders/midtrans/notification', OrderController.handleMidtransNotification);

app.use(authentication)

app.post(
    '/products/:id/virtual-try-on', 
    upload.single('userImage'), 
    ProductController.featureVirtualTryOn
);

// products with login and role admin
app.post('/products', adminOnly, ProductController.add)
app.put('/products/:id', adminOnly, ProductController.edit)
app.delete('/products/:id', adminOnly,ProductController.delete)

app.get('/carts', CartController.showCart);
app.post('/carts', CartController.addItemToCart);
app.delete('/carts/:cartItemId', CartController.removeItemFromCart);

app.get('/orders', OrderController.showOrders);
app.post('/orders/checkout', OrderController.checkout);

app.use(errorHandler)

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

module.exports = app;