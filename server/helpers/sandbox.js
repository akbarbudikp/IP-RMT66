// require('dotenv').config()
process.env.GEMINI_API_KEY='AIzaSyAnAxn7aTqxF_jz0ePGcZbkJonEUWpVuR8'

const { VirtualTryOn } = require('./gemini')

VirtualTryOn('https://img.freepik.com/free-photo/white-t-shirt-men-s-basic-wear-full-body_53876-125248.jpg?semt=ais_hybrid&w=740&q=80', 'https://images-cdn.ubuy.co.id/662dc4fa1e02e24a1f7d0cfb-nike-men-39-s-nsw-club-full-zip-hoodie.jpg', 180, 80, 'L')
