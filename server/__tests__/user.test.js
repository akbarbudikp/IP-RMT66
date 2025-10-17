const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');
const { execSync } = require('child_process');
const { OAuth2Client } = require('google-auth-library');
const UserController = require('../controllers/UserController');

const queryInterface = sequelize.getQueryInterface();

beforeAll(async () => {
    execSync('npx sequelize-cli db:migrate --env test');

    await queryInterface.sequelize.sync({ force: true });

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
});

afterAll(() => {
    execSync('npx sequelize-cli db:migrate:undo:all --env test');
    sequelize.close();
});

jest.mock('google-auth-library');

describe('UserController', () => {
    describe('POST /register', () => {
        it('should return 201 and the new user object without the password', async () => {
            const newUser = { fullName: 'John Doe', email: 'john@example.com', password: 'password123' };
            const res = await request(app).post('/register').send(newUser);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body).toHaveProperty('email', newUser.email);
            expect(res.body).not.toHaveProperty('password');
        });

        it('should return 400 if fullName is not provided', async () => {
            const res = await request(app).post('/register').send({ email: 'john@example.com', password: 'password123' });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Full name is required');
        });

        it('should return 400 if email is not provided', async () => {
            const res = await request(app).post('/register').send({ fullName: 'John Doe', password: 'password123' });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Email is required');
        });

        it('should return 400 if email is already registered', async () => {
            const existingUser = { fullName: 'Jane Doe', email: 'jane@example.com', password: 'password123' };
            await request(app).post('/register').send(existingUser);
            const res = await request(app).post('/register').send(existingUser);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Email already exists');
        });
    });

    describe('POST /login', () => {
        it('should return 200 and an access_token for valid credentials', async () => {
            const user = { email: 'john@example.com', password: 'password123' };
            const res = await request(app).post('/login').send(user);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('access_token');
        });

        it('should return 400 if email is not provided', async () => {
            const res = await request(app).post('/login').send({ password: 'password123' });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Email is required');
        });

        it('should return 400 if password is not provided', async () => {
            const res = await request(app).post('/login').send({ email: 'john@example.com' });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Password is required');
        });

        it('should return 401 for a non-existent user', async () => {
            const res = await request(app).post('/login').send({ email: 'nonexistent@example.com', password: 'password123' });
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Invalid email or password');
        });

        it('should return 401 for an incorrect password', async () => {
            const res = await request(app).post('/login').send({ email: 'john@example.com', password: 'wrongpassword' });
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Invalid email or password');
        });

        it('should return 400 if email is already registered (SequelizeUniqueConstraintError)', async () => {
            const user = {
                fullName: 'Duplicate User',
                email: 'duplicate@test.com',
                password: 'password123'
            };
            await request(app).post('/register').send(user);

            const res = await request(app).post('/register').send(user);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toMatch("Email already exists");
        });
    });

    describe('POST /google-login', () => {
        it('should return 200 and access_token for a valid google credential', async () => {
            const mockGooglePayload = {
                email: 'newuser@google.com',
                name: 'Google User',
            };

            OAuth2Client.prototype.verifyIdToken.mockResolvedValue({
                getPayload: () => mockGooglePayload,
            });

            const res = await request(app)
                .post('/google-login')
                .send({ google_token: 'mock_google_token' });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('access_token');
        });

        it('should return 401 for an invalid google credential', async () => {
            OAuth2Client.prototype.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

            const res = await request(app)
                .post('/google-login')
                .send({ google_token: 'invalid_token' });

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Invalid google token');
        });
    });

    describe('Error Handler Coverage', () => {
    it('should handle GoogleAuthError and return 401', async () => {
        jest.spyOn(UserController, 'googleLogin').mockImplementation(() => {
            throw { name: 'GoogleAuthError' };
        });

        const response = await request(app)
            .post('/users/google-login') 
            .send({ token: 'invalid-google-token' });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Invalid token');
    });
});

});