import { AxiosError } from 'axios';
import { toast } from 'sonner';

export function handleServerError(error: unknown) {
    // eslint-disable-next-line no-console
    console.log(error);

    let errMsg = 'Something went wrong!';

    if (error && typeof error === 'object' && 'status' in error && Number(error.status) === 204) {
        errMsg = 'Content not found.';
    }

    if (error instanceof AxiosError) {
        const data = error.response?.data as any;
        // Laravel validation shape: { message: string, errors: Record<string, string[]> }
        if (data?.errors && typeof data.errors === 'object') {
            // Show first field error as main toast, and leave others to field-level handling
            const firstField = Object.keys(data.errors)[0];
            const firstMessage = data.errors[firstField]?.[0] || data.message || errMsg;
            toast.error(firstMessage);
            return data.errors as Record<string, string[]>;
        }
        errMsg = data?.message || error.message || errMsg;
    }

    toast.error(errMsg);
}
