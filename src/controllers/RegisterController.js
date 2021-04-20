const crypto = require('crypto');
const yup = require('yup');
const hashAndSalt = require('../utils/hashAndSalt');

function RegisterController(database) {
  async function store(request, response) {
    const bodySchema = yup.object().shape({
      name: yup.string().required(),
      email: yup.string().email().required(),
      password: yup.string().min(8).required(),
    });

    if (!(await bodySchema.isValid(request.body))) {
      return response.status(400).json({ message: 'Validation failed!' });
    }

    const { name, email, password } = request.body;

    const userWithEmailExists = await database('user')
      .where({ email })
      .select('*')
      .first();

    if (userWithEmailExists) {
      return response
        .status(400)
        .json({ message: 'Email not available!' })
        .end();
    }

    const salt = crypto.randomBytes(8).toString('hex').slice(0, 16);
    const hashedPassword = hashAndSalt(password, salt);

    const user = (
      await database('user')
        .insert({
          name,
          email,
          password_hash: hashedPassword,
          salt,
        })
        .returning('*')
    )[0];

    return response.status(201).json({ id: user.id });
  }

  return {
    store,
  };
}

module.exports = RegisterController;
