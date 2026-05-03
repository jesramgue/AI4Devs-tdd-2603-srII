import { Resume } from '../domain/models/Resume';
import { prismaMock } from '../__mocks__/prismaClient';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const baseData = () => ({
    filePath: '/uploads/cv.pdf',
    fileType: 'application/pdf',
    candidateId: 1,
});

const savedRecord = () => ({
    id: 30,
    filePath: '/uploads/cv.pdf',
    fileType: 'application/pdf',
    candidateId: 1,
    uploadDate: new Date(),
});

// ---------------------------------------------------------------------------
// Resume.save() / Resume.create()
// ---------------------------------------------------------------------------
describe('Resume.save()', () => {

    describe('create path — no id', () => {
        it('calls prisma.resume.create and returns a Resume instance', async () => {
            // GIVEN a new resume with no id
            const resume = new Resume(baseData());
            prismaMock.resume.create.mockResolvedValue(savedRecord() as any);

            // WHEN save() is called
            const result = await resume.save();

            // THEN prisma.resume.create is called once
            expect(prismaMock.resume.create).toHaveBeenCalledTimes(1);
            expect(result).toBeInstanceOf(Resume);
        });

        it('sends candidateId, filePath, fileType, and an uploadDate to prisma', async () => {
            // GIVEN a new resume
            const resume = new Resume(baseData());
            prismaMock.resume.create.mockResolvedValue(savedRecord() as any);

            // WHEN save() is called
            await resume.save();

            // THEN all required fields are in the create payload
            const callArg = prismaMock.resume.create.mock.calls[0][0].data;
            expect(callArg.candidateId).toBe(1);
            expect(callArg.filePath).toBe('/uploads/cv.pdf');
            expect(callArg.fileType).toBe('application/pdf');
            expect(callArg.uploadDate).toBeInstanceOf(Date);
        });

        it('propagates raw Prisma errors unmodified', async () => {
            // GIVEN an unexpected DB error
            const resume = new Resume(baseData());
            prismaMock.resume.create.mockRejectedValue(new Error('db error'));

            // WHEN save() is called
            // THEN the error propagates
            await expect(resume.save()).rejects.toThrow('db error');
        });
    });

    describe('update path — has id', () => {
        it('throws "No se permite la actualización de un currículum existente." when id is set', async () => {
            // GIVEN an existing resume with an id
            const resume = new Resume({ ...baseData(), id: 30 });

            // WHEN save() is called
            // THEN an error is thrown — updates on resumes are not allowed
            await expect(resume.save()).rejects.toThrow(
                'No se permite la actualización de un currículum existente.'
            );
        });

        it('does not call prisma.resume.create or prisma.resume.update when id is set', async () => {
            // GIVEN an existing resume
            const resume = new Resume({ ...baseData(), id: 30 });

            // WHEN save() is called (and throws)
            await resume.save().catch(() => { /* expected */ });

            // THEN no Prisma calls are made
            expect(prismaMock.resume.create).not.toHaveBeenCalled();
            expect(prismaMock.resume.update).not.toHaveBeenCalled();
        });
    });
});
