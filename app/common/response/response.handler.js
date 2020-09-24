const { Sequelize } = require('../../modules/index');

exports.Response = (res, statusCode, message, data) => {
  if (
    statusCode === exports.ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code ||
    statusCode === exports.ResponseConstants.HTTP_STATUS_CODES.CREATED.code
  )
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

exports.ResponseConstants = {
  //HTTP Status Codes
  HTTP_STATUS_CODES: {
    SUCCESS: {
      code: '200',
      type: {
        SUCCESS: 'SUCCESS',
        EMAIL_ALREADY_VERIFIED: 'EMAIL_ALREADY_VERIFIED',
        VERIFICATION_CODE_SENT: 'VERIFICATION_CODE_SENT',
        UPAYMENT_COMPLETED_SUCCESSFULLY: 'UPAYMENT_COMPLETED_SUCCESSFULLY',
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
        UPAYMENT_PROCESS_FAILED: 'UPAYMENT_PROCESS_FAILED',
        UPAYMENT_PROCESS_CANCELED: 'UPAYMENT_PROCESS_CANCELED',
        INVALID_ROLE: 'INVALID_ROLE',
        TOO_MANY_ROLES: 'TOO_MANY_ROLES',
        VIMEO_ERROR_CODE_2205: 'VIMEO_ERROR_CODE_2205',
        VIMEO_ERROR_CODE_2204: 'VIMEO_ERROR_CODE_2204',
        VIMEO_ERROR_CODE_2230: 'VIMEO_ERROR_CODE_2230',
        VIMEO_ERROR_CODE_2511: 'VIMEO_ERROR_CODE_2511',
        VIMEO_ERROR_CODE_3116: 'VIMEO_ERROR_CODE_3116',
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
        SIGNIN_REQUIRED: 'SIGNIN REQUIRED',
        VIMEO_ERROR_CODE_8002: 'VIMEO_ERROR_CODE_8002',
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
        VIMEO_ERROR_CODE_4102: 'VIMEO_ERROR_CODE_4102',
        VIMEO_ERROR_CODE_4101: 'VIMEO_ERROR_CODE_4101',
      },
    },
    NOT_FOUND: {
      code: '404',
      type: {
        RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
        NO_ATTACHMENTS_FOUND: 'NO_ATTACHMENTS_FOUND',
      },
    },
    CONFLICT: {
      code: '409',
      type: {
        HAS_MANY_ROLES: 'HAS_MANY_ROLES',
        RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
        RESOURCE_HAS_DEPENDENTS: 'RESOURCE_HAS_DEPENDENTS',
        ALREADY_SUBSCRIBED: 'ALREADY_SUBSCRIBED',
      },
    },
    UNPROCESSABLE_ENTITY: {
      code: '422',
      type: {
        JOI_VALIDATION_INVALID_DATA: 'JOI_VALIDATION_INVALID_DATA',
        JOI_VALIDATION_INVALID_URL_PARAM: 'JOI_VALIDATION_INVALID_URL_PARAM',
        JOI_VALIDATION_INVALID_QUERY_PARAM:
          'JOI_VALIDATION_INVALID_QUERY_PARAM',
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
        VIMEO_ERROR_CODE_4003: 'VIMEO_ERROR_CODE_4003',
      },
    },
    BAD_GATEWAY: {
      code: '502',
      type: {
        VERIFICATION_EMAIL_SEND_FAILED: 'VERIFICATION_EMAIL_SEND_FAILED',
        UPAYMENTS_GATEWAY_ACCESS_FAILED: 'UPAYMENTS_GATEWAY_ACCESS_FAILED',
      },
    },
  },
  //Error MSGs
  ERROR_MESSAGES: {
    VIMEO_ERROR_CODE_4003: {
      en: 'There is a problem initiating the upload.',
      ar: 'There is a problem initiating the upload.',
    },
    VIMEO_ERROR_CODE_4101: {
      en: "The authenticated user's maximum disk space has been reached.",
      ar: "The authenticated user's maximum disk space has been reached.",
    },
    VIMEO_ERROR_CODE_4102: {
      en: "The authenticated user's allotted quota has been reached.",
      ar: "The authenticated user's allotted quota has been reached.",
    },
    VIMEO_ERROR_CODE_8002: {
      en: 'No user is associated with the access token.',
      ar: 'No user is associated with the access token.',
    },
    VIMEO_ERROR_CODE_3116: {
      en:
        'The type payload parameter was supplied. instead of upload.approach. Use upload.approach starting from API version 3.4',
      ar:
        'The type payload parameter was supplied. instead of upload.approach. Use upload.approach starting from API version 3.4',
    },
    VIMEO_ERROR_CODE_2511: {
      en: 'The scheduled_start_time parameter is invalid.',
      ar: 'The scheduled_start_time parameter is invalid.',
    },
    VIMEO_ERROR_CODE_2230: {
      en: 'The upload type is invalid.',
      ar: 'The upload type is invalid.',
    },
    VIMEO_ERROR_CODE_2204: {
      en: 'The request contains invalid body parameters.',
      ar: 'The request contains invalid body parameters.',
    },
    VIMEO_ERROR_CODE_2205: {
      en: "The body of the request isn't formatted properly.",
      ar: "The body of the request isn't formatted properly.",
    },
    UPAYMENTS_GATEWAY_NOT_TEST_CREDENTIALS: {
      en: 'Accessing sandbox using live parameters or wrong parameter value',
      ar: 'Accessing sandbox using live parameters or wrong parameter value',
    },
    UPAYMENTS_GATEWAY_MERCHANT_ID_MISSING: {
      en: 'merchant_id field is missing/empty',
      ar: 'merchant_id field is missing/empty',
    },
    UPAYMENTS_GATEWAY_USERNAME_MISSING: {
      en: 'username field is missing/empty',
      ar: 'username field is missing/empty',
    },
    UPAYMENTS_GATEWAY_PASSWORD_MISSING: {
      en: 'password field is missing/empty',
      ar: 'password field is missing/empty',
    },
    UPAYMENTS_GATEWAY_API_KEY_MISSING: {
      en: 'api_key field is missing/empty',
      ar: 'api_key field is missing/empty',
    },
    UPAYMENTS_GATEWAY_TOTAL_PRICE_MISSING: {
      en: 'total_price field is missing/empty',
      ar: 'total_price field is missing/empty',
    },
    UPAYMENTS_GATEWAY_TOTAL_PRICE_GREATER_ZERO: {
      en: 'total_price is 0 or less than 0',
      ar: 'total_price is 0 or less than 0',
    },
    UPAYMENTS_GATEWAY_ORDER_ID_MISSING: {
      en: 'order_id field is missing/empty',
      ar: 'order_id field is missing/empty',
    },
    UPAYMENTS_GATEWAY_ERROR_URL_MISSING: {
      en: 'error_url field is missing/empty',
      ar: 'error_url field is missing/empty',
    },
    UPAYMENTS_GATEWAY_SUCCESS_URL_MISSING: {
      en: 'success_url field is missing/empty',
      ar: 'success_url field is missing/empty',
    },
    UPAYMENTS_GATEWAY_NOT_AUTHORISED_USER: {
      en: 'merchant not found',
      ar: 'merchant not found',
    },
    UPAYMENTS_GATEWAY_PASSWORD_WRONG: {
      en: 'password is wrong',
      ar: 'password is wrong',
    },
    UPAYMENTS_GATEWAY_INVALID_API_KEY: {
      en: 'api_key field is invalid',
      ar: 'api_key field is invalid',
    },
    UPAYMENTS_GATEWAY_INVALID_CURRENCY_CODE: {
      en: 'currency not supported',
      ar: 'currency not supported',
    },
    SIGNIN_REQUIRED: {
      en: 'Sign-in required.',
      ar: 'يلزم تسجيل الدخول',
    },
    TOO_MANY_ROLES: {
      en: 'Multiple roles of account not allowed.',
      ar: 'لا يمكن اضافه اكتر من دور للحساب.',
    },
    ALREADY_SUBSCRIBED: {
      en:
        'you are already subscribed to this coursePayment gateway unavailable now.',
      ar: 'أنت مشترك بالفعل بهذه الدوره',
    },
    UPAYMENTS_GATEWAY_ACCESS_FAILED: {
      en: 'Payment gateway unavailable now.',
      ar: 'بوابة الدفع غير متوفرة الآن.',
    },
    PAYMENT_FAIL: {
      en: 'Payment process failed.',
      ar: 'عمليه دفع فاشله.',
    },
    UPAYMENT_PROCESS_CANCELED: {
      en: 'Payment process canceled.',
      ar: 'تم الغاء عمليه الدفع.',
    },
    UPAYMENT_PROCESS_FAILED: {
      en: 'Payment process failed.',
      ar: 'عمليه دفع فاشله.',
    },
    UPAYMENT_COMPLETED_SUCCESSFULLY: {
      en: 'Payment completed successfully.',
      ar: 'عمليه دفع ناجحه.',
    },
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
    RESOURCE_NOT_FOUND_DEPARTMENT: {
      en: 'Department not found.',
      ar: 'القسم غير موجود.',
    },
    RESOURCE_NOT_FOUND_GROUP: {
      en: 'Group not found.',
      ar: 'المجموعه غير موجود.',
    },
    RESOURCE_NOT_FOUND_USER: {
      en: 'User not found.',
      ar: 'المستخدم غير موجود.',
    },
    RESOURCE_NOT_FOUND_RATINGREVIEW: {
      en: 'Rating and Review not found.',
      ar: 'التقيم غير موجود.',
    },
    RESOURCE_NOT_FOUND_ASSIGNMENTSUBMISSION: {
      en: 'Assignment submission not found.',
      ar: 'الواجب غير موجود.',
    },
    RESOURCE_NOT_FOUND_LESSON: {
      en: 'Lesson not found.',
      ar: 'الدرس غير موجود.',
    },
    RESOURCE_NOT_FOUND_LESSON_DISCUSSION: {
      en: 'Lesson discussion not found.',
      ar: 'المناقشه غير موجود.',
    },
    RESOURCE_NOT_FOUND_LESSON_DISCUSSION_COMMENT: {
      en: 'Lesson discussion comment not found.',
      ar: 'التعليق غير موجود.',
    },
    RESOURCE_NOT_FOUND_STUDENT: {
      en: 'Student not found.',
      ar: 'الطالب غير موجود.',
    },
    RESOURCE_NOT_FOUND_SUBJECT: {
      en: 'Subject not found.',
      ar: 'المقرر او الماده غير موجود.',
    },
    RESOURCE_NOT_FOUND_ACADEMICYEAR: {
      en: 'Academic Year not found.',
      ar: 'السنه الدراسيه غير موجود.',
    },
    RESOURCE_NOT_FOUND_UNIVERSITY: {
      en: 'University not found.',
      ar: 'الكليه غير موجود.',
    },
    RESOURCE_NOT_FOUND_FACULTY: {
      en: 'Faculty not found.',
      ar: 'الكليه غير موجود.',
    },
    RESOURCE_NOT_FOUND_INSTRUCTOR: {
      en: 'Instructor not found.',
      ar: 'المحاضر غير موجود.',
    },
    RESOURCE_NOT_FOUND_COURSE: {
      en: 'Course not found.',
      ar: 'الدوره غير موجود.',
    },
    RESOURCE_NOT_FOUND_COURSE_WITH_GROUP_NOT_FOUND: {
      en: 'Course with that group not found.',
      ar: 'الدوره لهذه المجموعه غير موجوده',
    },
    RESOURCE_NOT_FOUND_COURSE_WITH_GROUP_NOT_FOUND_OR_TYPE_NOT_LIVE_STREAMING: {
      en:
        'Course with that group not found or Course method is not live streaming.',
      ar: 'الدوره لهذه المجموعه غير موجوده أو طريقه تدريس الدوره ليست بث مباشر',
    },
    RESOURCE_NOT_FOUND_OR_TYPE_NOT_LIVE_STREAMING: {
      en: 'Resource not found or Course method is not live streaming.',
      ar: 'المصدر غير موجود أو طريقه تدريس الكورس ليست بث مباشر.',
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
    INVALID_PASSWORD: {
      en: 'Password Incorrect.',
      ar: 'رمز الدخول غير صحيح.',
    },
    EMAIL_UNVERIFIED: {
      en: 'Email Unverified.',
      ar: 'لم يتم تأكيد الايميل بعد.',
    },
  },
};
