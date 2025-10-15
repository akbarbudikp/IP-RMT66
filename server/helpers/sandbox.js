// require('dotenv').config()
process.env.GEMINI_API_KEY='AIzaSyAnAxn7aTqxF_jz0ePGcZbkJonEUWpVuR8'

const { VirtualTryOn } = require('./gemini')

VirtualTryOn('https://img.freepik.com/free-photo/white-t-shirt-men-s-basic-wear-full-body_53876-125248.jpg?semt=ais_hybrid&w=740&q=80', 'https://macanstory.com/cdn/shop/files/Photoproduit_6_f250e8cd-8a49-45a4-a12f-90118dca5c64.jpg?v=1702118522&width=2048', 180, 80, 'L')
