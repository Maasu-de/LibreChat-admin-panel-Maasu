import { createServerFn } from '@tanstack/react-start';

export const getPilotModeFn = createServerFn({ method: 'GET' }).handler(
  () => process.env.GOVERNANCE_PILOT_ENABLED === 'true',
);
