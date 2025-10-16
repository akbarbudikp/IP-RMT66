const { Product } = require('../models')
const cloudinary = require('cloudinary').v2;
const fs = require('fs/promises');
const { VirtualTryOn } = require('../helpers/gemini');

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

    static async virtualTryOn(req, res, next) {
        const userImagePath = req.file ? req.file.path : null;
        try {
            const { id: productId } = req.params;
            const { height, weight, product_size } = req.body;
            const userImageFile = req.file;

            if (!userImageFile) {
                throw { name: 'BadRequest', message: 'User image is required' };
            }

            if (!height || !weight || !product_size) {
                throw { name: 'BadRequest', message: 'Height, weight, and product size are required' };
            }

            const product = await Product.findByPk(productId);
            if (!product) {
                throw { name: 'NotFound', message: 'Product not found' };
            }

            if (!product.imageUrl) {
                throw { name: 'BadRequest', message: 'Selected product does not have an image' };
            }

            const userImageUploadResult = await cloudinary.uploader.upload(userImageFile.path, {
                folder: "user-uploads" 
            });

            const userImageUrl = userImageUploadResult.secure_url;

            const resultImageUrl = await VirtualTryOn(
                userImageUrl,
                product.imageUrl,
                height,
                weight,
                product_size
            );

            res.status(200).json({
                message: 'Virtual try-on successful',
                resultUrl: resultImageUrl
            });
        } catch (error) {
            next(error);
        } finally {
            if (userImagePath) {
                try {
                    await fs.unlink(userImagePath);
                } catch (unlinkError) {
                    console.error('Failed to delete temporary file:', unlinkError);
                }
            }
        }
    }
}

module.exports = ProductController