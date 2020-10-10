const db = require('../index.js');
const {
  Response,
  ResponseConstants,
} = require('../../common/response/response.handler');

const { Sequelize, connection } = require('../index.js');

const QueryTypes = db.Sequelize.QueryTypes;
const Op = db.Sequelize.Op;
const db_connection = db.connection;
const db_ConfigForMobile = db.ConfigForMobile;

exports.listConfigForMobileById = async (req, res) => {
  try {
    //Check if found
    const configForMobile = await db_ConfigForMobile.findOne({
      where: { id: parseInt(req.params.id) },
    });

    if (!configForMobile) {
      console.log('!configForMobile');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND
      );
    }

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      { configForMobile }
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
