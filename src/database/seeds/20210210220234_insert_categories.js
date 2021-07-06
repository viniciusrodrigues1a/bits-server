exports.seed = function (knex) {
  return knex('category')
    .del()
    .then(() =>
      knex('category').insert([
        {
          id: 999,
          name: 'Foods/Drinks',
          icon_path: 'coffee',
        },
        {
          id: 1000,
          name: 'Technology',
          icon_path: 'android',
        },
        {
          id: 1001,
          name: 'Update me',
          icon_path: 'icon',
        },
        {
          id: 1002,
          name: 'Delete me',
          icon_path: 'icon',
        },
      ])
    );
};
