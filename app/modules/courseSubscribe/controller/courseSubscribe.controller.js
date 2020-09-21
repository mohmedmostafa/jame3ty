const axios = require('axios');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const db = require('../..');
const {
  Response,
  ValidateResponse,
  ResponseConstants,
} = require('../../../common/response/response.handler');
const {
  onErrorDeleteFiles,
  deleteFile,
} = require('../../../common/attachmentsUpload/multerConfig');
const { Sequelize, connection } = require('../..');
const {
  PORT,
  HOST,
  ENV,
  PAYMENT_GATEWAY_URL,
  MARCHANT_ID,
  UPAYMENTS_USERNAME,
  UPAYMENTS_PASSWORD,
  UPAYMENTS_API_KEY,
} = require('../../../config/env.config');

const QueryTypes = db.Sequelize.QueryTypes;
const Op = db.Sequelize.Op;
const db_Course = db.Course;
const db_User = db.User;
const db_connection = db.connection;
const db_CourseSubscribe = db.CourseSubscribe;
const db_Student = db.Student;
const db_Instructor = db.Instructor;
const db_Payment = db.Payment;

//---------------------------------------------------------------
exports.generatePaymentRequest = async (req, res) => {
  let course = await db_Course.findOne({
    attributes: [
      'name_ar',
      'name_en',
      'numOfLessons',
      'numOfHours',
      'price',
      'priceBeforeDiscount',
      'type',
      'method',
    ],
    where: {
      id: req.body.courseId,
    },
    include: [
      {
        model: db_Instructor,
        attributes: ['name_ar', 'name_en', 'mobile', 'email'],
      },
    ],
  });

  //If Course id not found
  if (!course) {
    console.log('!course');
    // onErrorDeleteFiles(req);
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
      ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
      ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_COURSE
    );
  }

  //
  let student = await db_Student.findOne({
    attributes: ['name', 'mobile', 'email'],
    where: {
      id: req.body.studentId,
    },
  });

  //If student not found
  if (!student) {
    console.log('!student');
    // onErrorDeleteFiles(req);
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
      ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
      ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_STUDENT
    );
  }

  //Check if the student try to buy this course before or not
  let studentCourseSubscribe = await db_CourseSubscribe.findOne({
    where: {
      studentId: req.body.studentId,
      courseId: req.body.courseId,
    },
  });

  //if first try to buy the course create it
  if (!studentCourseSubscribe) {
    studentCourseSubscribe = await db_CourseSubscribe.create({
      studentId: req.body.studentId,
      courseId: req.body.courseId,
      details: JSON.stringify([course, student]),
    });
    console.log(studentCourseSubscribe);
  } else {
    //Update course details if all payment from student to course is CAPTURED
    let studentCourseSubscribePayment = await db_CourseSubscribe.findOne({
      where: {
        studentId: req.body.studentId,
        courseId: req.body.courseId,
      },
      include: [
        {
          model: db_Payment,
          required: true,
          where: { Result: 'CAPTURED' },
        },
      ],
    });

    //Update if no CAPTURED payment for that course from student
    if (!studentCourseSubscribePayment) {
      await db_CourseSubscribe.update(
        { details: JSON.stringify([course, student]) },
        {
          where: {
            studentId: req.body.studentId,
            courseId: req.body.courseId,
          },
        }
      );
    } else {
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.code,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.type.ALREADY_SUBSCRIBED,
        ResponseConstants.ERROR_MESSAGES.ALREADY_SUBSCRIBED
      );
    }
  }

  //Generate Order Id for Payment Getway
  var orderId = crypto.randomBytes(25).toString('hex');

  console.log(
    HOST +
      PORT +
      '/api/error_urlPaymentRequest?courseSubscribeId=' +
      studentCourseSubscribe.id
  );
  //Params
  let post_param = {
    merchant_id: MARCHANT_ID,
    username: UPAYMENTS_USERNAME,
    password: UPAYMENTS_PASSWORD,
    api_key: UPAYMENTS_API_KEY,
    //api_key: bcrypt.hashSync('jtest123', 8),
    order_id: orderId,
    total_price: course.price,
    CurrencyCode: 'USD',
    success_url:
      HOST +
      PORT +
      '/api/success_urlPaymentRequest?courseSubscribeId=' +
      studentCourseSubscribe.id,
    error_url:
      HOST +
      PORT +
      '/api/error_urlPaymentRequest?courseSubscribeId=' +
      studentCourseSubscribe.id,
    test_mode: 1,
    CstFName: student.name,
    CstEmail: student.email,
    CstMobile: student.mobile,
    payment_gateway: 'cc',
    whitelabled: true,
    ProductTitle: course.name_ar,
    ProductName: course.name_en,
    ProductPrice: course.price,
    ProductQty: '1',
    Reference: orderId,
  };
  //
  axios
    .post(PAYMENT_GATEWAY_URL, post_param, {
      headers: {
        'x-Authorization': 'hWFfEkzkYE1X691J4qmcuZHAoet7Ds7ADhL',
      },
    })
    .then(function (response) {
      console.log(response.data);
      //
      if (response.data.status === 'success') {
        //Success
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
          ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
          { paymentURL: response.data.paymentURL }
        );
      } else {
        if (response.data.error_code === 'not_test_credentials') {
          //Success
          return Response(
            res,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.code,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.type.BAD_REQUEST,
            ResponseConstants.ERROR_MESSAGES
              .UPAYMENTS_GATEWAY_NOT_TEST_CREDENTIALS
          );
        } else if (response.data.error_code === 'merchant_id_missing') {
          //Success
          return Response(
            res,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.code,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.type.BAD_REQUEST,
            ResponseConstants.ERROR_MESSAGES
              .UPAYMENTS_GATEWAY_MERCHANT_ID_MISSING
          );
        } else if (response.data.error_code === 'username_missing') {
          //Success
          return Response(
            res,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.code,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.type.BAD_REQUEST,
            ResponseConstants.ERROR_MESSAGES.UPAYMENTS_GATEWAY_USERNAME_MISSING
          );
        } else if (response.data.error_code === 'password_missing') {
          //Success
          return Response(
            res,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.code,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.type.BAD_REQUEST,
            ResponseConstants.ERROR_MESSAGES.UPAYMENTS_GATEWAY_PASSWORD_MISSING
          );
        } else if (response.data.error_code === 'api_key_missing') {
          //Success
          return Response(
            res,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.code,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.type.BAD_REQUEST,
            ResponseConstants.ERROR_MESSAGES.UPAYMENTS_GATEWAY_API_KEY_MISSING
          );
        } else if (response.data.error_code === 'total_price_missing') {
          //Success
          return Response(
            res,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.code,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.type.BAD_REQUEST,
            ResponseConstants.ERROR_MESSAGES
              .UPAYMENTS_GATEWAY_TOTAL_PRICE_MISSING
          );
        } else if (response.data.error_code === 'total_price_greater_zero') {
          //Success
          return Response(
            res,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.code,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.type.BAD_REQUEST,
            ResponseConstants.ERROR_MESSAGES
              .UPAYMENTS_GATEWAY_TOTAL_PRICE_GREATER_ZERO
          );
        } else if (response.data.error_code === 'order_id_missing') {
          //Success
          return Response(
            res,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.code,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.type.BAD_REQUEST,
            ResponseConstants.ERROR_MESSAGES.UPAYMENTS_GATEWAY_ORDER_ID_MISSING
          );
        } else if (response.data.error_code === 'error_url_missing') {
          //Success
          return Response(
            res,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.code,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.type.BAD_REQUEST,
            ResponseConstants.ERROR_MESSAGES.UPAYMENTS_GATEWAY_ERROR_URL_MISSING
          );
        } else if (response.data.error_code === 'success_url_missing') {
          //Success
          return Response(
            res,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.code,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.type.BAD_REQUEST,
            ResponseConstants.ERROR_MESSAGES
              .UPAYMENTS_GATEWAY_SUCCESS_URL_MISSING
          );
        } else if (response.data.error_code === 'not_authorised_user') {
          //Success
          return Response(
            res,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.code,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.type.BAD_REQUEST,
            ResponseConstants.ERROR_MESSAGES
              .UPAYMENTS_GATEWAY_NOT_AUTHORISED_USER
          );
        } else if (response.data.error_code === 'password_wrong') {
          //Success
          return Response(
            res,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.code,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.type.BAD_REQUEST,
            ResponseConstants.ERROR_MESSAGES.UPAYMENTS_GATEWAY_PASSWORD_WRONG
          );
        } else if (response.data.error_code === 'invalid_api_key') {
          //Success
          return Response(
            res,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.code,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.type.BAD_REQUEST,
            ResponseConstants.ERROR_MESSAGES.UPAYMENTS_GATEWAY_INVALID_API_KEY
          );
        } else if (response.data.error_code === 'invalid_currency_code') {
          //Success
          return Response(
            res,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.code,
            ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.type.BAD_REQUEST,
            ResponseConstants.ERROR_MESSAGES
              .UPAYMENTS_GATEWAY_INVALID_CURRENCY_CODE
          );
        }
      }
    })
    .catch(function (error) {
      console.log(error.data);
      //Fail
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.BAD_GATEWAY.code,
        ResponseConstants.HTTP_STATUS_CODES.BAD_GATEWAY.type
          .UPAYMENTS_GETWAY_ACCESS_FAILED,
        ResponseConstants.ERROR_MESSAGES.UPAYMENTS_GETWAY_ACCESS_FAILED
      );
    });

  console.log(
    process.env.DEV_HOST +
      process.env.DEV_PORT +
      '/api/success_urlPaymentRequest'
  );
};

