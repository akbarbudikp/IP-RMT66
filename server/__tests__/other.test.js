const request = require('supertest');
const app = require('../app');
const { signToken } = require('../helpers/jwt');
const UserController = require('../controllers/UserController');

describe('Targeted Coverage Tests (100% Success)', () => {
    describe('Error Handler', () => {
        it('should handle GoogleAuthError and return 401', async () => {
            jest.spyOn(UserController, 'googleLogin').mockImplementation(() => {
                throw { name: 'GoogleAuthError' };
            });
            const response = await request(app)
                .post('/users/google-login')
                .send({ google_token: 'any-fake-token' });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'Invalid token');
        });
    });

    describe('Authentication Middleware', () => {
        it('should return 401 for an invalid or malformed token', async () => {
            const response = await request(app)
                .get('/orders')
                .set('Authorization', `Bearer invalid-jwt-token`);
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'Invalid token');
        });
    });
});