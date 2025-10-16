const { Order, OrderItem, Cart, CartItem, Product, sequelize } = require('../models');

class OrderController {

    static async checkout(req, res, next) {
        const t = await sequelize.transaction();

        try {
            const userId = req.user.id
            const { shippingAddress } = req.body

            if (!shippingAddress) {
                throw { name: 'BadRequest', message: 'Shipping address is required' };
            }

            const cart = await Cart.findOne({
                where: { userId },
                include: {
                    model: CartItem,
                    as: 'items',
                    include: { model: Product, as: 'product' }
                }
            })

            if (!cart || !cart.items || cart.items.length === 0) { 
                throw { name: 'BadRequest', message: 'Your cart is empty' };
            }

            for (const item of cart.items) {
                if (item.product.stock < item.quantity) {
                    throw { name: 'BadRequest', message: `Insufficient stock for ${item.product.name}` };
                }
            }

            const totalPrice = cart.items.reduce((total, item) => {
                return total + (item.quantity * item.product.price)
            }, 0);

            const newOrder = await Order.create({
                userId,
                totalPrice,
                shippingAddress,
                status: 'pending'
            }, { transaction: t })

            const orderItems = cart.items.map(item => ({
                orderId: newOrder.id,
                productId: item.productId,
                quantity: item.quantity,
                priceAtPurchase: item.product.price
            }))

            await OrderItem.bulkCreate(orderItems, { transaction: t });

            for (const item of cart.items) {
                await Product.update(
                    { stock: sequelize.literal(`stock - ${item.quantity}`) },
                    { where: { id: item.productId }, transaction: t }
                );
            }

            await CartItem.destroy({
                where: { cartId: cart.id },
                transaction: t
            });

            await t.commit();

            res.status(201).json({ message: 'Checkout successful', order: newOrder })
        } catch (error) {
            console.error('--- CHECKOUT CRASHED ---', error); 
            await t.rollback();
            next(error)
        }
    }

    static async showOrders(req, res, next) {
        try {
            const userId = req.user.id

            const orders = await Order.findAll({
                where: { userId },
                include: {
                    model: OrderItem,
                    as: 'items',
                    include: { model: Product, as: 'product' }
                },
                order: [['createdAt', 'DESC']]
            })

            res.status(200).json(orders);
        } catch (error) {
            next(error)
        }
    }
}

module.exports = OrderController;