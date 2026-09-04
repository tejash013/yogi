export function success(data, message = 'Success') {
    return {
        success: true,
        data,
        message,
    };
}
export function paginated(data, total, page, limit, message = 'Success') {
    return {
        success: true,
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        },
        message,
    };
}
export function failure(message = 'Failed', errors = []) {
    return {
        success: false,
        data: null,
        message,
        errors,
    };
}
