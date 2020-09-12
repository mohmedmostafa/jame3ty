const db = require('../../app/modules');

const Op = db.Sequelize.Op;

function getUserdata(req, res) {
  const result = new Promise(async (res, rej) => {
    await db.User.findByPk(req.userId).then((user) => {
      user.getRoles().then(async (roles) => {
        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name_en === 'instructor') {
            inst = await db.Instructor.findOne({
              where: {
                userId: {
                  [Op.eq]: req.userId,
                },
              },
            });
            return res({ type: 'instructor', data: inst });
          }

          if (roles[i].name_en === 'student') {
            std = await db.Student.findOne({
              where: {
                userId: {
                  [Op.eq]: req.userId,
                },
              },
            });
            return res({ type: 'student', data: std });
          }
        }

        return res({ type: 'admin', data: user });
      });
    });
  });

  return result;
}

module.exports.getUserdata = getUserdata;
