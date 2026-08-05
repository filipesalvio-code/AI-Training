type LogContext = Readonly<Record<string, unknown>>
type LogSink = (line: string) => void
type LoggerSinks = { info: LogSink; error: LogSink }

const SENSITIVE_KEYS = new Set(['city', 'query', 'body', 'ip', 'stack'])

function defaultSinks(): LoggerSinks {
  return { info: (line: string) => console.log(line), error: (line: string) => console.error(line) }
}

function sanitizeContext(context: LogContext): Record<string, unknown> {
  return Object.fromEntries(Object.entries(context).filter(([key]) => !SENSITIVE_KEYS.has(key)))
}

function formatLog(level: string, event: string, context: LogContext, error?: unknown): string {
  const details = error === undefined ? {} : { cause: error instanceof Error ? error.name : 'UnknownError' }
  return JSON.stringify({ timestamp: new Date().toISOString(), level, event, ...sanitizeContext(context), ...details })
}

export type Logger = {
  info: (event: string, context?: LogContext) => void
  error: (event: string, error: unknown, context?: LogContext) => void
}

export function createLogger(sinks: LoggerSinks = defaultSinks()): Logger {
  return {
    info: (event, context = {}) => sinks.info(formatLog('info', event, context)),
    error: (event, error, context = {}) => sinks.error(formatLog('error', event, context, error)),
  }
}

export const logger = createLogger()
