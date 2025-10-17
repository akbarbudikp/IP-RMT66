'use strict';
const {
  Model
} = require('sequelize');

const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
    }
  }
  Product.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Product name required' },
        notEmpty: { msg: 'Product name required' }
      }
    },
    description: DataTypes.TEXT,
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notNull: { msg: 'Price required' },
        notEmpty: { msg: 'Price required' },
        isDecimal: { msg: 'Price must be a valid number' },
        min: {
          args: [0],
          msg: 'Price cannot be negative'
        }
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Stock cannot be negative'
        }
      }
    },
    sku: {
      type: DataTypes.STRING,
      unique: true
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Image URL required' },
        notEmpty: { msg: 'Image URL required' },
        isUrl: { msg: 'Must be a valid URL' }
      }
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'Categiory ID required' },
        notEmpty: { msg: 'Categiory ID required' }
      }
    }
  }, {
    sequelize,
    modelName: 'Product',
    hooks: {
      beforeValidate: (product, options) => {
        console.log('--- HOOK beforeValidate RUNNING ---');
        console.log('Is New Record?', product.isNewRecord);
        console.log('Product Name:', product.name);

        if (product.isNewRecord && !product.sku && product.name) {
          const namePrefix = product.name.substring(0, 3).toUpperCase()
          product.sku = `${namePrefix}-${nanoid()}`;
        }
      }
    }
  });
  return Product;
};