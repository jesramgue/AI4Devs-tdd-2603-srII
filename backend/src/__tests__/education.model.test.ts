import { Education } from '../domain/models/Education';
import { prismaMock } from '../__mocks__/prismaClient';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const baseData = () => ({
    institution: 'MIT',
    title: 'Computer Science',
    startDate: '2020-01-01',
    endDate: '2024-06-01',
    candidateId: 1,
});

const savedRecord = () => ({
    id: 10,
    institution: 'MIT',
    title: 'Computer Science',
    startDate: new Date('2020-01-01'),
    endDate: new Date('2024-06-01'),
    candidateId: 1,
});

// ---------------------------------------------------------------------------
// Education.save()
// ---------------------------------------------------------------------------
describe('Education.save()', () => {

    describe('create path — no id', () => {
        it('calls prisma.education.create and returns the result', async () => {
            // GIVEN a new Education entry with no id
            const education = new Education(baseData());
            prismaMock.education.create.mockResolvedValue(savedRecord() as any);

            // WHEN save() is called
            const result = await education.save();

            // THEN prisma.education.create is called once and the record is returned
            expect(prismaMock.education.create).toHaveBeenCalledTimes(1);
            expect(result).toEqual(savedRecord());
        });

        it('includes candidateId in the create payload when set', async () => {
            // GIVEN an education entry with a candidateId
            const education = new Education(baseData());
            prismaMock.education.create.mockResolvedValue(savedRecord() as any);

            // WHEN save() is called
            await education.save();

            // THEN the payload contains the candidateId
            const callArg = prismaMock.education.create.mock.calls[0][0].data;
            expect(callArg.candidateId).toBe(1);
        });

        it('does not include candidateId in the payload when it is undefined', async () => {
            // GIVEN an education entry without a candidateId
            const data = { ...baseData(), candidateId: undefined };
            const education = new Education(data);
            prismaMock.education.create.mockResolvedValue({ ...savedRecord(), candidateId: undefined } as any);

            // WHEN save() is called
            await education.save();

            // THEN the payload does not contain candidateId
            const callArg = prismaMock.education.create.mock.calls[0][0].data;
            expect(callArg).not.toHaveProperty('candidateId');
        });

        it('propagates raw Prisma errors unmodified (no custom error handling)', async () => {
            // GIVEN an unexpected DB error
            const education = new Education(baseData());
            const rawError = Object.assign(new Error('db error'), { code: 'P9999' });
            prismaMock.education.create.mockRejectedValue(rawError);

            // WHEN save() is called
            // THEN the raw error propagates unchanged
            await expect(education.save()).rejects.toThrow('db error');
        });
    });

    describe('update path — has id', () => {
        it('calls prisma.education.update with where: { id }', async () => {
            // GIVEN an existing education entry with id = 10
            const education = new Education({ ...baseData(), id: 10 });
            prismaMock.education.update.mockResolvedValue(savedRecord() as any);

            // WHEN save() is called
            await education.save();

            // THEN prisma.education.update is called with the correct id
            expect(prismaMock.education.update).toHaveBeenCalledTimes(1);
            expect(prismaMock.education.update.mock.calls[0][0].where).toEqual({ id: 10 });
        });

        it('returns the updated record', async () => {
            // GIVEN an existing education and a successful update
            const education = new Education({ ...baseData(), id: 10 });
            prismaMock.education.update.mockResolvedValue(savedRecord() as any);

            // WHEN save() is called
            const result = await education.save();

            // THEN the updated record is returned
            expect(result).toEqual(savedRecord());
        });

        it('propagates raw Prisma errors on update unmodified', async () => {
            // GIVEN a DB error during update
            const education = new Education({ ...baseData(), id: 10 });
            prismaMock.education.update.mockRejectedValue(new Error('update failed'));

            // WHEN save() is called
            // THEN the raw error propagates
            await expect(education.save()).rejects.toThrow('update failed');
        });
    });
});
