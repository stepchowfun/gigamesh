import _ from 'lodash';
import traverse from 'traverse';
import { createLogger, format, transports } from 'winston';

import { secretFields } from '../secrets/secrets';

const redactedValue = '[REDACTED]';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function scrubSecrets(payload: {}): any {
  // To scrub secrets, we mutate the object with `traverse(...).forEach(...)`.
  // To avoid mutating the input directly, we do a deep copy here first. We'd
  // prefer to just use `traverse(...).map(...)` instead, but unfortunately
  // we the `traverse` library has a bug that prevents it from traversing keys
  // that are symbols, and `winston` uses symbolic keys for internal state.
  // This is the bug: https://github.com/substack/js-traverse/issues/65
  const payloadClone = _.cloneDeep(payload);

  traverse(payloadClone).forEach(function scrubSecretsFromElement() {
    secretFields.forEach((secretField) => {
      if (this.key === secretField) {
        this.update(redactedValue);
      }
    });
  });

  return payloadClone;
}

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format(scrubSecrets)(),
    format.timestamp(),
    format.json(),
  ),
  transports: [new transports.Console()],
});

export default logger;
