const nodemailer = require('nodemailer');
const crypto = require('crypto');

//-------------------------------------------------
//Generate random token
exports.generateRandomToken = ({
  stringBase = 'base64',
  byteLength = 48,
} = {}) => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(byteLength, (err, buffer) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log('Code: ');
        console.log(buffer.toString(stringBase));
        resolve(buffer.toString(stringBase));
      }
    });
  });
};

//-------------------------------------------------
//Send token/code to Email
exports.sendSignupVerificationEmail = async (token, receiverEmail) => {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <mal.menofiauniversity@gmail.com>', // sender address
    to: receiverEmail, // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world?', // plain text body
    html: '<b>Verification Code : <strong>' + token + '</strong></b>', // html body
  });

  console.log('Message sent: %s', info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
};

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

exports.validateEmailDomain = (email) => {
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
};
