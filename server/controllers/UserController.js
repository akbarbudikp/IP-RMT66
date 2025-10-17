const { signToken } = require('../helpers/jwt');
const bcrypt = require('bcrypt')
const { User } = require('../models')

class UserController {
    static async register(req, res, next) {
        try {
            const { fullName, email, password } = req.body

            const user = await User.create({ fullName, email, password })

            res.status(201).json({
                id: user.id,
                "full name": user.fullName,
                email: user.email
            })
        } catch (error) {
            next(error)
        }
    }

    static async login(req, res, next) {
        try {
            const { email, password } = req.body

            if (!email) throw { name: 'BadRequest', message: 'Email is required' }
            if (!password) throw { name: 'BadRequest', message: 'Password is required' }

            const user = await User.findOne({ where: { email } })

            if (!user) throw { name: 'Unauthorized', message: 'Invalid email or password' }

            const isValidPassword = await bcrypt.compare(password, user.password)

            if (!isValidPassword) {
                throw { name: "Unauthorized", message: "Invalid email or password" }
            }

            const access_token = signToken({ id: user.id })

            res.status(200).json({ access_token })
        } catch (error) {
            next(error)
        }
    }

    static async googleLogin(req, res, next) {
        try {
            const { googleToken } = req.body;

            const client = new OAuth2Client();
            const ticket = await client.verifyIdToken({
                idToken: googleToken,
                audience: process.env.GOOGLE_CLIENT,
            });
            const payload = ticket.getPayload();
            const userid = payload['sub'];

            const [user, created] = await User.findOrCreate({
                where: { email: payload.email },
                defaults: {
                    password: Math.random().toString() + Date.now().toString(),
                    role: 'customer'
                }
            })
            const access_token = signToken({ id: user.id })
            res.status(200).json({ access_token })
        } catch (error) {

        }
    }
}

module.exports = UserController