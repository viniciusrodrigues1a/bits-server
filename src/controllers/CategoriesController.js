const yup = require('yup');

function CategoriesController(database) {
  async function store(request, response) {
    const bodySchema = yup.object().shape({
      name: yup.string().required(),
      iconPath: yup.string().required(),
    });

    if (!(await bodySchema.isValid(request.body))) {
      return response.status(400).json({ message: 'Validation failed!' });
    }

    const { name, iconPath } = request.body;

    const categoryAlreadyExists = await database('category')
      .where({ name })
      .orWhere({ icon_path: iconPath })
      .select('*')
      .first();

    if (categoryAlreadyExists) {
      return response.status(400).json({
        message: 'Category already exists',
      });
    }

    const category = await database('category')
      .insert({ name, icon_path: iconPath })
      .returning('*');

    return response.status(201).json({ id: category.id });
  }

  async function update(request, response) {
    const { name, iconPath } = request.body;

    if (!name && !iconPath) {
      return response.status(400).json({ message: 'Validation failed!' });
    }

    const { id } = request.params;

    const category = await database('category')
      .where({ id })
      .select('*')
      .first();

    if (!category) {
      return response.status(404).json({
        message: 'Category not found',
      });
    }

    await database('category')
      .where({ name })
      .orWhere({ icon_path: iconPath })
      .update({ name, icon_path: iconPath });

    return response.status(200).end();
  }

  async function destroy(request, response) {
    const { id } = request.params;

    const category = await database('category')
      .where({ id })
      .select('*')
      .first();

    if (!category) {
      return response.status(404).json({
        message: 'Category not found',
      });
    }

    await database('category').where({ id }).del();

    return response.status(200).end();
  }

  async function show(request, response) {
    const { id } = request.params;

    const category = await database('category')
      .where({ id })
      .select('*')
      .first();

    if (!category) {
      return response.status(404).json({
        message: 'Category not found',
      });
    }

    return response.status(200).json({ ...category });
  }

  async function index(request, response) {
    const categories = await database('category').select('*');

    return response.status(200).json({ categories });
  }

  return {
    store,
    update,
    destroy,
    show,
    index,
  };
}

module.exports = CategoriesController;
