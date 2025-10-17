const { Order, OrderItem, Cart, CartItem, Product, sequelize } = require('../models');
const midtransClient = require('midtrans-client');

let snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

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

            const parameter = {
                transaction_details: {
                    order_id: newOrder.id,
                    gross_amount: newOrder.totalPrice
                },
                item_details: cart.items.map(item => ({
                    id: item.product.id,
                    price: item.product.price,
                    quantity: item.quantity,
                    name: item.product.name
                })),
                customer_details: {
                    first_name: req.user.firstName,
                    last_name: req.user.lastName,
                    email: req.user.email
                }
            };

            const snapToken = await snap.createTransactionToken(parameter);

            await t.commit();

            res.status(201).json({
                message: 'Order created, please complete payment.',
                order: newOrder,
                snapToken: snapToken
            });
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

    static async handleMidtransNotification(req, res, next) {
        try {
            const notificationJson = req.body;

            const orderId = notificationJson.order_id;
            const transactionStatus = notificationJson.transaction_status;
            const fraudStatus = notificationJson.fraud_status;

            console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);

            const order = await Order.findByPk(orderId);

            if (!order) {
                return res.status(200).json({ message: 'Order not found, notification ignored.' });
            }

            if (order.status === 'paid') {
                return res.status(200).json({ message: 'Order already paid, notification ignored.' });
            }

            if (transactionStatus == 'capture' || transactionStatus == 'settlement') {
                if (fraudStatus == 'accept') {
                    await order.update({ status: 'paid' });
                }
            } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
                await order.update({ status: 'cancelled' });
            }

            res.status(200).json({ message: 'Notification processed successfully' });

        } catch (error) {
            next(error);
        }
    }
}

module.exports = OrderController;