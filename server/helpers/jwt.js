const jwt = require('jsonwebtoken')

const signToken = (payload) => {
    return jwt.sign(payload, 'apahayo')
}

const verifyToken = (token) => {
    return jwt.verify(token, 'apahayo')
}

module.exports = { signToken, verifyToken }