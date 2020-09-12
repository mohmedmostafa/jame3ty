module.exports.valid_mim_types_constants = {
  IMAGE: ['image/jpg', 'image/png', 'image/jpeg'],
  VEDIO: ['video/mp4'],
  FILE_PDF: ['application/pdf'],
  FILE_WORD: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  FILE_POWERPOINT: [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  FILE_EXCEL: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  FILE_COMPRESSED: [
    'application/vnd.rar',
    'application/zip',
    'application/x-7z-compressed',
  ],
  FILE_ANY: [
    'image/jpg',
    'image/png',
    'image/jpeg',
    'video/mp4',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.rar',
    'application/zip',
    'application/x-7z-compressed',
    'image/jpg',
    'image/png',
    'image/jpeg',
  ],
};

//------------------------------------------------------------------
//NOTE: Parameter Name in (form-data) MUST be 1 of these names:-
//[img, vedio, file, pdf, word, powerpoint, excel, compressed]
module.exports.valid_form_data_param_names_constants = {
  VALID_FORM_DATA_PARAM_NAMES_WITH_MIM_TYPES: [
    ['img', exports.valid_mim_types_constants.IMAGE],
    ['img1', exports.valid_mim_types_constants.IMAGE],
    ['vedio', exports.valid_mim_types_constants.VEDIO],
    ['file', exports.valid_mim_types_constants.FILE_ANY],
    ['file1', exports.valid_mim_types_constants.FILE_ANY],
    ['attachments', exports.valid_mim_types_constants.FILE_ANY],
    ['pdf', exports.valid_mim_types_constants.FILE_PDF],
    ['pdf1', exports.valid_mim_types_constants.FILE_PDF],
    ['word', exports.valid_mim_types_constants.FILE_WORD],
    ['powerpoint', exports.valid_mim_types_constants.FILE_POWERPOINT],
    ['excel', exports.valid_mim_types_constants.FILE_EXCEL],
    ['compressed', exports.valid_mim_types_constants.FILE_COMPRESSED],
  ],
};
