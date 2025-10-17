const { Cart, CartItem, Product } = require('../models')

class CartController {
    static async addItemToCart(req, res, next) {
        try {
            const { productId, quantity } = req.body
            const userId = req.user.id

            const [cart] = await Cart.findOrCreate({ where: { userId } })

            let item = await CartItem.findOne({
                where: {
                    cartId: cart.id,
                    productId: productId
                }
            })

            if (item) {
                item.quantity += quantity
                await item.save();

            } else {
                item = await CartItem.create({
                    cartId: cart.id,
                    productId: productId,
                    quantity: quantity
                })
            }

            res.status(201).json({ message: 'Item added to cart successfully', item });
        } catch (error) {
            next(error)
        }
    }

    static async showCart(req, res, next) {
        try {
            const userId = req.user.id

            const cart = await Cart.findOne({
                where: { userId },
                include: {
                    model: CartItem,
                    as: 'items',
                    include: {
                        model: Product,
                        as: 'product'
                    }
                }
            })

            if (!cart) {
                return res.status(200).json({ message: 'Your cart is empty', items: [] });
            }

            res.status(200).json(cart);
        } catch (error) {
            next(error)
        }
    }

    static async removeItemFromCart(req, res, next) {
        try {
            const { cartItemId } = req.params
            const userId = req.user.id

            const cart = await Cart.findOne({ where: { userId } })
            const item = await CartItem.findByPk(cartItemId)

            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            if (!item || item.cartId !== cart.id) {
                throw { name: 'Forbidden', message: 'You are not authorized to remove this item' };
            }

            await item.destroy()

            res.status(200).json({ message: 'Item removed from cart successfully' });
        } catch (error) {
            next(error)
        }
    }
}

module.exports = CartController