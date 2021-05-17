const yup = require('yup');
const Dinero = require('dinero.js');

function WalletController(database) {
  async function store(request, response) {
    const bodySchema = yup.object().shape({
      name: yup.string().required(),
      balance: yup.number().positive().required(),
      currency: yup.string().required(),
      description: yup.string(),
    });

    if (!(await bodySchema.isValid(request.body))) {
      return response.status(400).json({ message: 'Validation failed!' });
    }

    const { id } = request.userData;
    const { name, balance, currency, description } = request.body;

    const walletAlreadyExists = await database('wallet')
      .where({ name, user_id: id })
      .select('*')
      .first();

    if (walletAlreadyExists) {
      return response
        .status(400)
        .json({ message: 'Wallet of same name already exists' });
    }

    const dinero = Dinero({ amount: balance, currency });
    const wallet = (
      await database('wallet')
        .insert({
          user_id: id,
          balance: dinero.getAmount(),
          name,
          currency,
          description,
        })
        .returning('*')
    )[0];

    return response.status(201).json({ id: wallet.id });
  }

  async function update(request, response) {
    const { balance, name } = request.body;

    if (!name && !balance) {
      return response.status(400).json({ message: 'Validation failed!' });
    }

    const { id } = request.params;

    const wallet = await database('wallet').where({ id }).select('*').first();

    if (!wallet) {
      return response.status(404).json({
        message: 'Wallet not found',
      });
    }

    let dinero;
    if (balance) {
      dinero = Dinero({
        amount: balance,
        currency: wallet.currency,
      }).getAmount();
    }

    await database('wallet').where({ id }).update({ balance: dinero, name });

    return response.status(200).end();
  }

  async function show(request, response) {
    const { id } = request.params;
    const { id: userId } = request.userData;

    const wallet = await database('wallet').where({ id }).select('*').first();

    if (!wallet) {
      return response.status(404).json({
        message: 'Wallet not found',
      });
    }

    if (wallet.user_id !== userId) {
      return response.status(401).json({
        message: 'This wallet is not yours',
      });
    }

    return response.status(200).json({ ...wallet });
  }

  async function destroy(request, response) {
    const { id } = request.params;

    const wallet = await database('wallet').where({ id }).select('*').first();

    if (!wallet) {
      return response.status(404).json({
        message: 'Wallet not found',
      });
    }

    const { id: userId } = request.userData;

    if (wallet.user_id !== userId) {
      return response.status(401).json({
        message: 'This wallet is not yours',
      });
    }

    await database('wallet').where({ id }).del();

    return response.status(200).end();
  }

  async function index(request, response) {
    const { id } = request.userData;

    const wallets = await database('wallet').where({ user_id: id }).select('*');

    if (!wallets) {
      return response
        .status(404)
        .json({ message: "User doesn't have a wallet" });
    }

    return response.status(200).json(wallets);
  }

  return {
    store,
    update,
    show,
    index,
    destroy,
  };
}

module.exports = WalletController;
