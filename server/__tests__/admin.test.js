const request = require('supertest');
const app = require('../app');
const { signToken } = require('../helpers/jwt');
const authentication = require('../helpers/authentication');

describe('Final Coverage Push (Guaranteed Success)', () => {
    beforeAll(() => {
        app.get('/__test_auth_route', authentication, (req, res) => {
            res.status(200).json({ message: 'Success' });
        });

        app.get('/__test_error_route', (req, res, next) => {
            throw { name: 'GoogleAuthError' };
        });
    });

    it('should cover JsonWebTokenError case in authentication middleware', async () => {
        const response = await request(app)
            .get('/__test_auth_route')
            .set('Authorization', 'Bearer this-is-a-bad-token');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Invalid token');
    });

    it('should cover User Not Found case in authentication middleware', async () => {
        const tokenForGhostUser = signToken({ id: 999999 });

        const response = await request(app)
            .get('/__test_auth_route')
            .set('Authorization', `Bearer ${tokenForGhostUser}`);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Invalid token');
    });

    it('should cover GoogleAuthError case in errorHandler', async () => {
        const response = await request(app).get('/__test_error_route');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Invalid token');
    });
});