const yup = require('yup');
const hashAndSalt = require('../utils/hashAndSalt');
const token = require('../utils/token');

function SessionController(database) {
  async function store(request, response) {
    const bodySchema = yup.object().shape({
      email: yup.string().email().required(),
      password: yup.string().required(),
    });

    if (!(await bodySchema.isValid(request.body))) {
      return response.status(400).json({ message: 'Validation failed!' });
    }

    const { email } = request.body;

    const user = await database('user').where({ email }).select('*').first();

    if (!user) {
      return response.status(400).json({ message: 'Wrong email!' });
    }

    const { password } = request.body;

    const hashedPassword = hashAndSalt(password, user.salt);

    if (hashedPassword !== user.password_hash) {
      return response.status(400).json({ message: 'Wrong password!' });
    }

    const { id, username } = user;

    return response.json({
      token: token.sign({ id, username }),
    });
  }

  async function validateToken(_, response) {
    return response.status(200).end();
  }

  return {
    store,
    validateToken,
  };
}

module.exports = SessionController;
