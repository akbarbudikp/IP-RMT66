'use strict';
const {
  Model
} = require('sequelize');

function generateSlug(name) {
  return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Category.hasMany(models.Product, { foreignKey: 'categoryId', as: 'products' });
    }
  }
  Category.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: 'Category name already exists' },
      validate: {
        notNull: { msg: 'Category name required' },
        notEmpty: { msg: 'Category name required' }
      }
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Category',
    hooks: {
      beforeValidate: (category) => {
        if (category.isNewRecord && category.name) {
          category.slug = generateSlug(category.name);
        }
      }
    }
  });
  return Category;
};