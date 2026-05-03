/**
 * Thin entry-point suite required by naming convention.
 *
 * This file intentionally imports existing modular test suites so we keep
 * per-layer test organization while also providing a single formal entry file.
 */

import './validator.test';
import './candidate.model.test';
import './education.model.test';
import './workExperience.model.test';
import './resume.model.test';
import './candidateService.test';
import './candidateController.test';
