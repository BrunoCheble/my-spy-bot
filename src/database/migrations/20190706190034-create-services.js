module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('services', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            emails: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            interval: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('services');
    },
};
