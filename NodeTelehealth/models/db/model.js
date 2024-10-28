const { DataTypes, Op } = require('sequelize');
const sequelize = require('./database');

// Doctor Model
const Doctor = sequelize.define('Doctor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  specializationid: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  license_number: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  years_of_experience: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  affiliated_hospital: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  available: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'doctor',
  //schema: 'telehealth',
  timestamps: false,
});

// Specialization Model
const Specialization = sequelize.define('Specialization', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'specialization',
  //schema: 'telehealth',
  timestamps: false,
});

// Patient Model
const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  emergency_contact_phone: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  emergency_contact_email: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'patient',
  //schema: 'telehealth',
  timestamps: false,
});

// Machine Model
const Machine = sequelize.define('Machine', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  deviceid: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  username: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
  locationname: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  location: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  tableName: 'machine',
  //schema: 'telehealth',
  timestamps: false,
});

// Member Model
const Member = sequelize.define('Member', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  username: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  iden: {
    type: DataTypes.STRING(45),
    allowNull: true,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  role: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  gender: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  birthday: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  tableName: 'member',
  timestamps: false,
});

// Associations
Doctor.hasMany(Patient, { foreignKey: 'doctor_id' });
Patient.belongsTo(Doctor, { foreignKey: 'doctor_id' });

Specialization.hasMany(Doctor, { foreignKey: 'specializationid' });
Doctor.belongsTo(Specialization, { foreignKey: 'specializationid' });

// Export all models
module.exports = { Doctor, Specialization, Patient, Machine, Member };
