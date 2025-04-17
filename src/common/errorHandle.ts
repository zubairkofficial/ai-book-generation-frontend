export function isErrorType(error: unknown): error is ErrorType {
    return (
        typeof error === 'object' &&
        error !== null &&
        'data' in error &&
        typeof (error as any).data === 'object' &&
        'message' in (error as any).data &&
        typeof (error as any).data.message === 'object' &&
        'message' in (error as any).data.message
    );
}