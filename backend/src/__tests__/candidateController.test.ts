import request from 'supertest';
import express from 'express';
import { addCandidateController } from '../presentation/controllers/candidateController';
import { addCandidate } from '../application/services/candidateService';

// ---------------------------------------------------------------------------
// Mock the service layer — controller must not touch real business logic
// ---------------------------------------------------------------------------
jest.mock('../application/services/candidateService', () => ({
    addCandidate: jest.fn(),
}));

const mockAddCandidate = addCandidate as jest.MockedFunction<typeof addCandidate>;

// ---------------------------------------------------------------------------
// Minimal Express app wired with only the controller under test
// ---------------------------------------------------------------------------
const app = express();
app.use(express.json());
app.post('/candidates', addCandidateController);

// ---------------------------------------------------------------------------
// addCandidateController
// ---------------------------------------------------------------------------
describe('addCandidateController', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // -----------------------------------------------------------------------
    // 201 — success
    // -----------------------------------------------------------------------
    describe('when the service resolves successfully', () => {
        it('responds with 201 and { message, data } containing the saved candidate', async () => {
            // GIVEN the service returns a saved candidate
            const savedCandidate = { id: 1, firstName: 'Ana', lastName: 'García', email: 'ana@example.com' };
            mockAddCandidate.mockResolvedValue(savedCandidate as any);

            // WHEN a POST request is made
            const response = await request(app)
                .post('/candidates')
                .send({ firstName: 'Ana', lastName: 'García', email: 'ana@example.com' });

            // THEN 201 is returned with the correct body
            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                message: 'Candidate added successfully',
                data: savedCandidate,
            });
        });

        it('passes the full request body to addCandidate', async () => {
            // GIVEN the service resolves
            mockAddCandidate.mockResolvedValue({ id: 1 } as any);
            const payload = { firstName: 'Ana', lastName: 'García', email: 'ana@example.com', phone: '612345678' };

            // WHEN a POST request is made
            await request(app).post('/candidates').send(payload);

            // THEN addCandidate receives the exact request body
            expect(mockAddCandidate).toHaveBeenCalledWith(payload);
        });
    });

    // -----------------------------------------------------------------------
    // 400 — service throws a known Error
    // -----------------------------------------------------------------------
    describe('when the service throws an Error instance', () => {
        it('responds with 400 and { message, error } containing the error message', async () => {
            // GIVEN the service throws a known error
            mockAddCandidate.mockRejectedValue(new Error('The email already exists in the database'));

            // WHEN a POST request is made
            const response = await request(app)
                .post('/candidates')
                .send({ firstName: 'Ana', lastName: 'García', email: 'duplicate@example.com' });

            // THEN 400 is returned with the error message
            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                message: 'Error adding candidate',
                error: 'The email already exists in the database',
            });
        });

        it('responds with 400 and the validation error message when validation fails', async () => {
            // GIVEN the service throws a validation error
            mockAddCandidate.mockRejectedValue(new Error('Invalid name'));

            // WHEN a POST request is made
            const response = await request(app)
                .post('/candidates')
                .send({ firstName: '', lastName: 'García', email: 'ana@example.com' });

            // THEN 400 is returned with the validation error
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid name');
        });
    });

    // -----------------------------------------------------------------------
    // 400 — service throws a non-Error value
    // -----------------------------------------------------------------------
    describe('when the service throws a non-Error value', () => {
        it('responds with 400 and error: "Unknown error"', async () => {
            // GIVEN the service throws a plain string (not an Error instance)
            mockAddCandidate.mockRejectedValue('something went wrong');

            // WHEN a POST request is made
            const response = await request(app)
                .post('/candidates')
                .send({ firstName: 'Ana', lastName: 'García', email: 'ana@example.com' });

            // THEN 400 is returned with the fallback message
            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                message: 'Error adding candidate',
                error: 'Unknown error',
            });
        });
    });
});
