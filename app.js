require('dotenv').config()

const { GoogleGenAI } = require("@google/genai");
const fs = require("node:fs");
const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})
