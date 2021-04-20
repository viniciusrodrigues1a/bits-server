const token = require('../utils/token');

async function verify(request, response, next) {
  let decoded;

  const { authorization } = request.headers;

  if (!authorization) {
    return response.status(401).json({ message: 'Token not provided' });
  }

  const headerToken = authorization.split(' ')[1];

  try {
    decoded = await token.verify(headerToken);

    request.userData = { ...decoded };

    return next();
  } catch (err) {
    return response.status(401).json({ message: 'Token is not valid' });
  }
}

module.exports = verify;
