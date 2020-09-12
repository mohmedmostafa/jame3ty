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

//---------------------------------------------
//Email Domain Validation
//Email Valdiation
let validDomains = [
  '@aou.edu.om',
  '@arabou.edu.kw',
  '@aou.edu.kw',
  '@aou.edu.jo',
  '@aou.edu.lb',
  '@arabou.edu.sa',
  '@aou.edu.jo',
  '@aou.edu.eg',
];

function validateEmailDomain(email) {
  return new Promise((resolve, reject) => {
    for (let i in validDomains) {
      if (
        email.indexOf(
          validDomains[i],
          email.length - validDomains[i].length
        ) !== -1
      ) {
        console.log('Valid Email and Domain');
        resolve({ isValidEmail: 1 });
        return;
      }
    }

    //
    console.log('Invalid Email');
    reject({ isValidEmail: 0 });
    return;
  });
}

//------------------------------------------

module.exports.getUserdata = getUserdata;
module.exports.validateEmailDomain = validateEmailDomain;
