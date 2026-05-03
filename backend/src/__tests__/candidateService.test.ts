import { addCandidate } from '../application/services/candidateService';
import { Candidate } from '../domain/models/Candidate';
import { Education } from '../domain/models/Education';
import { WorkExperience } from '../domain/models/WorkExperience';
import { Resume } from '../domain/models/Resume';

// ---------------------------------------------------------------------------
// Mock all domain models — service layer must not touch real Prisma
// ---------------------------------------------------------------------------
jest.mock('../domain/models/Candidate');
jest.mock('../domain/models/Education');
jest.mock('../domain/models/WorkExperience');
jest.mock('../domain/models/Resume');

const MockCandidate = Candidate as jest.MockedClass<typeof Candidate>;
const MockEducation = Education as jest.MockedClass<typeof Education>;
const MockWorkExperience = WorkExperience as jest.MockedClass<typeof WorkExperience>;
const MockResume = Resume as jest.MockedClass<typeof Resume>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const basePayload = () => ({
    firstName: 'Ana',
    lastName: 'García',
    email: 'ana@example.com',
});

const savedCandidate = { id: 1, firstName: 'Ana', lastName: 'García', email: 'ana@example.com' };

/** Stub a Candidate mock instance so its array properties are initialised */
function stubCandidateInstance(saveFn: jest.Mock) {
    MockCandidate.mockImplementation(() => ({
        save: saveFn,
        education: [],
        workExperience: [],
        resumes: [],
    } as any));
}

