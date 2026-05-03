import { validateCandidateData } from '../application/validator';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const validBase = () => ({
    firstName: 'Ana',
    lastName: 'García',
    email: 'ana@example.com',
});

const validEducation = () => ({
    institution: 'MIT',
    title: 'Computer Science',
    startDate: '2020-01-01',
});

const validExperience = () => ({
    company: 'Acme',
    position: 'Engineer',
    startDate: '2022-06-01',
});

const validCv = () => ({
    filePath: '/uploads/cv.pdf',
    fileType: 'application/pdf',
});

// ---------------------------------------------------------------------------
// validateCandidateData
// ---------------------------------------------------------------------------
describe('validateCandidateData', () => {

    // -----------------------------------------------------------------------
    // Update bypass
    // -----------------------------------------------------------------------
    describe('when data.id is present (update mode)', () => {
        it('skips all validation — even completely invalid fields pass', () => {
            // GIVEN a payload with an id and entirely invalid field values
            const data = {
                id: 1,
                firstName: '',
                lastName: '123',
                email: 'not-an-email',
                phone: '000',
                address: 'x'.repeat(200),
            };
            // WHEN validateCandidateData is called
            // THEN no error is thrown
            expect(() => validateCandidateData(data)).not.toThrow();
        });
    });

    // -----------------------------------------------------------------------
    // firstName / lastName
    // -----------------------------------------------------------------------
    describe('firstName / lastName validation', () => {
        it('throws "Invalid name" when firstName is absent', () => {
            // GIVEN a payload without firstName
            const data = { ...validBase(), firstName: undefined as any };
            // WHEN / THEN
            expect(() => validateCandidateData(data)).toThrow('Invalid name');
        });

        it('throws "Invalid name" when firstName is an empty string', () => {
            expect(() => validateCandidateData({ ...validBase(), firstName: '' })).toThrow('Invalid name');
        });

        it('throws "Invalid name" when firstName is exactly 1 char (below minimum)', () => {
            expect(() => validateCandidateData({ ...validBase(), firstName: 'A' })).toThrow('Invalid name');
        });

        it('accepts firstName of exactly 2 chars (boundary minimum)', () => {
            expect(() => validateCandidateData({ ...validBase(), firstName: 'Al' })).not.toThrow();
        });

        it('accepts firstName of exactly 100 chars (boundary maximum)', () => {
            expect(() => validateCandidateData({ ...validBase(), firstName: 'A'.repeat(100) })).not.toThrow();
        });

        it('throws "Invalid name" when firstName is 101 chars (above maximum)', () => {
            expect(() => validateCandidateData({ ...validBase(), firstName: 'A'.repeat(101) })).toThrow('Invalid name');
        });

        it('throws "Invalid name" when firstName contains digits', () => {
            expect(() => validateCandidateData({ ...validBase(), firstName: 'Ana1' })).toThrow('Invalid name');
        });

        it('accepts firstName with Spanish accented characters', () => {
            expect(() => validateCandidateData({ ...validBase(), firstName: 'ñÑáéíóúÁÉÍÓÚ' })).not.toThrow();
        });

        it('throws "Invalid name" when lastName is absent', () => {
            const data = { ...validBase(), lastName: undefined as any };
            expect(() => validateCandidateData(data)).toThrow('Invalid name');
        });

        it('throws "Invalid name" when lastName is exactly 1 char', () => {
            expect(() => validateCandidateData({ ...validBase(), lastName: 'X' })).toThrow('Invalid name');
        });

        it('accepts lastName of exactly 2 chars', () => {
            expect(() => validateCandidateData({ ...validBase(), lastName: 'Li' })).not.toThrow();
        });
    });

    // -----------------------------------------------------------------------
    // email
    // -----------------------------------------------------------------------
    describe('email validation', () => {
        it('throws "Invalid email" when email is absent', () => {
            const data = { ...validBase(), email: undefined as any };
            expect(() => validateCandidateData(data)).toThrow('Invalid email');
        });

        it('throws "Invalid email" when email has no @ symbol', () => {
            expect(() => validateCandidateData({ ...validBase(), email: 'notanemail' })).toThrow('Invalid email');
        });

        it('throws "Invalid email" when domain TLD is only 1 char', () => {
            expect(() => validateCandidateData({ ...validBase(), email: 'a@b.c' })).toThrow('Invalid email');
        });

        it('accepts a valid email address', () => {
            expect(() => validateCandidateData({ ...validBase(), email: 'user.name+tag@sub.domain.com' })).not.toThrow();
        });
    });

    // -----------------------------------------------------------------------
    // phone (optional)
    // -----------------------------------------------------------------------
    describe('phone validation', () => {
        it('does not throw when phone is absent', () => {
            const { email, firstName, lastName } = validBase();
            expect(() => validateCandidateData({ firstName, lastName, email })).not.toThrow();
        });

        it('does not throw when phone is undefined', () => {
            expect(() => validateCandidateData({ ...validBase(), phone: undefined })).not.toThrow();
        });

        it('throws "Invalid phone" when phone does not start with 6, 7, or 9', () => {
            expect(() => validateCandidateData({ ...validBase(), phone: '800000000' })).toThrow('Invalid phone');
        });

        it('throws "Invalid phone" when phone has fewer than 9 digits total', () => {
            expect(() => validateCandidateData({ ...validBase(), phone: '61234567' })).toThrow('Invalid phone');
        });

        it('throws "Invalid phone" when phone has more than 9 digits total', () => {
            expect(() => validateCandidateData({ ...validBase(), phone: '61234567890' })).toThrow('Invalid phone');
        });

        it('accepts a valid Spanish phone starting with 6', () => {
            expect(() => validateCandidateData({ ...validBase(), phone: '612345678' })).not.toThrow();
        });

        it('accepts a valid Spanish phone starting with 7', () => {
            expect(() => validateCandidateData({ ...validBase(), phone: '712345678' })).not.toThrow();
        });

        it('accepts a valid Spanish phone starting with 9', () => {
            expect(() => validateCandidateData({ ...validBase(), phone: '912345678' })).not.toThrow();
        });
    });

    // -----------------------------------------------------------------------
    // address (optional)
    // -----------------------------------------------------------------------
    describe('address validation', () => {
        it('does not throw when address is absent', () => {
            expect(() => validateCandidateData({ ...validBase() })).not.toThrow();
        });

        it('accepts address of exactly 100 chars (boundary maximum)', () => {
            expect(() => validateCandidateData({ ...validBase(), address: 'x'.repeat(100) })).not.toThrow();
        });

        it('throws "Invalid address" when address is 101 chars (above maximum)', () => {
            expect(() => validateCandidateData({ ...validBase(), address: 'x'.repeat(101) })).toThrow('Invalid address');
        });
    });

    // -----------------------------------------------------------------------
    // educations (optional array)
    // -----------------------------------------------------------------------
    describe('educations validation', () => {
        it('does not throw when educations key is absent', () => {
            expect(() => validateCandidateData({ ...validBase() })).not.toThrow();
        });

        it('throws "Invalid institution" when institution is absent', () => {
            const data = { ...validBase(), educations: [{ ...validEducation(), institution: undefined }] };
            expect(() => validateCandidateData(data)).toThrow('Invalid institution');
        });

        it('throws "Invalid institution" when institution is exactly 101 chars', () => {
            const data = { ...validBase(), educations: [{ ...validEducation(), institution: 'x'.repeat(101) }] };
            expect(() => validateCandidateData(data)).toThrow('Invalid institution');
        });

        it('accepts institution of exactly 100 chars', () => {
            const data = { ...validBase(), educations: [{ ...validEducation(), institution: 'x'.repeat(100) }] };
            expect(() => validateCandidateData(data)).not.toThrow();
        });

        it('throws "Invalid title" when title is absent', () => {
            const data = { ...validBase(), educations: [{ ...validEducation(), title: undefined }] };
            expect(() => validateCandidateData(data)).toThrow('Invalid title');
        });

        it('throws "Invalid title" when title is 101 chars', () => {
            const data = { ...validBase(), educations: [{ ...validEducation(), title: 'x'.repeat(101) }] };
            expect(() => validateCandidateData(data)).toThrow('Invalid title');
        });

        it('throws "Invalid date" when startDate is absent', () => {
            const data = { ...validBase(), educations: [{ ...validEducation(), startDate: undefined }] };
            expect(() => validateCandidateData(data)).toThrow('Invalid date');
        });

        it('throws "Invalid date" when startDate does not match YYYY-MM-DD', () => {
            const data = { ...validBase(), educations: [{ ...validEducation(), startDate: '01-01-2020' }] };
            expect(() => validateCandidateData(data)).toThrow('Invalid date');
        });

        it('throws "Invalid end date" when endDate is present but malformed', () => {
            const data = { ...validBase(), educations: [{ ...validEducation(), endDate: '2023/12/31' }] };
            expect(() => validateCandidateData(data)).toThrow('Invalid end date');
        });

        it('does not throw when endDate is absent (endDate is optional)', () => {
            const data = { ...validBase(), educations: [validEducation()] };
            expect(() => validateCandidateData(data)).not.toThrow();
        });

        it('accepts a valid endDate in YYYY-MM-DD format', () => {
            const data = { ...validBase(), educations: [{ ...validEducation(), endDate: '2023-06-30' }] };
            expect(() => validateCandidateData(data)).not.toThrow();
        });
    });

    // -----------------------------------------------------------------------
    // workExperiences (optional array)
    // -----------------------------------------------------------------------
    describe('workExperiences validation', () => {
        it('does not throw when workExperiences key is absent', () => {
            expect(() => validateCandidateData({ ...validBase() })).not.toThrow();
        });

        it('throws "Invalid company" when company is absent', () => {
            const data = { ...validBase(), workExperiences: [{ ...validExperience(), company: undefined }] };
            expect(() => validateCandidateData(data)).toThrow('Invalid company');
        });

        it('throws "Invalid company" when company is 101 chars', () => {
            const data = { ...validBase(), workExperiences: [{ ...validExperience(), company: 'x'.repeat(101) }] };
            expect(() => validateCandidateData(data)).toThrow('Invalid company');
        });

        it('throws "Invalid position" when position is absent', () => {
            const data = { ...validBase(), workExperiences: [{ ...validExperience(), position: undefined }] };
            expect(() => validateCandidateData(data)).toThrow('Invalid position');
        });

        it('throws "Invalid position" when position is 101 chars', () => {
            const data = { ...validBase(), workExperiences: [{ ...validExperience(), position: 'x'.repeat(101) }] };
            expect(() => validateCandidateData(data)).toThrow('Invalid position');
        });

        it('throws "Invalid description" when description is present and 201 chars', () => {
            const data = { ...validBase(), workExperiences: [{ ...validExperience(), description: 'x'.repeat(201) }] };
            expect(() => validateCandidateData(data)).toThrow('Invalid description');
        });

        it('accepts description of exactly 200 chars', () => {
            const data = { ...validBase(), workExperiences: [{ ...validExperience(), description: 'x'.repeat(200) }] };
            expect(() => validateCandidateData(data)).not.toThrow();
        });

        it('does not throw when description is absent', () => {
            const data = { ...validBase(), workExperiences: [validExperience()] };
            expect(() => validateCandidateData(data)).not.toThrow();
        });

        it('throws "Invalid date" when startDate is absent', () => {
            const data = { ...validBase(), workExperiences: [{ ...validExperience(), startDate: undefined }] };
            expect(() => validateCandidateData(data)).toThrow('Invalid date');
        });

        it('throws "Invalid end date" when endDate is present but malformed', () => {
            const data = { ...validBase(), workExperiences: [{ ...validExperience(), endDate: 'not-a-date' }] };
            expect(() => validateCandidateData(data)).toThrow('Invalid end date');
        });

        it('does not throw when endDate is absent', () => {
            const data = { ...validBase(), workExperiences: [validExperience()] };
            expect(() => validateCandidateData(data)).not.toThrow();
        });
    });

    // -----------------------------------------------------------------------
    // cv (optional)
    // -----------------------------------------------------------------------
    describe('cv validation', () => {
        it('does not throw when cv key is absent', () => {
            expect(() => validateCandidateData({ ...validBase() })).not.toThrow();
        });

        it('does not throw when cv is an empty object', () => {
            expect(() => validateCandidateData({ ...validBase(), cv: {} })).not.toThrow();
        });

        it('throws "Invalid CV data" when filePath is absent', () => {
            const data = { ...validBase(), cv: { fileType: 'application/pdf' } };
            expect(() => validateCandidateData(data)).toThrow('Invalid CV data');
        });

        it('throws "Invalid CV data" when fileType is absent', () => {
            const data = { ...validBase(), cv: { filePath: '/file.pdf' } };
            expect(() => validateCandidateData(data)).toThrow('Invalid CV data');
        });

        it('throws "Invalid CV data" when filePath is not a string', () => {
            const data = { ...validBase(), cv: { filePath: 123, fileType: 'pdf' } };
            expect(() => validateCandidateData(data)).toThrow('Invalid CV data');
        });

        it('accepts a valid cv object with filePath and fileType strings', () => {
            expect(() => validateCandidateData({ ...validBase(), cv: validCv() })).not.toThrow();
        });
    });

    // -----------------------------------------------------------------------
    // Full happy path
    // -----------------------------------------------------------------------
    describe('happy path', () => {
        it('does not throw when all fields are valid with all optional relations', () => {
            // GIVEN a complete, valid payload
            const data = {
                ...validBase(),
                phone: '612345678',
                address: 'Calle Mayor 1',
                educations: [{ ...validEducation(), endDate: '2024-01-01' }],
                workExperiences: [{ ...validExperience(), description: 'Built things', endDate: '2024-06-01' }],
                cv: validCv(),
            };
            // WHEN / THEN
            expect(() => validateCandidateData(data)).not.toThrow();
        });

        it('does not throw when only mandatory fields are provided', () => {
            expect(() => validateCandidateData(validBase())).not.toThrow();
        });
    });
});
