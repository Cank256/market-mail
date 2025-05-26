import request from 'supertest';
import app from '../../src/app'; // Adjust the path as necessary
import { connectDB, disconnectDB } from '../../src/config/db'; // MongoDB connection setup

describe('Webhook Integration Tests', () => {
    beforeAll(async () => {
        await connectDB(); // Connect to the database before tests
    });

    afterAll(async () => {
        await disconnectDB(); // Disconnect from the database after tests
    });

    it('should successfully process a valid webhook request', async () => {
        const validWebhookPayload = {
            // Add a valid payload structure according to your webhook requirements
            "Market": "Nakasero",
            "Date": "2025-05-24",
            "Maize (kg)": 1800,
            "Beans (kg)": 2900,
            "Tomatoes (crate)": 9500
        };

        const response = await request(app)
            .post('/api/postmark/inbound') // Adjust the endpoint as necessary
            .send(validWebhookPayload)
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Webhook processed successfully');
    });

    it('should return 400 for invalid webhook payload', async () => {
        const invalidWebhookPayload = {
            // Add an invalid payload structure
        };

        const response = await request(app)
            .post('/api/postmark/inbound')
            .send(invalidWebhookPayload)
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid payload');
    });
});