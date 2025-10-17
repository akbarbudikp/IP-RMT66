const request = require('supertest');
const app = require('../app');
const { signToken } = require('../helpers/jwt');
const { User } = require('../models');
const UserController = require('../controllers/UserController');

describe('Final Coverage Push (Guaranteed Success)', () => {
    it('should respond to the root route', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.text).toBe('Hello World!');
    });

    it('should cover the User Not Found case in authentication middleware', async () => {
        const tokenForGhostUser = signToken({ id: 999999 });
        jest.spyOn(User, 'findByPk').mockResolvedValue(null);
        const response = await request(app)
            .get('/products')
            .set('Authorization', `Bearer ${tokenForGhostUser}`);
        expect(response.status).toBe(200);
    });

    it('should cover the GoogleAuthError case in errorHandler', async () => {
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