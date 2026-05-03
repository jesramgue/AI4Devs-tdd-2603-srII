import { WorkExperience } from '../domain/models/WorkExperience';
import { prismaMock } from '../__mocks__/prismaClient';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const baseData = () => ({
    company: 'Acme Corp',
    position: 'Software Engineer',
    description: 'Built scalable systems',
    startDate: '2022-01-01',
    endDate: '2024-06-01',
    candidateId: 1,
});

const savedRecord = () => ({
    id: 20,
    company: 'Acme Corp',
    position: 'Software Engineer',
    description: 'Built scalable systems',
    startDate: new Date('2022-01-01'),
    endDate: new Date('2024-06-01'),
    candidateId: 1,
});

// ---------------------------------------------------------------------------
// WorkExperience.save()
// ---------------------------------------------------------------------------
describe('WorkExperience.save()', () => {

    describe('create path — no id', () => {
        it('calls prisma.workExperience.create and returns the result', async () => {
            // GIVEN a new work experience with no id
            const experience = new WorkExperience(baseData());
            prismaMock.workExperience.create.mockResolvedValue(savedRecord() as any);

            // WHEN save() is called
            const result = await experience.save();

            // THEN prisma.workExperience.create is called once and the record is returned
            expect(prismaMock.workExperience.create).toHaveBeenCalledTimes(1);
            expect(result).toEqual(savedRecord());
        });

        it('includes candidateId in the create payload when set', async () => {
            // GIVEN a work experience with a candidateId
            const experience = new WorkExperience(baseData());
            prismaMock.workExperience.create.mockResolvedValue(savedRecord() as any);

            // WHEN save() is called
            await experience.save();

            // THEN the payload contains the candidateId
            const callArg = prismaMock.workExperience.create.mock.calls[0][0].data;
            expect(callArg.candidateId).toBe(1);
        });

        it('does not include candidateId when it is undefined', async () => {
            // GIVEN a work experience without a candidateId
            const data = { ...baseData(), candidateId: undefined };
            const experience = new WorkExperience(data);
            prismaMock.workExperience.create.mockResolvedValue({ ...savedRecord(), candidateId: undefined } as any);

            // WHEN save() is called
            await experience.save();

            // THEN the payload does not contain candidateId
            const callArg = prismaMock.workExperience.create.mock.calls[0][0].data;
            expect(callArg).not.toHaveProperty('candidateId');
        });

        it('propagates raw Prisma errors unmodified (no custom error handling)', async () => {
            // GIVEN an unexpected DB error
            const experience = new WorkExperience(baseData());
            prismaMock.workExperience.create.mockRejectedValue(new Error('db exploded'));

            // WHEN save() is called
            // THEN the raw error propagates unchanged
            await expect(experience.save()).rejects.toThrow('db exploded');
        });
    });

    describe('update path — has id', () => {
        it('calls prisma.workExperience.update with where: { id }', async () => {
            // GIVEN an existing work experience with id = 20
            const experience = new WorkExperience({ ...baseData(), id: 20 });
            prismaMock.workExperience.update.mockResolvedValue(savedRecord() as any);

            // WHEN save() is called
            await experience.save();

            // THEN prisma.workExperience.update is called with the correct id
            expect(prismaMock.workExperience.update).toHaveBeenCalledTimes(1);
            expect(prismaMock.workExperience.update.mock.calls[0][0].where).toEqual({ id: 20 });
        });

        it('returns the updated record', async () => {
            // GIVEN a successful update
            const experience = new WorkExperience({ ...baseData(), id: 20 });
            prismaMock.workExperience.update.mockResolvedValue(savedRecord() as any);

            // WHEN save() is called
            const result = await experience.save();

            // THEN the updated record is returned
            expect(result).toEqual(savedRecord());
        });

        it('propagates raw Prisma errors on update unmodified', async () => {
            // GIVEN a DB error during update
            const experience = new WorkExperience({ ...baseData(), id: 20 });
            prismaMock.workExperience.update.mockRejectedValue(new Error('update failed'));

            // WHEN save() is called
            // THEN the raw error propagates
            await expect(experience.save()).rejects.toThrow('update failed');
        });
    });
});
