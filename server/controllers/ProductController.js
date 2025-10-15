const { Product } = require('../models')

class ProductController {

    static async showAll(req, res, next) {
        try {
            const products = await Product.findAll()

            res.status(200).json(products)
        } catch (error) {
            next(error)
        }
    }

    static async detail(req, res, next) {
        try {
            const { id } = req.params

            const product = await Product.findByPk(id)

            res.status(200).json(product)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = ProductController