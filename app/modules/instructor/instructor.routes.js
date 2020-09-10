const { AuthJwt } = require('../../middleware');
const InstructorValidation = require('./controller/instructor.validation');
const InstructorController = require('./controller/instructor.controller');
const FileUploader = require('../../common/multerConfig');
const multer = require('multer');
const { ValidateResponse } = require('../../common/response.handler');



module.exports = function (app, Uploader) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  const upload_addInstructor = FileUploader.upload.fields([
    {
      name: FileUploader.validForm_DataParamNames()[0],
      maxCount: 1,
    },
    {
      name: FileUploader.validForm_DataParamNames()[3],
      maxCount: 1,
    },
  ]);

  app.post(
    '/api/addInstructor',
    (req,res,next)=>{FileUploader.validateFileAfterUpdate(req,res,next,upload_addInstructor)},
    [
      // AuthJwt.VerifyToken,
      // AuthJwt.isAdmin,
      InstructorValidation.addInstructorValidation,
      
    ],
    InstructorController.addInstructor
  );

  app.put(
    '/api/updateInstructor/:id',
    (req,res,next)=>{FileUploader.validateFileAfterUpdate(req,res,next,upload_addInstructor)},
    [ AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
      InstructorValidation.updateInstructorValidation,
     
    ],
    InstructorController.updateInstructor
  );

  app.get(
    '/api/listInstructor',
    FileUploader.upload.none(),
    [AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
      InstructorValidation.listInstructorValidation,
      
    ],
    InstructorController.listInstructor
  );

  
  app.get(
    '/api/listInstructorById/:id',
    FileUploader.upload.none(),
    [
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
      InstructorValidation.listInstructorIdValidation,
    ],
    InstructorController.listInstructorById
  );

  app.post(
    '/api/deleteInstructor/:id',
    FileUploader.upload.none(),
    [AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
      InstructorValidation.deleteInstructorValidation,
      
    ],
    InstructorController.deleteInstructor
  );

  // app.post('/captcha',FileUploader.upload.none(), function(req, res) {
  //   if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null)
  //   {
  //     return res.json({"responseError" : "something goes to wrong"});
  //   }
  //   console.log(req.body['g-recaptcha-response']);
  //   const secretKey = "6Lc82cIZAAAAAG0yX5SrfKAbOPw2J1XVgq4UDkJ1";
  
  //   const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
  
  //   request(verificationURL,function(error,response,body) {
  //     body = JSON.parse(body);
  
  //     if(body.success !== undefined && !body.success) {
  //       return res.json({"responseError" : "Failed captcha verification"});
  //     }
  //     res.json({"responseSuccess" : "Sucess"});
  //   });
  // });
  
  
};
