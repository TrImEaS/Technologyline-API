const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('ADMIN', 'Thomas2024az', 'Dacarry-123@', {
  host: 'localhost',
  dialect: 'mysql',
});

const ProductSchema = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  sub_category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  specifications: {
    type: DataTypes.STRING,
    defaultValue: 'Este producto no contiene especificaciones'
  },
  descriptions: {
    type: DataTypes.STRING,
    defaultValue: 'Este producto no contiene descripcion'
  },
  img_base: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  discount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
      min: 1
    }
  },
  total_views: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
      min: 1
    }
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  adminStatus: {
    type: DataTypes.BOOLEAN,
    defaultValue: null
  }
}, {
  tableName: 'products', // Opcional: nombre de la tabla en la base de datos
  timestamps: false, // Desactiva las columnas createdAt y updatedAt
});

module.exports = ProductSchema