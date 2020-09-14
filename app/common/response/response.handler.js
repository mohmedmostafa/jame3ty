const { Sequelize } = require('../../modules/index');

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
      type: {
        BAD_REQUEST: 'BAD_REQUEST',
        EXPIRED_VERIFICATION_CODE: 'EXPIRED_VERIFICATION_CODE',
      },
    },
    UNAUTHORIZED: {
      code: '401',
      type: {
        AUTHORIZATION_NOT_FOUND: 'AUTHORIZATION_NOT_FOUND',
        TOKEN_TYPE_INVALID: 'TOKEN_TYPE_INVALID',
        TOKEN_NOT_FOUND: 'TOKEN_NOT_FOUND',
        TOKEN_INVALID: 'TOKEN_INVALID',
        EMAIL_UNVERIFIED: 'EMAIL_UNVERIFIED',
        INVALID_PASSWORD: 'INVALID_PASSWORD',
        VERIFICATION_CODE_INCORRECT: 'VERIFICATION_CODE_INCORRECT',
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
        NO_ATTACHMENTS_FOUND: 'NO_ATTACHMENTS_FOUND',
        INVALID_ROLE: 'INVALID_ROLE',
      },
    },
    CONFLICT: {
      code: '409',
      type: {
        HAS_MANY_ROLES: 'HAS_MANY_ROLES',
        RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
        RESOURCE_HAS_DEPENDENTS: 'RESOURCE_HAS_DEPENDENTS',
      },
    },
    UNPROCESSABLE_ENTITY: {
      code: '422',
      type: {
        JOI_VALIDATION_BAD_DATA: 'JOI_VALIDATION_BAD_DATA',
        FILE_EXTENSION_INVALID: 'FILE_EXTENSION_INVALID',
        UNEXPECTED_FIELD: 'UNEXPECTED_FIELD',
        MULTER_UNEXPECTED_ERROR: 'MULTER_UNEXPECTED_ERROR',
        INVALID_DATE: 'INVALID_DATE',
        UNACCEPTABLE_DATE: 'UNACCEPTABLE_DATE',
        UNACCEPTABLE_NUMBER: 'UNACCEPTABLE_NUMBER',
      },
    },
    INTERNAL_ERROR: {
      code: '500',
      type: {
        DB_CONNECTION_FAILED: 'DB_CONNECTION_FAILED',
        INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
        ORM_OPERATION_FAILED: 'ORM_OPERATION_FAILED',
        ATTACHMENT_DELETION_FAILED: 'ATTACHMENT_DELETION_FAILED',
      },
    },
    BAD_GATEWAY: {
      code: '502',
      type: {
        VERIFICATION_EMAIL_SEND_FAILED: 'VERIFICATION_EMAIL_SEND_FAILED',
      },
    },
  },
  //Error MSGs
  ERROR_MESSAGES: {
    AUTHORIZATION_NOT_FOUND: {
      en: 'Authorization not found in headers.',
      ar: 'التفويض غير موجود.',
    },
    TOKEN_TYPE_INVALID: {
      en: 'Only accept "Bearer" Tokens.',
      ar: 'نوع الرمز غير مقبول.',
    },
    TOKEN_NOT_FOUND: {
      en: 'Token is not found.',
      ar: 'رمز الدخول غير موجود',
    },
    TOKEN_INVALID: {
      en: 'Token is not valid.',
      ar: 'رمز الدخول غير صالح.',
    },
    EMAIL_ALREADY_VERIFIED: {
      en: 'Email address already verified.',
      ar: 'تم التحقق من عنوان البريد الإلكتروني بالفعل.',
    },
    VERIFICATION_CODE_SENT: {
      en: 'Verification code has been sent.',
      ar: 'تم إرسال رمز التحقق.',
    },
    VERIFICATION_CODE_INCORRECT: {
      en: 'Verification code incorrect.',
      ar: 'رمز التحقق غير صحيح.',
    },
    EXPIRED_VERIFICATION_CODE: {
      en: 'Expired verification code .',
      ar: 'رمز التحقق منتهي الصلاحية.',
    },
    SUCCESS: {
      en: 'The operation completed successfully.',
      ar: 'تمت العملية بنجاح.',
    },
    RECOURSE_CREATED: {
      en: 'The resource added successfully.',
      ar: 'تمت إضافة المورد بنجاح.',
    },
    NO_CONTENT: {
      en: 'No data is available.',
      ar: 'لا توجد بيانات متاحة.',
    },
    ACCESS_DENIED: {
      en: 'Access denied.',
      ar: 'غير مسموح.',
    },
    INVALID_ROLE: {
      en: 'Some roles are invalid.',
      ar: 'بعض الأدوار غير صالحة.',
    },
    USER_NOT_EXISTS: {
      en: 'User not exists.',
      ar: 'المستخدم غير موجود.',
    },
    ORM_OPERATION_FAILED: {
      en: 'Failed to execute the operation.',
      ar: 'فشل تنفيذ العملية.',
    },
    ATTACHMENT_DELETION_FAILED: {
      en: 'Attachment deletion failed.',
      ar: 'فشل حذف المرفق.',
    },
    RESOURCE_HAS_DEPENDENTS: {
      en: 'The resource has dependents, remove dependents first.',
      ar: 'لا يمكن اتمام عمليه الحذف قبل حذف المعلومات المعتمده عليه أولا.',
    },
    HAS_MANY_ROLES: {
      en: 'The resource has many roles, remove roles first.',
      ar: 'لا يمكن اتمام عمليه الحذف قبل حذف الادوار الاخرى.',
    },
    INTERNAL_SERVER_ERROR: {
      en: 'Unexpected error occurred, please try again later.',
      ar: 'حدث خطأ غير متوقع، الرجاء المحاولة لاحقا.',
    },
    UNEXPECTED_ERROR: {
      en: 'Unexpected error occurred, please try again later.',
      ar: 'حدث خطأ غير متوقع، الرجاء المحاولة لاحقا.',
    },
    RESOURCE_NOT_FOUND: {
      en: 'Resource not found.',
      ar: 'المصدر غير موجود.',
    },
    NO_ATTACHMENTS_FOUND: {
      en: 'No attachemnts found.',
      ar: 'لا يوجد مرفقات.',
    },
    FILE_EXTENSION_INVALID: {
      en: 'Attachment extension invalid.',
      ar: 'امتداد المرفق غير مدعوم او غير صالح.',
    },
    MULTER_UNEXPECTED_ERROR: {
      en:
        'Unexpected error occurred during upload the attachments, please try again later.',
      ar: 'حدث خطأ غير متوقع أثناء رفع الملفات، الرجاء المحاولة لاحقا.',
    },
    UNEXPECTED_FIELD: {
      en: 'Unexpected field in form-data parameters.',
      ar: 'اسم المتغير غير صالح.',
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
      ar: 'البريد الإلكتروني المدخل مستخدم بالفعل.',
    },
    USERNAME_EXISTS: {
      en: 'Username address already in use.',
      ar: 'اسم المستخدم المدخل مستخدم بالفعل.',
    },
    MOBILE_EXISTS: {
      en: 'Username address already in use.',
      ar: 'رقم الموبايل المدخل مستخدم بالفعل.',
    },
    UNACCEPTABLE_DATE_COURSE_STARTDATE: {
      en:
        'Startdate unacceptable, it must be before all start dates of all groups.',
      ar:
        'التاريخ غير مقبول, يجب ان يكون قبل تاريخ بدايه جميع المجموعات التابعه له',
    },
    UNACCEPTABLE_DATE_GROUP_STARTDATE: {
      en:
        'Startdate unacceptable, it must be greater than startdate of the Course which belongs to.',
      ar: 'التاريخ غير مقبول, يجب ان يكون قبل تاريخ بدايه الدوره التابع لها',
    },
    UNACCEPTABLE_MAX_STUDENT_NUMBER_IN_GROUP: {
      en:
        "The max number of students per group can't be less than the current number of student subsciptions for that group.",
      ar:
        'اقصى عدد للطالب بهذا الجروب لا يمكن ان يكون اقل من عدد الطالب المشتركين حاليا',
    },
    VERIFICATION_EMAIL_SEND_FAILED: {
      en: 'Send verification email failed.',
      ar: 'فشل إرسال ايميل التحقق',
    },
  },
};

exports.Response = (res, statusCode, message, data) => {
  if (statusCode == exports.ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code)
    return res.status(statusCode).send({
      status: true,
      statusCode: statusCode,
      message: message,
      data: data,
    });
  else {
    //check id the error from ORM
    if (data.error instanceof Sequelize.UniqueConstraintError) {
      return res.status(statusCode).send({
        status: false,
        statusCode: statusCode,
        message: data.error.errors[0].message,
        data: { path: data.error.errors[0].path },
      });
    }
    return res.status(statusCode).send({
      status: false,
      statusCode: statusCode,
      message: message,
      data: data,
    });
  }
};

exports.ValidateResponse = (res, message, data) => {
  const code =
    exports.ResponseConstants.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY.code;

  const response = {
    status: false,
    statusCode: code,
    message: message,
    data: data,
  };

  return res.status(code).send(response);
};

/*
exports.Response = (statusCode, message, data) => {
  return { statusCode: statusCode, message: message, data: data };
};
*/
