const db = require('../../../modules');
const { Response } = require('../../../common/response.handler');
const bcrypt = require('bcryptjs');
const { number } = require('joi');
const Op = db.Sequelize.Op;
const db_connection = db.connection;
const db_Instructor = db.Instructor;
const db_User = db.User;
const db_Role = db.Role;
const db_User_Role = db.UserRole;
const db_Course = db.Course;
const db_Group = db.Group;

//---------------------------------------------------------------
exports.addInstructor = async (req, res) => {
  try {
    //Save TO DB
    console.log(req.files);
    const instructor = await db_connection.transaction(async (t) => {
      const inst = await db_Instructor.create({
      name_ar: req.body.name_ar,
      name_en: req.body.name_en,
      bio: req.body.bio,
      mobile: req.body.mobile,
      email: req.body.email,
      img: req.files['img']?req.files['img'][0].path.replace("public/",""):null,
      cv: req.files['file']?req.files['file'][0].path.replace("public/",""):null,
      },
      { transaction: t }
    );
      const user = await db_User.create({
        email: req.body.email,
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 8),
      },
      { transaction: t }
  );
  inst.setUser(user,{ transaction: t });

  const roles = await db_Role.findOne({
    where: {
      name_en: {
        [Op.eq]: ["instructor"],
      },
    },
  });

     await user.addRole(roles, { transaction: t });

    return inst;

  });
    //Success
     return Response(res, 200, 'Success!', { instructor });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Add', { error });
  }
};

//---------------------------------------------------------------
exports.updateInstructor = async (req, res) => {
  console.log("m8");
  try {
    //Check if the Instructor is already exsits
    let Instructor = await db_Instructor.findByPk(req.params.id);

    if (!Instructor) {
      return Response(res, 400, 'Instructor Not Found!', {});
    }

    //Do Update
    const instructor = await db_connection.transaction(async (t) => {  
      _Instructor = await db_Instructor.update(
        {
          name_ar: req.body.name_ar ? req.body.name_ar : Instructor.name_ar,
          name_en: req.body.name_en ? req.body.name_en : Instructor.name_en,
          bio: req.body.bio ? req.body.name_en : Instructor.bio,
          mobile: req.body.mobile ? req.body.name_en : Instructor.mobile,
          email: req.body.email ? req.body.email : Instructor.email,
          img: req.files['img']?req.files['img'][0].path.replace("public/",""):Instructor.img,
          cv: req.files['file']?req.files['file'][0].path.replace("public/",""):Instructor.cv,
        },
        { where: { id: req.params.id } },
        { transaction: t }
      );
      console.log(Instructor.get());

      let User = await db_Instructor.findByPk(Instructor.userId);

       _User = await db_User.update(
        {
          username: req.body.username  ? req.body.username : User.username,
          password: req.body.password ? bcrypt.hashSync(req.body.password, 8) : User.password,
          email: req.body.email ? req.body.email : User.email,
          
        },
        { where: { id: Instructor.userId } },
        { transaction: t }
      );
    });     
    //Success
    return Response(res, 200, 'Success!', [ _Instructor,_User ]);
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Udpate!', { error });
  }
};

//---------------------------------------------------------------
exports.deleteInstructor = async (req, res) => {
  try {
    //Check if the faculty is already exsits
    let Instructor = await db_Instructor.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: db_User
        },{ model: db_Course},{ model: db_Group}
      ],
    });


    if (!Instructor) {
      return Response(res, 400, 'Instructor Not Found!', {});
    }

    //Check if it has course or group
    if (Instructor.courses.length > 0) {
      return Response(res, 400, "Can't Delete. The Instructor has courses created", {
        Instructor,
      });
    }
    if (Instructor.groups.length > 0) {
      return Response(res, 400, "Can't Delete. The Instructor has group created", {
        Instructor,
      });
    }


    let instructorUserId=Instructor.userId;
    let user_id=Instructor.user.id;
    // //Delete
    const instructor = await db_connection.transaction(async (t) => {
    Instructor = await db_Instructor.destroy({
      where: { id: req.params.id }, 
    },
    { transaction: t });
    role =await db_User_Role.destroy({where:{userId:user_id}},
      { transaction: t });
    user =await db_User.destroy({where:{id:instructorUserId}},
      { transaction: t });
    });
    //Success
     return Response(res, 200, 'Success!',  [Instructor,role,user] );
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Udpate!', { error });
  }
};

//---------------------------------------------------------------
exports.listInstructor = async (req, res) => {
  const doPagination = parseInt(req.query.doPagination);
  const numPerPage = parseInt(req.query.numPerPage);
  const page = parseInt(req.query.page);

  //Count all rows
  let numRows = await db_Instructor.count({}).catch((error) => {
    return Response(res, 500, 'Fail to Count!', { error });
  });
  numRows = parseInt(numRows);

  //Total num of valid pages
  let numPages = Math.ceil(numRows / numPerPage);

  //Calc skip or offset to be used in limit
  let skip = (page - 1) * numPerPage;
  let _limit = numPerPage;

  //Query
  let name_ar = req.query.name_ar ? req.query.name_ar : '';
  let name_en = req.query.name_en ? req.query.name_en : '';

  try {
    let data;
    if (doPagination) {
      data = await db_Instructor.findAll({
        where: {
          [Op.or]: [
            {
              name_ar: {
                [Op.substring]: name_ar,
              },
            },
            {
              name_en: {
                [Op.substring]: name_en,
              },
            },
          ],
        },
        offset: skip,
        limit: _limit,
      });
    } else {
      data = await db_Instructor.findAll({
        where: {
          [Op.or]: [
            {
              name_ar: {
                [Op.substring]: name_ar,
              },
            },
            {
              name_en: {
                [Op.substring]: name_en,
              },
            },
          ],
        },
      });
    }

    let result = {
      numRows,
      numPerPage,
      numPages,
      page,
      data,
    };

    //Success
    return Response(res, 200, 'Success!', { result });
  } catch (error) {
    return Response(res, 500, 'Fail To Find!', { error });
  }
};
