const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const queryInterface = sequelize.getQueryInterface();

let customerToken;
let customerId;

beforeAll(async () => {
    await queryInterface.sequelize.sync({ force: true });

    const hashedPassword = bcrypt.hashSync('password123', 10);
    const [customer] = await queryInterface.bulkInsert('Users', [
        {
            fullName: 'Test Customer',
            email: 'customer@test.com',
            password: hashedPassword,
            role: 'customer',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ], { returning: true });

    customerId = customer.id || (Array.isArray(customer) && customer[0] ? customer[0].id : null);

    await queryInterface.bulkInsert('Categories', [
        {
            id: 1,
            name: 'Electronics',
            slug: 'electronics',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);

    await queryInterface.bulkInsert('Products', [
        {
            id: 1,
            name: 'Smartphone',
            price: 999,
            stock: 50,
            categoryId: 1,
            imageUrl: 'http://example.com/smartphone.jpg',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);

    const response = await request(app)
        .post('/login')
        .send({
            email: 'customer@test.com',
            password: 'password123',
        });

    customerToken = response.body.access_token;
});

afterAll(async () => {
    await sequelize.close();
});

beforeEach(async () => {
    await queryInterface.bulkDelete('OrderItems', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('CartItems', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('Orders', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('Carts', null, { truncate: true, cascade: true, restartIdentity: true });
});

describe('Checkout Flow', () => {
    describe('POST /carts', () => {
        it('should return 201 and add a new item to the cart', async () => {
            const res = await request(app)
                .post('/carts')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId: 1, quantity: 2 });
            expect(res.status).toBe(201);
            expect(res.body.item).toHaveProperty('id');
        });

        it('should return 201 and update the quantity if the same item is added again', async () => {
            await request(app)
                .post('/carts')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId: 1, quantity: 2 });

            const res = await request(app)
                .post('/carts')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId: 1, quantity: 3 });
            expect(res.status).toBe(201);
            expect(res.body.item.quantity).toBe(5);
        });
    });

    describe('GET /carts', () => {
        it('should return 200 and display all items in the cart', async () => {
            const res = await request(app).get('/carts').set('Authorization', `Bearer ${customerToken}`);
            expect(res.status).toBe(200);
            expect(res.body.items).toBeInstanceOf(Array);
        });
    });

    describe('DELETE /carts/:cartItemId', () => {
        it('should return 200 and remove an item from the cart', async () => {
            const addItemRes = await request(app)
                .post('/carts')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId: 1, quantity: 1 });

            const cartItemId = addItemRes.body.item.id;

            const res = await request(app)
                .delete(`/carts/${cartItemId}`)
                .set('Authorization', `Bearer ${customerToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message', 'Item removed from cart successfully');
        });
    });

    describe('POST /orders/checkout', () => {
        it('should return 201, create an order, and the cart should be empty afterward', async () => {
            await request(app)
                .post('/carts')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId: 1, quantity: 1 });

            const res = await request(app)
                .post('/orders/checkout')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ shippingAddress: '123 Main St' });

            expect(res.status).toBe(201);
            expect(res.body.order).toHaveProperty('id');

            const cartRes = await request(app).get('/carts').set('Authorization', `Bearer ${customerToken}`);
            expect(cartRes.body.items.length).toBe(0);
        });

        it('should return 400 if shippingAddress is missing', async () => {
            const res = await request(app)
                .post('/orders/checkout')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({});
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Shipping address is required');
        });

        it('should return 400 if the cart is empty', async () => {
            const res = await request(app)
                .post('/orders/checkout')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ shippingAddress: '123 Main St' });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Your cart is empty');
        });

        it('should return 400 if product stock is insufficient', async () => {
            await request(app)
                .post('/carts')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId: 1, quantity: 100 });

            const res = await request(app)
                .post('/orders/checkout')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ shippingAddress: '123 Main St' });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        });
    });

    describe('GET /orders', () => {
        it("should return 200 and show the newly created order in the user's history", async () => {
            await request(app)
                .post('/carts')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId: 1, quantity: 1 });

            await request(app)
                .post('/orders/checkout')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ shippingAddress: '123 Main St' });

            const res = await request(app)
                .get('/orders')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    describe('POST /orders/midtrans/notification', () => {
        let orderId;

        beforeEach(async () => {
            await request(app)
                .post('/carts')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId: 1, quantity: 1 });

            const res = await request(app)
                .post('/orders/checkout')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ shippingAddress: '123 Main St' });

            orderId = res.body.order.id;
        });

        it('should handle successful settlement notification and update order status', async () => {
            const midtransPayload = {
                transaction_status: 'settlement', 
                order_id: orderId, 
                fraud_status: 'accept',
            };

            const res = await request(app)
                .post('/orders/midtrans/notification')
                .send(midtransPayload);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message', 'Notification processed successfully');

            const order = await sequelize.models.Order.findByPk(orderId);
            expect(order.status).toBe('paid');
        });

        it('should handle deny notification', async () => {
            const midtransPayload = {
                transaction_status: 'deny',
                order_id: orderId,
            };

            const res = await request(app)
                .post('/orders/midtrans/notification')
                .send(midtransPayload);

            expect(res.status).toBe(200);
            const order = await sequelize.models.Order.findByPk(orderId);
            expect(order.status).toBe('cancelled'); 
        });
    });
});