const { signToken } = require('../helpers/jwt');
const bcrypt = require('bcrypt')
const { User } = require('../models')

class UserController {
    static async register(req, res, next) {
        try {
            const { email, password } = req.body

            const user = await User.create({ email, password })

            res.status(201).json({
                id: user.id,
                email: user.email
            })
        } catch (error) {
            next(error)
        }
    }

    static async login(req, res, next) {
        try {
            const { email, password } = req.body

            if (!email) throw { name: 'BadRequest', message: 'Email is required'}
            if (!password) throw { name: 'BadRequest', message: 'Password is required'}

            const user = await User.findOne({ where: { email }})

            if (!user) throw { name: 'Unauthorized', message: 'Invalid email or password'}

            const isValidPassword = await bcrypt.compare(password, user.password)

            if (!isValidPassword) {
                throw { name: "Unauthorized", message: "Invalid email or password"}
            }

            const access_token = signToken({ id: user.id })

            res.set(200).json({access_token})
        } catch (error) {
            next(error)
        }
    }
}

module.exports = UserController