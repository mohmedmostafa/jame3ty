exports.ResponseConstants = {
  //HTTP Status Codes
  HTTP_STATUS_CODES: {
    SUCCESS: {
      code: '200',
      type: {
        SUCCESS: 'SUCCESS',
        EMAIL_ALREADY_VERIFIED: 'EMAIL_ALREADY_VERIFIED',
        VERIFICATION_CODE_SENT: 'VERIFICATION_CODE_SENT',
      },
    },
    CREATED: {
      code: '201',
      type: { RECOURSE_CREATED: 'RECOURSE_CREATED' },
    },
    NO_CONTENT: {
      code: '204',
      type: { NO_CONTENT: 'NO_CONTENT' },
    },
    BAD_REQUEST: {
      code: '400',
      type: { BAD_REQUEST: 'BAD_REQUEST' },
    },
    UNAUTHORIZED: {
      code: '401',
      type: {
        EMAIL_UNVERIFIED: 'EMAIL_UNVERIFIED',
        BEARER_TOKEN_NOT_FOUND: 'BEARER_TOKEN_NOT_FOUND',
        BEARER_TOKEN_INVALID: 'BEARER_TOKEN_INVALID',
        INVALID_PASSWORD: 'INVALID PASSWORD',
        VERIFICATION_CODE_INCORRECT: 'VERIFICATION CODE INCORRECT',
      },
    },
    PAYMENT_REQUIRED: {
      code: '402',
      type: {
        PAYMENT_FAIL: 'PAYMENT_FAIL',
      },
    },
    FORBIDDEN: {
      code: '403',
      type: {
        ACCESS_DENIED: 'ACCESS_DENIED',
      },
    },
    NOT_FOUND: {
      code: '404',
      type: {
        RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
        INVALID_ROLE: 'INVALID ROLES',
      },
    },
    CONFLICT: {
      code: '409',
      type: {
        HAS_MANY_ROLES: 'HAS MANY ROLES',
        RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
        RESOURCE_HAS_DEPENDENTS: 'RESOURCE_HAS_DEPENDENTS',
      },
    },
    UNPROCESSABLE_ENTITY: {
      code: '422',
      type: {
        JOI_VALIDATION_BAD_DATA: 'JOI_VALIDATION_BAD_DATA',
      },
    },
    INTERNAL_ERROR: {
      code: '500',
      type: {
        DB_CONNECTION_FAILED: 'DB CONNECTION FAILED',
        INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
        ORM_OPERATION_FAILED: 'ORM_OPERATION_FAILED',
      },
    },
  },
  //Error MSGs
  ERROR_MESSAGES: {
    UNEXPECTED_ERROR: {
      en: 'Unexpected error occurred, please try again later.',
      ar: 'حدث خطأ غير متوقع، الرجاء المحاولة لاحقا.',
    },
    RESOURCE_NOT_FOUND: {
      en: 'Resource not found.',
      ar: 'المصدر غير موجود.',
    },
    INVALID_PARAMS: {
      en: 'Invalid parameters.',
      ar: 'املأ جميع الحقول المطلوبة.',
    },
    INVALID_IMAGE: {
      en: 'Invalid Image.',
      ar: 'من فضلك قم برفع الصورة.',
    },
    EMAIL_EXISTS: {
      en: 'Email address already in use.',
      ar: 'البريد الإلكتروني المدخل مستخدم.',
    },
  },
};
