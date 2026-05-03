import { Candidate } from '../domain/models/Candidate';
import { prismaMock } from '../__mocks__/prismaClient';

// Import error classes via the sub-path so the moduleNameMapper (which only
// intercepts the bare `@prisma/client` specifier) does not apply here.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClientInitializationError } = require('@prisma/client/default') as any;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const baseData = () => ({
    firstName: 'Ana',
    lastName: 'García',
    email: 'ana@example.com',
    phone: '612345678',
    address: 'Calle Mayor 1',
    education: [],
    workExperience: [],
    resumes: [],
});

const savedRecord = () => ({
    id: 1,
    firstName: 'Ana',
    lastName: 'García',
    email: 'ana@example.com',
    phone: '612345678',
    address: 'Calle Mayor 1',
});

// ---------------------------------------------------------------------------
// Candidate.save()
// ---------------------------------------------------------------------------
describe('Candidate.save()', () => {

    // -----------------------------------------------------------------------
    // CREATE path (no id)
    // -----------------------------------------------------------------------
    describe('create path — no id', () => {
        it('calls prisma.candidate.create and returns the result', async () => {
            // GIVEN a new candidate with no id
            const candidate = new Candidate(baseData());
            prismaMock.candidate.create.mockResolvedValue(savedRecord() as any);

            // WHEN save() is called
            const result = await candidate.save();

            // THEN prisma.candidate.create is called once and the record is returned
            expect(prismaMock.candidate.create).toHaveBeenCalledTimes(1);
            expect(result).toEqual(savedRecord());
        });

        it('includes only defined scalar fields in the create payload', async () => {
            // GIVEN a candidate without phone and address
            const data = { firstName: 'Ana', lastName: 'García', email: 'ana@example.com', education: [], workExperience: [], resumes: [] };
            const candidate = new Candidate(data);
            prismaMock.candidate.create.mockResolvedValue({ id: 1, ...data } as any);

            // WHEN save() is called
            await candidate.save();

            // THEN the create payload does not contain phone or address keys
            const callArg = prismaMock.candidate.create.mock.calls[0][0].data;
            expect(callArg).not.toHaveProperty('phone');
            expect(callArg).not.toHaveProperty('address');
        });

        it('includes nested educations.create when education array is non-empty', async () => {
            // GIVEN a candidate with one education entry
            const data = {
                ...baseData(),
                education: [{ institution: 'MIT', title: 'CS', startDate: new Date('2020-01-01'), endDate: undefined }],
            };
            const candidate = new Candidate(data);
            prismaMock.candidate.create.mockResolvedValue(savedRecord() as any);

            // WHEN save() is called
            await candidate.save();

            // THEN educations nested create is sent to Prisma
            const callArg = prismaMock.candidate.create.mock.calls[0][0].data as any;
            expect(callArg.educations.create).toHaveLength(1);
            expect(callArg.educations.create[0].institution).toBe('MIT');
        });

        it('includes nested workExperiences.create when workExperience array is non-empty', async () => {
            // GIVEN a candidate with one work experience
            const data = {
                ...baseData(),
                workExperience: [{ company: 'Acme', position: 'Dev', description: 'Code', startDate: new Date('2022-01-01'), endDate: undefined }],
            };
            const candidate = new Candidate(data);
            prismaMock.candidate.create.mockResolvedValue(savedRecord() as any);

            // WHEN save() is called
            await candidate.save();

            // THEN workExperiences nested create is sent to Prisma
            const callArg = prismaMock.candidate.create.mock.calls[0][0].data as any;
            expect(callArg.workExperiences.create).toHaveLength(1);
            expect(callArg.workExperiences.create[0].company).toBe('Acme');
        });

        it('includes nested resumes.create when resumes array is non-empty', async () => {
            // GIVEN a candidate with one resume
            const data = {
                ...baseData(),
                resumes: [{ filePath: '/cv.pdf', fileType: 'application/pdf' }],
            };
            const candidate = new Candidate(data);
            prismaMock.candidate.create.mockResolvedValue(savedRecord() as any);

            // WHEN save() is called
            await candidate.save();

            // THEN resumes nested create is sent to Prisma
            const callArg = prismaMock.candidate.create.mock.calls[0][0].data as any;
            expect(callArg.resumes.create).toHaveLength(1);
            expect(callArg.resumes.create[0].filePath).toBe('/cv.pdf');
        });

        it('does not include educations key when education array is empty', async () => {
            // GIVEN a candidate with no education
            const candidate = new Candidate(baseData());
            prismaMock.candidate.create.mockResolvedValue(savedRecord() as any);

            // WHEN save() is called
            await candidate.save();

            // THEN no educations key is present in the payload
            const callArg = prismaMock.candidate.create.mock.calls[0][0].data;
            expect(callArg).not.toHaveProperty('educations');
        });

        it('throws the Spanish connection error when PrismaClientInitializationError occurs on create', async () => {
            // GIVEN the DB is unreachable
            const candidate = new Candidate(baseData());
            prismaMock.candidate.create.mockRejectedValue(
                new PrismaClientInitializationError('conn failed', '5.x')
            );

            // WHEN save() is called
            // THEN the Spanish-language connection error is thrown
            await expect(candidate.save()).rejects.toThrow(
                'No se pudo conectar con la base de datos. Por favor, asegúrese de que el servidor de base de datos esté en ejecución.'
            );
        });

        it('rethrows unhandled Prisma errors on create', async () => {
            // GIVEN an unexpected Prisma error
            const candidate = new Candidate(baseData());
            const unexpectedError = Object.assign(new Error('boom'), { code: 'P9999' });
            prismaMock.candidate.create.mockRejectedValue(unexpectedError);

            // WHEN save() is called
            // THEN the original error propagates
            await expect(candidate.save()).rejects.toThrow('boom');
        });
    });

    // -----------------------------------------------------------------------
    // UPDATE path (has id)
    // -----------------------------------------------------------------------
    describe('update path — has id', () => {
        it('calls prisma.candidate.update with where: { id } and returns the result', async () => {
            // GIVEN an existing candidate with id = 5
            const candidate = new Candidate({ ...baseData(), id: 5 });
            prismaMock.candidate.update.mockResolvedValue({ ...savedRecord(), id: 5 } as any);

            // WHEN save() is called
            const result = await candidate.save();

            // THEN prisma.candidate.update is called with the correct id
            expect(prismaMock.candidate.update).toHaveBeenCalledTimes(1);
            expect(prismaMock.candidate.update.mock.calls[0][0].where).toEqual({ id: 5 });
            expect(result).toMatchObject({ id: 5 });
        });

        it('throws the Spanish connection error when PrismaClientInitializationError occurs on update', async () => {
            // GIVEN an existing candidate and the DB is unreachable
            const candidate = new Candidate({ ...baseData(), id: 5 });
            prismaMock.candidate.update.mockRejectedValue(
                new PrismaClientInitializationError('conn failed', '5.x')
            );

            // WHEN save() is called
            // THEN the Spanish-language connection error is thrown
            await expect(candidate.save()).rejects.toThrow(
                'No se pudo conectar con la base de datos. Por favor, asegúrese de que el servidor de base de datos esté en ejecución.'
            );
        });

        it('throws the Spanish not-found error when Prisma returns P2025', async () => {
            // GIVEN an existing candidate id that no longer exists in the DB
            const candidate = new Candidate({ ...baseData(), id: 99 });
            prismaMock.candidate.update.mockRejectedValue(
                Object.assign(new Error('Record not found'), { code: 'P2025' })
            );

            // WHEN save() is called
            // THEN the Spanish-language not-found error is thrown
            await expect(candidate.save()).rejects.toThrow(
                'No se pudo encontrar el registro del candidato con el ID proporcionado.'
            );
        });

        it('rethrows unhandled errors on update', async () => {
            // GIVEN an unexpected error during update
            const candidate = new Candidate({ ...baseData(), id: 5 });
            prismaMock.candidate.update.mockRejectedValue(
                Object.assign(new Error('unexpected'), { code: 'P9999' })
            );

            // WHEN save() is called
            // THEN the original error propagates
            await expect(candidate.save()).rejects.toThrow('unexpected');
        });
    });

    // -----------------------------------------------------------------------
    // Candidate.findOne()
    // -----------------------------------------------------------------------
    describe('Candidate.findOne()', () => {
        it('returns a Candidate instance when the record exists', async () => {
            // GIVEN prisma returns a candidate record
            prismaMock.candidate.findUnique.mockResolvedValue(savedRecord() as any);

            // WHEN findOne is called
            const result = await Candidate.findOne(1);

            // THEN a Candidate instance is returned
            expect(result).toBeInstanceOf(Candidate);
            expect(result?.email).toBe('ana@example.com');
        });

        it('returns null when the record does not exist', async () => {
            // GIVEN prisma returns null
            prismaMock.candidate.findUnique.mockResolvedValue(null);

            // WHEN findOne is called
            const result = await Candidate.findOne(999);

            // THEN null is returned
            expect(result).toBeNull();
        });
    });
});
