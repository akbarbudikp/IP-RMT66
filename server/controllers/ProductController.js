const { Product } = require('../models')
const cloudinary = require('cloudinary')

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

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

            if (!product) throw { name: "NotFound", message: "Product not found" }

            res.status(200).json(product)
        } catch (error) {
            next(error)
        }
    }

    static async add(req, res, next) {
        console.log('--- ISI REQ.BODY SAAT MASUK CONTROLLER ---');
        console.log(req.body);
        console.log('3. req.body di dalam CONTROLLER:', req.body);
        try {
            const { name, description, price, stock, imageUrl, categoryId } = req.body

            const product = await Product.create({ name, description, price, stock, imageUrl, categoryId })

            res.status(201).json(product)
        } catch (error) {
            console.log('--- VALIDATION ERROR OCCURRED ---');
            console.log(JSON.stringify(error, null, 2));
            next(error)
        }
    }

    static async edit(req, res, next) {
        try {
            const { id } = req.params

            const product = await Product.findByPk(id)

            if (!product) {
                throw { name: "NotFound", message: "Product not found" }
            }

            const { name, description, price, stock, imageUrl, categoryId } = req.body

            await product.update({ name, description, price, stock, imageUrl, categoryId })

            res.status(200).json(product)
        } catch (error) {
            next(error)
        }
    }

    static async delete(req, res, next) {
        try {
            const { id } = req.params

            const product = await Product.findByPk(id)

            if (!product) {
                throw { name: "NotFound", message: "Product not found" }
            }

            await product.destroy()

            res.status(200).json({ message: `Product with id: ${product.id} deleted successfully` })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = ProductController