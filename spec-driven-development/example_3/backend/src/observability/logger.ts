type LogLevel = 'info' | 'error';

type LogContext = {
  requestId?: string;
  route?: string;
  status?: number;
  durationMs?: number;
  geocodingDurationMs?: number;
  forecastDurationMs?: number;
  resultCount?: number;
  dependency?: string;
  cause?: string;
  result?: string;
};

function write(level: LogLevel, event: string, context: LogContext): void {
  const payload = JSON.stringify({ level, event, ...context });
  if (level === 'error') {
    console.error(payload);
    return;
  }
  console.info(payload);
}

export const logger = {
  info(event: string, context: LogContext = {}): void {
    write('info', event, context);
  },
  error(event: string, context: LogContext = {}): void {
    write('error', event, context);
  },
};
