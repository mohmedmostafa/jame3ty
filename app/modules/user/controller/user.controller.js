exports.allAccess = (req, res) => {
  return Response(res, 200, 'Success!', 'Public Content.');
};

exports.userBoard = (req, res) => {
  return Response(res, 200, 'Success!', 'User Content.');
};

exports.adminBoard = (req, res) => {
  return Response(res, 200, 'Success!', 'Admin Content.');
};

exports.instructorBoard = (req, res) => {
  return Response(res, 200, 'Success!', 'Instructor Content.');
};
