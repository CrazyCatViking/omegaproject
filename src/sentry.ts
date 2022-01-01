import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import { Context } from '@sentry/types';

export interface IErrorContext {
  name: string;
  ctx: Context | null;
};

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.ENVIRONMENT,
  tracesSampleRate: 1.0,
});

export const useSentry = (guildId: string) => {
  const logError = (error: unknown, transactionName?: string) => {
    const scope = new Sentry.Scope();

    scope.setContext('guild', {
      id: guildId,
    });

    scope.setTransactionName(transactionName);

    Sentry.captureException(error, scope);
  };
  
  return {
    logError,
  };
};

export const logError = (error: unknown, context: IErrorContext, transactionName?: string) => {
  const scope = new Sentry.Scope();
  scope.setContext(context.name, context.ctx);
  scope.setTransactionName(transactionName);

  Sentry.captureException(error, scope);
}; 

