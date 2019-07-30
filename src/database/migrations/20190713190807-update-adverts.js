module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn('adverts', 'link', {
                type: Sequelize.STRING,
                allowNull: false,
            }),
            queryInterface.addColumn('adverts', 'last_price', {
                type: Sequelize.FLOAT,
                allowNull: false,
            }),
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn('adverts', 'link'),
            queryInterface.removeColumn('adverts', 'last_price'),
        ]);
    },
};