beforeEach(() => {
    jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// addCandidate
// ---------------------------------------------------------------------------
describe('addCandidate()', () => {

    // -----------------------------------------------------------------------
    // Validation failures — no DB interaction
    // -----------------------------------------------------------------------
    describe('validation failures', () => {
        it('throws when firstName is missing — no Prisma call is made', async () => {
            // GIVEN an invalid payload
            const data = { ...basePayload(), firstName: '' };
            stubCandidateInstance(jest.fn());

            // WHEN addCandidate is called
            // THEN an error is thrown and save() is never called
            await expect(addCandidate(data)).rejects.toThrow();
            expect(MockCandidate).not.toHaveBeenCalled();
        });

        it('throws when email is invalid — no Prisma call is made', async () => {
            // GIVEN a payload with an invalid email
            const data = { ...basePayload(), email: 'not-valid' };
            stubCandidateInstance(jest.fn());

            // WHEN / THEN
            await expect(addCandidate(data)).rejects.toThrow();
            expect(MockCandidate).not.toHaveBeenCalled();
        });

        it('wraps the validator error message in a new Error', async () => {
            // GIVEN a payload that fails name validation
            const data = { ...basePayload(), firstName: '1' };

            // WHEN addCandidate is called
            const err = await addCandidate(data).catch(e => e);

            // THEN the error message contains the original validation message
            expect(err.message).toContain('Invalid name');
        });
    });

    // -----------------------------------------------------------------------
    // Happy path — candidate only
    // -----------------------------------------------------------------------
    describe('happy path — candidate with no relations', () => {
        it('saves the candidate and returns the saved record', async () => {
            // GIVEN a valid minimal payload
            const saveFn = jest.fn().mockResolvedValue(savedCandidate);
            stubCandidateInstance(saveFn);

            // WHEN addCandidate is called
            const result = await addCandidate(basePayload());

            // THEN save is called once and the saved record is returned
            expect(saveFn).toHaveBeenCalledTimes(1);
            expect(result).toEqual(savedCandidate);
        });

        it('does not call Education, WorkExperience, or Resume save when not provided', async () => {
            // GIVEN a payload with no relations
            stubCandidateInstance(jest.fn().mockResolvedValue(savedCandidate));
            MockEducation.prototype.save = jest.fn();
            MockWorkExperience.prototype.save = jest.fn();
            MockResume.prototype.save = jest.fn();

            // WHEN addCandidate is called
            await addCandidate(basePayload());

            // THEN no relation models are instantiated or saved
            expect(MockEducation.prototype.save).not.toHaveBeenCalled();
            expect(MockWorkExperience.prototype.save).not.toHaveBeenCalled();
            expect(MockResume.prototype.save).not.toHaveBeenCalled();
        });
    });

    // -----------------------------------------------------------------------
    // Happy path — with educations
    // -----------------------------------------------------------------------
    describe('happy path — candidate with educations', () => {
        it('saves each education entry with the candidateId assigned', async () => {
            // GIVEN a payload with two education entries
            stubCandidateInstance(jest.fn().mockResolvedValue(savedCandidate));
            MockEducation.prototype.save = jest.fn().mockResolvedValue({});
            const edu1 = { institution: 'MIT', title: 'CS', startDate: '2020-01-01' };
            const edu2 = { institution: 'Harvard', title: 'MBA', startDate: '2023-01-01' };
            const data = { ...basePayload(), educations: [edu1, edu2] };

            // WHEN addCandidate is called
            await addCandidate(data);

            // THEN Education.save is called twice, once per entry
            expect(MockEducation.prototype.save).toHaveBeenCalledTimes(2);
        });

        it('assigns the saved candidateId to each Education instance', async () => {
            // GIVEN a candidate saved with id = 1
            stubCandidateInstance(jest.fn().mockResolvedValue(savedCandidate));
            MockEducation.prototype.save = jest.fn().mockResolvedValue({});
            const data = { ...basePayload(), educations: [{ institution: 'MIT', title: 'CS', startDate: '2020-01-01' }] };

            // WHEN addCandidate is called
            await addCandidate(data);

            // THEN the Education instance was given candidateId = 1
            const eduInstance = MockEducation.mock.instances[0];
            expect((eduInstance as any).candidateId).toBe(1);
        });
    });

    // -----------------------------------------------------------------------
    // Happy path — with workExperiences
    // -----------------------------------------------------------------------
    describe('happy path — candidate with workExperiences', () => {
        it('saves each work experience with the candidateId assigned', async () => {
            // GIVEN a payload with one work experience
            stubCandidateInstance(jest.fn().mockResolvedValue(savedCandidate));
            MockWorkExperience.prototype.save = jest.fn().mockResolvedValue({});
            const data = {
                ...basePayload(),
                workExperiences: [{ company: 'Acme', position: 'Dev', startDate: '2022-01-01' }],
            };

            // WHEN addCandidate is called
            await addCandidate(data);

            // THEN WorkExperience.save is called once
            expect(MockWorkExperience.prototype.save).toHaveBeenCalledTimes(1);
        });

        it('assigns the saved candidateId to each WorkExperience instance', async () => {
            // GIVEN a candidate saved with id = 1
            stubCandidateInstance(jest.fn().mockResolvedValue(savedCandidate));
            MockWorkExperience.prototype.save = jest.fn().mockResolvedValue({});
            const data = {
                ...basePayload(),
                workExperiences: [{ company: 'Acme', position: 'Dev', startDate: '2022-01-01' }],
            };

            // WHEN addCandidate is called
            await addCandidate(data);

            // THEN the WorkExperience instance has candidateId = 1
            const expInstance = MockWorkExperience.mock.instances[0];
            expect((expInstance as any).candidateId).toBe(1);
        });
    });

    // -----------------------------------------------------------------------
    // Happy path — with cv
    // -----------------------------------------------------------------------
    describe('happy path — candidate with cv', () => {
        it('saves the resume with the candidateId assigned', async () => {
            // GIVEN a payload with a cv object
            stubCandidateInstance(jest.fn().mockResolvedValue(savedCandidate));
            MockResume.prototype.save = jest.fn().mockResolvedValue({});
            const data = { ...basePayload(), cv: { filePath: '/cv.pdf', fileType: 'application/pdf' } };

            // WHEN addCandidate is called
            await addCandidate(data);

            // THEN Resume.save is called once
            expect(MockResume.prototype.save).toHaveBeenCalledTimes(1);
        });

        it('does not save a resume when cv is an empty object', async () => {
            // GIVEN a payload with an empty cv
            stubCandidateInstance(jest.fn().mockResolvedValue(savedCandidate));
            MockResume.prototype.save = jest.fn();
            const data = { ...basePayload(), cv: {} };

            // WHEN addCandidate is called
            await addCandidate(data);

            // THEN Resume.save is not called
            expect(MockResume.prototype.save).not.toHaveBeenCalled();
        });
    });

    // -----------------------------------------------------------------------
    // Persistence order
    // -----------------------------------------------------------------------
    describe('persistence order', () => {
        it('saves Candidate before Education, Education before WorkExperience, WorkExperience before Resume', async () => {
            // GIVEN a full payload with all relations
            const callOrder: string[] = [];
            const saveFn = jest.fn().mockImplementation(async () => {
                callOrder.push('candidate');
                return savedCandidate;
            });
            stubCandidateInstance(saveFn);
            MockEducation.prototype.save = jest.fn().mockImplementation(async () => {
                callOrder.push('education');
                return {};
            });
            MockWorkExperience.prototype.save = jest.fn().mockImplementation(async () => {
                callOrder.push('workExperience');
                return {};
            });
            MockResume.prototype.save = jest.fn().mockImplementation(async () => {
                callOrder.push('resume');
                return {};
            });
            const data = {
                ...basePayload(),
                educations: [{ institution: 'MIT', title: 'CS', startDate: '2020-01-01' }],
                workExperiences: [{ company: 'Acme', position: 'Dev', startDate: '2022-01-01' }],
                cv: { filePath: '/cv.pdf', fileType: 'application/pdf' },
            };

            // WHEN addCandidate is called
            await addCandidate(data);

            // THEN the save order is: candidate → education → workExperience → resume
            expect(callOrder).toEqual(['candidate', 'education', 'workExperience', 'resume']);
        });
    });

    // -----------------------------------------------------------------------
    // Error paths
    // -----------------------------------------------------------------------
    describe('error paths', () => {
        it('throws "The email already exists in the database" when Prisma returns P2002', async () => {
            // GIVEN the DB rejects with a unique-constraint violation
            stubCandidateInstance(
                jest.fn().mockRejectedValue(Object.assign(new Error('Unique constraint failed'), { code: 'P2002' }))
            );

            // WHEN addCandidate is called
            // THEN the friendly error message is thrown
            await expect(addCandidate(basePayload())).rejects.toThrow(
                'The email already exists in the database'
            );
        });

        it('rethrows unhandled errors from candidate.save() as-is', async () => {
            // GIVEN an unexpected error from the DB layer
            stubCandidateInstance(
                jest.fn().mockRejectedValue(Object.assign(new Error('unexpected'), { code: 'P9999' }))
            );

            // WHEN addCandidate is called
            // THEN the original error propagates
            await expect(addCandidate(basePayload())).rejects.toThrow('unexpected');
        });
    });
});
