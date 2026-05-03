/**
 * Thin entry-point suite required by naming convention.
 *
 * This file intentionally imports existing modular test suites so we keep
 * per-layer test organization while also providing a single formal entry file.
 */

import '../__tests__/validator.test';
import '../__tests__/candidate.model.test';
import '../__tests__/education.model.test';
import '../__tests__/workExperience.model.test';
import '../__tests__/resume.model.test';
import '../__tests__/candidateService.test';
import '../__tests__/candidateController.test';