exports.success_urlPaymentRequest = async (req, res) => {
  console.log(req.query);
  //
  try {
    await db_Payment.create({
      courseSubscribeId: req.query.courseSubscribeId,
      PaymentID: req.query.PaymentID,
      Result: req.query.Result,
      PostDate: req.query.PostDate,
      TranID: req.query.TranID,
      Ref: req.query.Ref,
      TrackID: req.query.TrackID,
      Auth: req.query.Auth,
      OrderID: req.query.OrderID,
    });

    //Update payment result in Course Subscribe table
    await db_CourseSubscribe.update(
      {
        paymentResult: req.query.Result,
      },
      {
        where: {
          id: req.query.courseSubscribeId,
        },
      }
    );

    //When req.query.Result === 'CAPTURED'
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type
        .UPAYMENT_COMPLETED_SUCCESSFULLY,
      ResponseConstants.ERROR_MESSAGES.UPAYMENT_COMPLETED_SUCCESSFULLY
    );
  } catch (error) {
    console.log(error);
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
        .ORM_OPERATION_FAILED,
      ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
    );
  }
};

exports.error_urlPaymentRequest = async (req, res) => {
  console.log(req.query);
  //
  try {
    await db_Payment.create({
      courseSubscribeId: req.query.courseSubscribeId,
      PaymentID: req.query.PaymentID,
      Result: req.query.Result,
      PostDate: req.query.PostDate,
      TranID: req.query.TranID,
      Ref: req.query.Ref,
      TrackID: req.query.TrackID,
      Auth: req.query.Auth,
      OrderID: req.query.OrderID,
    });

    //Update payment result in Course Subscribe table
    await db_CourseSubscribe.update(
      {
        paymentResult: req.query.Result,
      },
      {
        where: {
          id: req.query.courseSubscribeId,
        },
      }
    );

    //When req.query.Result === 'NOT CAPTURED'
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.code,
      ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.type
        .UPAYMENT_PROCESS_CANCELED,
      ResponseConstants.ERROR_MESSAGES.UPAYMENT_PROCESS_CANCELED
    );
  } catch (error) {
    console.log(error);
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
        .ORM_OPERATION_FAILED,
      ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
    );
  }
};
