const request = require('supertest');
const app = require('../app');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../models');
const { execSync } = require('child_process');

const queryInterface = sequelize.getQueryInterface();

let adminToken, customerToken;

beforeAll(async () => {
    execSync('npx sequelize-cli db:migrate --env test');
    await queryInterface.sequelize.sync({ force: true });

    const hashedPassword = bcrypt.hashSync('password123', 10);
    await queryInterface.bulkInsert('Users', [
        {
            fullName: 'Test Admin',
            email: 'admin@test.com',
            password: hashedPassword,
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            fullName: 'Test Customer',
            email: 'customer@test.com',
            password: hashedPassword,
            role: 'customer',
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    ], {});

    const adminLoginRes = await request(app)
        .post('/login')
        .send({ email: 'admin@test.com', password: 'password123' });
    adminToken = adminLoginRes.body.access_token;

    const customerLoginRes = await request(app)
        .post('/login')
        .send({ email: 'customer@test.com', password: 'password123' });
    customerToken = customerLoginRes.body.access_token;

    await queryInterface.bulkInsert('Categories', [
        {
            id: 1,
            name: 'Electronics',
            slug: 'electronics',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);

    //   await queryInterface.bulkInsert('Products', [
    //     {
    //       id: 1,
    //       name: 'Smartphone',
    //       price: 999,
    //       stock: 50,
    //       categoryId: 1,
    //       imageUrl: 'http://example.com/smartphone.jpg',
    //       createdAt: new Date(),
    //       updatedAt: new Date(),
    //     },
    //   ]);
});

beforeEach(async () => {
    await queryInterface.bulkDelete('Products', null, { truncate: true, cascade: true, restartIdentity: true });

    await queryInterface.bulkInsert('Products', [
        {
            name: 'Initial Smartphone',
            price: 999,
            stock: 50,
            categoryId: 1,
            imageUrl: 'http://example.com/smartphone.jpg',
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    ], {});
});

afterAll(() => {
    execSync('npx sequelize-cli db:migrate:undo:all --env test');
    sequelize.close();
});

describe('ProductController', () => {
    describe('GET /products', () => {
        it('should return 200 and an array of all products', async () => {
            const res = await request(app).get('/products');
            expect(res.status).toBe(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    describe('GET /products/:id', () => {
        it('should return 200 and the correct product', async () => {
            const res = await request(app).get('/products/1');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('id', 1);
        });

        it('should return 404 if product is not found', async () => {
            const res = await request(app).get('/products/999');
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'Product not found');
        });
    });

    describe('POST /products', () => {
        it('should succeed with a valid adminToken', async () => {
            const newProduct = { name: 'Laptop', price: 999, stock: 30, categoryId: 1, imageUrl: 'http://example.com/laptop.jpg' };
            const res = await request(app).post('/products').set('Authorization', `Bearer ${adminToken}`).send(newProduct);
            console.log('Server Response Body:', res.body);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('id');
        });

        it('should return 401 Unauthorized if no token is provided', async () => {
            const res = await request(app).post('/products').send({ name: 'Laptop', price: 999, stock: 30, categoryId: 1 });
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Invalid token');
        });

        it('should return 403 Forbidden if a customerToken is used', async () => {
            const res = await request(app).post('/products').set('Authorization', `Bearer ${customerToken}`).send({ name: 'Laptop', price: 999, stock: 30, categoryId: 1 });
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty('message', "You're unauthorized");
        });

        it('should return 400 for invalid input (e.g., missing name)', async () => {
            const res = await request(app).post('/products').set('Authorization', `Bearer ${adminToken}`).send({ price: 999, stock: 30, categoryId: 1 });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Product name required');
        });
    });

    describe('PUT /products/:id', () => {
        it('should succeed with a valid adminToken', async () => {
            const updatedProduct = { name: 'Updated Smartphone', price: 799, stock: 40, categoryId: 1 };
            const res = await request(app).put('/products/1').set('Authorization', `Bearer ${adminToken}`).send(updatedProduct);
            expect(res.status).toBe(200);
            expect(res.body.name).toBe(updatedProduct.name);
        });

        it('should return 404 if the product ID does not exist', async () => {
            const res = await request(app).put('/products/999').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Nonexistent' });
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'Product not found');
        });
    });

    describe('DELETE /products/:id', () => {
        it('should succeed with a valid adminToken', async () => {
            const res = await request(app).delete('/products/1').set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message', `Product with id: 1 deleted successfully`);
        });

        it('should return 404 if the product ID does not exist', async () => {
            const res = await request(app).delete('/products/999').set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'Product not found');
        });

        it('should return 401 for a malformed or invalid token (JsonWebTokenError)', async () => {
            const res = await request(app)
                .post('/products')
                .set('Authorization', 'Bearer INI-ADALAH-TOKEN-YANG-RUSAK');

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Invalid token');
        });
    });
});