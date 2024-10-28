const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const { Member } = require('./model');

const BMI = sequelize.define('BMI', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    iden: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    height: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    weight: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    bmi: {
        type: DataTypes.STRING(45),
        allowNull: true,
    }
}, {
    tableName: 'bmi',
},)

const bo = sequelize.define('bo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    iden: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    os: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    bpm: {
        type: DataTypes.STRING(45),
        allowNull: true,
    }
},
    { freezeTableName: true });

const BP = sequelize.define('BP', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    iden: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    sbp: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    dbp: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    hr: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    avi: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    api: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    sbpR: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    dbpR: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    hrR: {
        type: DataTypes.STRING(45),
        allowNull: true,
    }
},
    { freezeTableName: true, });

const BF = sequelize.define('BF', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    iden: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    fm: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    fp: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    vfal: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    bmr: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    sfm: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    sfr: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    tbw: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    tbwc: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    sm: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    mm: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    mml: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    proteinRate: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    protein: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    lbm: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    ecf: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    icf: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    minerals: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    other: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    fmAdjus: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    mmAdjus: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    bodyAge: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    bodyScore: {
        type: DataTypes.STRING(45),
        allowNull: true,
    }
},
    { freezeTableName: true, })

const temp = sequelize.define('temp', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    iden: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    ttype: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    tempv: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    dw: {
        type: DataTypes.STRING(45),
        allowNull: true,
    }
},
    { freezeTableName: true });

const bs = sequelize.define('bs', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    iden: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    value: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    value_type: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    ua: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    chol: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    hb: {
        type: DataTypes.STRING(45),
        allowNull: true,
    }
}, {
    freezeTableName: true
});

const whr = sequelize.define('whr', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    iden: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    waistline: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    hipline: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    ratio: {
        type: DataTypes.STRING(45),
        allowNull: true,
    }
}, { freezeTableName: true });

const ncg = sequelize.define('ncg', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    iden: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    leu: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    bld: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    ph: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    pro: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    ubg: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    nit: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    vc: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    glu: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    bil: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    ket: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    sg: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    ma: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    cre: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    ca: {
        type: DataTypes.STRING(45),
        allowNull: true,
    }
}, { freezeTableName: true });

const zytz = sequelize.define('zytz', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    iden: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    type: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
}, { freezeTableName: true });

const ecg = sequelize.define('ecg', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    iden: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    hr: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    p: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    pr: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    qrs: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    qt: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    qtc: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    pa: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    qrsa: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    ta: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    rv5: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    sv1: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    rv5sv1: {
        type: DataTypes.STRING(45),
        allowNull: true,
    }
}, { freezeTableName: true });

const xzsx = sequelize.define('xzsx', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    iden: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    chol: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    hdl: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    ldl: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    trig: {
        type: DataTypes.STRING(45),
        allowNull: true,
    }
}, { freezeTableName: true });

const eye = sequelize.define('eye', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    iden: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    eLeft: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    eRight: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    lLeft: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    lRight: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    color: {
        type: DataTypes.STRING(45),
        allowNull: true,
    }
}, { freezeTableName: true });

const sds = sequelize.define('sds', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    iden: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    score: {
        type: DataTypes.STRING(45),
        allowNull: true,
    }
}, { freezeTableName: true });

const thxhdb = sequelize.define('thxhdb', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    iden: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    value: {
        type: DataTypes.STRING(45),
        allowNull: true,
    }
}, { freezeTableName: true });

const fei = sequelize.define('fei', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    iden: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    pef: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    pef_: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    fev1: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    fev1_: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    fvc: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    fvc_: {
        type: DataTypes.STRING(45),
        allowNull: true,
    }
}, { freezeTableName: true });

const jiu = sequelize.define('jiu', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    iden: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    value: {
        type: DataTypes.STRING(45),
        allowNull: true,
    }
}, { freezeTableName: true });

