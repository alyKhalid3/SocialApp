"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestException = exports.FileUploadException = exports.InvalidTokenException = exports.NotConfirmedException = exports.InvalidCredentialsException = exports.ExpiredOTPException = exports.NotFoundException = exports.EmailIsExist = exports.ValidationError = exports.applicationError = void 0;
class applicationError extends Error {
    statusCode;
    constructor(message, statusCode, Options) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.applicationError = applicationError;
class ValidationError extends applicationError {
    constructor(message) {
        super(message, 422);
    }
}
exports.ValidationError = ValidationError;
class EmailIsExist extends applicationError {
    constructor(message = 'email already exist') {
        super(message, 400);
    }
}
exports.EmailIsExist = EmailIsExist;
class NotFoundException extends applicationError {
    constructor(message) {
        super(message, 404);
    }
}
exports.NotFoundException = NotFoundException;
class ExpiredOTPException extends applicationError {
    constructor(message) {
        super(message, 410);
    }
}
exports.ExpiredOTPException = ExpiredOTPException;
class InvalidCredentialsException extends applicationError {
    constructor(message = 'invalid credentials') {
        super(message, 409);
    }
}
exports.InvalidCredentialsException = InvalidCredentialsException;
class NotConfirmedException extends applicationError {
    constructor(message = 'confirm your email first') {
        super(message, 400);
    }
}
exports.NotConfirmedException = NotConfirmedException;
class InvalidTokenException extends applicationError {
    constructor(message) {
        super(message, 409);
    }
}
exports.InvalidTokenException = InvalidTokenException;
class FileUploadException extends applicationError {
    constructor(message = 'file upload error') {
        super(message, 400);
    }
}
exports.FileUploadException = FileUploadException;
class BadRequestException extends applicationError {
    constructor(message) {
        super(message, 500);
    }
}
exports.BadRequestException = BadRequestException;
