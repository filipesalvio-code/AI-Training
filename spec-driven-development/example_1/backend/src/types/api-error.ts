import type { AppErrorCode } from '../errors/app-error'

export type ApiError = {
  error: {
    code: AppErrorCode
    message: string
  }
}