const gmd = sequelize.define('gmd', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    iden: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    bodyAge: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    bodyMonth: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    zScore: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    zRatio: {
        type: DataTypes.STRING(45),
        allowNull: true,
    }
}, { freezeTableName: true });

const com = sequelize.define('com', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    iden: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    tScore: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    tRatio: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    bqi: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    eoa: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    p_Height: {
        type: DataTypes.STRING(45),
        allowNull: true,
    }
}, { freezeTableName: true });

Member.hasMany(BMI, { foreignKey: 'iden', sourceKey: 'iden' });
BMI.belongsTo(Member, { foreignKey: 'iden', targetKey: 'iden' });

Member.hasMany(bo, { foreignKey: 'iden', sourceKey: 'iden' });
bo.belongsTo(Member, { foreignKey: 'iden', targetKey: 'iden' });

Member.hasMany(BP, { foreignKey: 'iden', sourceKey: 'iden' });
BP.belongsTo(Member, { foreignKey: 'iden', targetKey: 'iden' });

Member.hasMany(BF, { foreignKey: 'iden', sourceKey: 'iden' });
BF.belongsTo(Member, { foreignKey: 'iden', targetKey: 'iden' });

Member.hasMany(temp, { foreignKey: 'iden', sourceKey: 'iden' });
temp.belongsTo(Member, { foreignKey: 'iden', targetKey: 'iden' });

Member.hasMany(bs, { foreignKey: 'iden', sourceKey: 'iden' });
bs.belongsTo(Member, { foreignKey: 'iden', targetKey: 'iden' });

Member.hasMany(whr, { foreignKey: 'iden', sourceKey: 'iden' });
whr.belongsTo(Member, { foreignKey: 'iden', targetKey: 'iden' });

Member.hasMany(ncg, { foreignKey: 'iden', sourceKey: 'iden' });
ncg.belongsTo(Member, { foreignKey: 'iden', targetKey: 'iden' });

Member.hasMany(zytz, { foreignKey: 'iden', sourceKey: 'iden' });
zytz.belongsTo(Member, { foreignKey: 'iden', targetKey: 'iden' });

Member.hasMany(ecg, { foreignKey: 'iden', sourceKey: 'iden' });
ecg.belongsTo(Member, { foreignKey: 'iden', targetKey: 'iden' });

Member.hasMany(xzsx, { foreignKey: 'iden', sourceKey: 'iden' });
xzsx.belongsTo(Member, { foreignKey: 'iden', targetKey: 'iden' });

Member.hasMany(eye, { foreignKey: 'iden', sourceKey: 'iden' });
eye.belongsTo(Member, { foreignKey: 'iden', targetKey: 'iden' });

Member.hasMany(sds, { foreignKey: 'iden', sourceKey: 'iden' });
sds.belongsTo(Member, { foreignKey: 'iden', targetKey: 'iden' });

Member.hasMany(thxhdb, { foreignKey: 'iden', sourceKey: 'iden' });
thxhdb.belongsTo(Member, { foreignKey: 'iden', targetKey: 'iden' });

Member.hasMany(fei, { foreignKey: 'iden', sourceKey: 'iden' });
fei.belongsTo(Member, { foreignKey: 'iden', targetKey: 'iden' });

Member.hasMany(jiu, { foreignKey: 'iden', sourceKey: 'iden' });
jiu.belongsTo(Member, { foreignKey: 'iden', targetKey: 'iden' });

Member.hasMany(gmd, { foreignKey: 'iden', sourceKey: 'iden' });
gmd.belongsTo(Member, { foreignKey: 'iden', targetKey: 'iden' });

Member.hasMany(com, { foreignKey: 'iden', sourceKey: 'iden' });
com.belongsTo(Member, { foreignKey: 'iden', targetKey: 'iden' });

module.exports = { BMI, bo, BP, BF, temp, bs, whr, ncg, zytz, ecg, xzsx, eye, sds, thxhdb, fei, jiu, gmd, com };
