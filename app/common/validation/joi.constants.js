//
module.exports.joi_messages = {
  'string.base': JSON.stringify({
    key: `{#key}`,
    en: `must be a string.`,
    ar: `يجب ان يكون نص`,
  }),
  'string.min': JSON.stringify({
    key: `{#key}`,
    en: `length must be at least {#limit} characters long`,
    ar: `يجب ان يكون عدد الاحرف اكبر من او يساوى {#limit} أحرف`,
  }),
  'string.max': JSON.stringify({
    key: `{#key}`,
    en: `length must be less than or equal to {#limit} characters long`,
    ar: `يجب ان يكون عدد الاحرف اقل من او يساوى {#limit} أحرف`,
  }),
  'string.length': JSON.stringify({
    key: `{#key}`,
    en: `length must be {#limit} characters long`,
    ar: `يجب ان يكون عدد الاحرف يساوى {#limit} أحرف`,
  }),
  'string.alphanum': JSON.stringify({
    key: `{#key}`,
    en: `must only contain alpha-numeric characters`,
    ar: `يقبل الاحرف و الارقام فقط`,
  }),
  'string.email': JSON.stringify({
    key: `{#key}`,
    en: `must be a valid email`,
    ar: `يجب ان يكون ايميل`,
  }),
  'string.isoDate': JSON.stringify({
    key: `{#key}`,
    en: `must be a valid ISO 8601 date`,
    ar: `يجب ان يكون ISO 8601 date`,
  }),
  'string.lowercase': JSON.stringify({
    key: `{#key}`,
    en: `must only contain lowercase characters`,
    ar: `يجب ان تكون الاحرف ف حالتها الصغيره`,
  }),
  'string.uppercase': JSON.stringify({
    key: `{#key}`,
    en: `must only contain uppercase characters`,
    ar: `يجب ان تكون الاحرف ف حالتها الكبيره`,
  }),
  'string.trim': JSON.stringify({
    key: `{#key}`,
    en: `must not have leading or trailing whitespace`,
    ar: `يجب ان لا يحتوى على مسافات ف البدايه او النهايه`,
  }),
  'string.empty': JSON.stringify({
    key: `{#key}`,
    en: `not allowed to be empty`,
    ar: `القيمه مطلوبه`,
  }),
  'number.base': JSON.stringify({
    key: `{#key}`,
    en: `must be a number`,
    ar: `يجب ان يكون رقم`,
  }),
  'number.min': JSON.stringify({
    key: `{#key}`,
    en: `must be larger than or equal to {#limit}`,
    ar: `يجب ان يكون اكبر من او يساوى {#limit}`,
  }),
  'number.max': JSON.stringify({
    key: `{#key}`,
    en: `must be less than or equal to {#limit}`,
    ar: `يجب ان يكون اقل من او يساوى {#limit}`,
  }),
  'number.less': JSON.stringify({
    key: `{#key}`,
    en: `must be less than {#limit}`,
    ar: `يجب ان يكون اقل من {#limit}`,
  }),
  'number.greater': JSON.stringify({
    key: `{#key}`,
    en: `must be greater than {#limit}`,
    ar: `يجب ان يكون اكبر من {#limit}`,
  }),
  'number.float': JSON.stringify({
    key: `{#key}`,
    en: `must be a float or double`,
    ar: `يجب ان يكون رقم كسرى`,
  }),
  'number.integer': JSON.stringify({
    key: `{#key}`,
    en: `must be an integer`,
    ar: `يجب ان يكون رقم صحيح`,
  }),
  'number.negative': JSON.stringify({
    key: `{#key}`,
    en: `must be a negative number`,
    ar: `يجب ان يكون رقم سالب`,
  }),
  'number.positive': JSON.stringify({
    key: `{#key}`,
    en: `must be a positive number`,
    ar: `يجب ان يكون رقم موجب`,
  }),
  'date.isoDate': JSON.stringify({
    key: `{#key}`,
    en: `must be a valid ISO 8601 date`,
    ar: `يجب ان يكون ف صيغه ISO 8601 date`,
  }),
  'date.max': JSON.stringify({
    key: `{#key}`,
    en: `must be less than or equal to {#limit}`,
    ar: `يجب ان يكون اقل من او يساوى {#limit}`,
  }),
  'date.min': JSON.stringify({
    key: `{#key}`,
    en: `must be larger than or equal to {#limit}`,
    ar: `يجب ان يكون اكبر من او يساوى {#limit}`,
  }),
  'date.base': JSON.stringify({
    key: `{#key}`,
    en: `must be a number of milliseconds or valid date string`,
    ar: `يجب ان يكون رقم بالميللى ثانيه او تاريخ صحيح ف شكل نص `,
  }),
  'boolean.base': JSON.stringify({
    key: `{#key}`,
    en: `must be a boolean`,
    ar: `يجب ان يكون 1 او 0`,
  }),
  'any.unknown': JSON.stringify({
    key: `{#key}`,
    en: `is not allowed`,
    ar: `غير مسموح بهذه القيمه`,
  }),
  'any.invalid': JSON.stringify({
    key: `{#key}`,
    en: `contains an invalid value`,
    ar: `قيمه غير صالحه`,
  }),
  'any.empty': JSON.stringify({
    key: `{#key}`,
    en: `is not allowed to be empty`,
    ar: `القيمه مطلوبه`,
  }),
  'any.required': JSON.stringify({
    key: `{#key}`,
    en: `is required`,
    ar: `القيمه مطلوبه`,
  }),
  'any.allowOnly': JSON.stringify({
    key: `{#key}`,
    en: `must be one of {#valids}`,
    ar: `يجب ان تكون القيمه ضمن القيم الاتيه {#valids}`,
  }),
};
