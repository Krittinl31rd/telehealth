var createError = require('http-errors');
var express = require('express');
var cors = require('cors')
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
const WebSocket = require("ws");
var http = require('http');
var https = require('https');
const fs = require('fs');
const { readdirSync } = require("fs");
// const avtartxt = require('./avatar.json');
const { command, role } = require('./models/cmd');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
var { Doctor, Specialization, Patient, Machine, Member, Op } = require('./models/db/model');
const sequelize = require('./models/db/database');
const { BMI, bo, BP, BF, temp, bs, whr, ncg, zytz, ecg, xzsx, eye, sds, thxhdb, fei, jiu, gmd, com } = require('./models/db/measurement');
const serverOptions = {
    cert: fs.readFileSync("server.crt", "utf8"),
    key: fs.readFileSync("server.key", "utf8"),
};
const specialties = require("./data/specialties.json")

// Function to get a member by ID
async function getMemberById(memberId) {
    try {
        const member = await Member.findByPk(memberId);
        if (member) {
            //console.log('Member found:', member.toJSON());
            console.log('Member found:');
        } else {
            console.log('Member not found');
        }
    } catch (error) {
        console.error('Error fetching member:', error);
    }
}

// Function to update a member's name by ID
async function updateMemberNameById(memberId, newName) {
    try {
        const member = await Member.findByPk(memberId);
        if (member) {
            member.name = newName; // Update the name
            await member.save(); // Save the changes
            //console.log('Member updated successfully:', member.toJSON());
            console.log('Member updated successfully:');
        } else {
            console.log('Member not found');
        }
    } catch (error) {
        console.error('Error updating member:', error);
    }
}
// Function to delete a member by ID
async function deleteMemberById(memberId) {
    try {
        const result = await Member.destroy({
            where: {
                id: memberId,
            },
        });

        if (result) {
            console.log('Member deleted successfully');
        } else {
            console.log('Member not found');
        }
    } catch (error) {
        console.error('Error deleting member:', error);
    }
}
// Function to find a member by iden
async function findMemberByIden(iden) {
    try {
        const member = await Member.findOne({
            where: {
                iden: iden, // Condition to match the iden field
            },
        });

        if (member) {
            let pat = member.toJSON();
            console.log('Member found:');
            return pat;
        } else {
            console.log('Member not found');
        }
    } catch (error) {
        console.error('Error fetching member by iden:', error);
    }
    return undefined;
}


// Example Usage
const memberId = 1; // ID of the member to fetch and update
const newName = 'Thaweechai s';
/*Member.create({
    name: "Jack",

});*/
// Get the member by ID
//getMemberById(memberId);

// Update the member's name by ID
//updateMemberNameById(memberId, newName);
//Remove the member by ID
//deleteMemberById(5);

//var { DB_INITIAL, DB_SEL, DB_SELP, DB_EXC, DB_EXCP } = require("./services/dbms")
//DB_INITIAL();
/*
DB_SEL('SELECT * FROM `member`  LIMIT 5', function (response) {
    console.log("res1 :" + response.status);
    //console.log("res1 :" + response.result);
    response.result.forEach(element => {
        console.log(element.name);
        console.log(element.iden);
        console.log(element.gender == 1 ? "Male" : "Female");

        let queryDate = new Date(element.birthday); // Assume UTC
        // Adjust manually by calculating the time zone offset in milliseconds
        const timeZoneOffset = 7 * 60 * 60 * 1000; // UTC+7 offset
        const localQueryDate = new Date(queryDate.getTime() + timeZoneOffset);
        // Get the adjusted date part (YYYY-MM-DD)
        const localQueryDateString = localQueryDate.toISOString().split('T')[0];
        console.log(localQueryDateString); // "1996-10-22" if adjusted correctly

        console.log(element.email);
        console.log(element.phone);
        console.log(element.status == 1 ? "Active" : "Inactive");
        console.log('========================================');
    });
});
DB_SELP('SELECT * FROM `member` WHERE `id` = ?', [1], function (response) {
    console.log("res2 :" + response.status);
    //console.log("res2 :" + response.result);
    response.result.forEach(element => {
        console.log(element.name);
        console.log(element.iden);
        console.log(element.gender == 1 ? "Male" : "Female");

        let queryDate = new Date(element.birthday); // Assume UTC
        // Adjust manually by calculating the time zone offset in milliseconds
        const timeZoneOffset = 7 * 60 * 60 * 1000; // UTC+7 offset
        const localQueryDate = new Date(queryDate.getTime() + timeZoneOffset);
        // Get the adjusted date part (YYYY-MM-DD)
        const localQueryDateString = localQueryDate.toISOString().split('T')[0];
        console.log(localQueryDateString); // "1996-10-22" if adjusted correctly

        console.log(element.email);
        console.log(element.phone);
        console.log(element.status == 1 ? "Active" : "Inactive");
    });
});

DB_EXCP("update member set name = ? where id = ?", ["nottingham", 1], function (response) {
    console.log("excp :" + response.status);
    console.log("affectedRows :" + response.result.affectedRows);
    console.log("info :" + response.result.info);
    
});
*/


// Access the environment variables
const serverHost = process.env.SERVER_HOST;
const serverPort = process.env.SERVER_PORT;
const maxClients = process.env.MAX_CLIENTS;

console.log(`> ${serverHost}:${serverPort} [max client : ${maxClients} connection]`);


var app = express();


// Set up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware stack
app.use(cors({
    cors: {
        origin: "*", // Allow requests from this origin
        methods: ["GET", "POST"]
    }
}))
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '100mb' })); // Increase payload size limit
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    console.log('Request Body Size:', req.headers['content-length']);
    next();
});


//Set Router
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
// var patientRouter = require('./routes/patient');
// var doctorRouter = require('./routes/doctor');

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
// app.use('/patient', patientRouter);
// app.use('/doctor', doctorRouter);


sequelize.sync().then(() => {
    console.log('Database synchronized');
}).catch((error) => {
    console.error('Error synchronizing database:', error);
});

//Core API ====================================================================
app.post('/add-member', async (req, res) => {
    try {
        const { name, username, iden, password, role, gender, birthday, email, phone, status } = req.body
        const member = await Member.findOne({
            where: {
                iden: iden
            }
        })
        if (member) {
            return res.status(404).json({ message: "Member is already exits." })
        }
        await Member.create({
            name, username, iden, password, role, gender, birthday, email, phone, status
        })
        res.status(200).json({ message: "Add member successfully." })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internet server error" })
    }
})

app.post('/facerecog', async function (req, res, next) {
    const { action, deviceID, content } = req.body;
    // Log the received data
    console.log(`Action: ${action}`);
    console.log(`Device ID: ${deviceID}`);

    // Decode the base64 image content and save it as a file
    const imageBuffer = Buffer.from(content, 'base64');
    fs.writeFileSync('image.jpg', imageBuffer);
    console.log(`imageBuffer: Saved`);

    const member = await Member.findOne({
        where: {
            iden: "1"
        }
    })
    let payload = {
        recode: "2000",
        remsg: "success",
        userinfo:
        {
            name: member.name,
            sex: member.gender == 1 ? "Male" : "Female",
            age: caulateAge(member.birthday),
            usernum: member.iden,
            address: "128 soi Inthraporn BKK.",
            remark: "GG NT"
        }
    };

    let wsc = getClientByMachineId(deviceID);
    if (wsc != undefined) {
        let report = {
            cmd: command.enableConsult,
            param: {
                status: 1, //0=undefined, 1=success, 2=failed
                deviceId: deviceID,
                iden: payload.userinfo.usernum,
                message: "success"
            }
        }
        wsc.socket.send(JSON.stringify(report));
    }
    res.json(payload);
});

const caulateAge = (brithdate) => {
    const today = new Date();
    const birthDate = new Date(brithdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

app.post('/verifyid', async (req, res) => {
    const { action, deviceID, type, xid } = req.body;
    // search xid
    const member = await Member.findOne({
        where: {
            iden: xid
        }
    })
    if (!member) {
        return res.status(404).json({ message: "Member not found." })
    }

    // create payload
    let payload = {
        retCode: "1",
        uinfo:
        {
            title: "Archi-tronic Co.,Ltd.",//Title:unit,school class,etc.
            cardID: member.iden,//Cardphysical IDisusedforassociatedinformationafter readingthecard(generallynotdisplayed)
            userNum: member.iden,//UserIDfor identificationanddisplay
            name: member.name,//Name
            sex: member.gender == 1 ? "Male" : "Female",//Gender:Male,Female
            age: caulateAge(member.birthday),//Ageoryearofbirth
            headimgurl: "",//Remoteavatarpictureaddress
            imgBaseData: "",//base64 imageinformation///--- "data:image/png;base64," + 
            remark: ""//Customnote information
        },
        dbinfo: {//Userofflinelibraryinformation(note:onlyreturnedwhenitneedstobe updated)
            loc: "1",//Databasefilestoragelocation:0=externalUSBflashdrive;1=device memory(limit10M)
            dbUrl: "https://www.m-iot.cn/x/U2018030110300000.db"//Updatedownloadpath (.dbonly)
        },
        msg: "success"//Statusdescription
    };
    res.status(200).send(payload);
    let wsc = getClientByMachineId(deviceID);
    if (wsc != undefined) {
        let report = {
            cmd: command.enableConsult,
            param: {
                status: 1, //0=undefined, 1=success, 2=failed
                deviceId: deviceID,
                iden: member.iden,
                message: "success"
            }
        }
        //console.log(report);
        wsc.socket.send(JSON.stringify(report));
    }
});

app.post('/result', async (req, res, next) => {
    let returnServer = {
        refCode: "1",
        msg: "success"
    }
    try {
        const { action, deviceID, datas } = req.body;
        const data = datas[0];
        if (data.BMI != undefined) {
            await BMI.create({
                iden: data.UID,
                height: data.BMI?.height,
                weight: data.BMI?.weight,
                bmi: data.BMI?.bmi
            })
            return res.status(200).send(returnServer);
        } else if (data.BP != undefined) {
            await BP.create({
                iden: data.UID,
                sbp: data.BP?.sbp,
                dbp: data.BP?.dbp,
                hr: data.BP?.hr,
                avi: data.BP?.avi,
                api: data.BP?.api,
                sbpR: data.BP?.sbpR,
                dbpR: data.BP?.dbpR,
                hrR: data.BP?.hrR
            })
            return res.status(200).send(returnServer);
        } else if (data.BF != undefined) {
            await BF.create({
                iden: data.UID,
                fm: data.BF?.fm,
                fp: data.BF?.fp,
                vfal: data.BF?.vfal,
                bmr: data.BF?.bmr,
                sfm: data.BF?.sfm,
                sfr: data.BF?.sfr,
                tbw: data.BF?.tbw,
                tbwc: data.BF?.tbwc,
                sm: data.BF?.sm,
                mm: data.BF?.mm,
                mml: data.BF?.mml,
                proteinRate: data.BF?.proteinRate,
                protein: data.BF?.protein,
                lbm: data.BF?.lbm,
                ecf: data.BF?.ecf,
                icf: data.BF?.icf,
                minerals: data.BF?.minerals,
                other: data.BF?.other,
                fmAdjus: data.BF?.fmAdjus,
                mmAdjus: data.BF?.mmAdjus,
                bodyAge: data.BF?.bodyAge,
                bodyScore: data.BF?.bodyScore
            })
            return res.status(200).send(returnServer);
        } else if (data.temp != undefined) {
            await temp.create({
                iden: data.UID,
                ttype: data.temp?.ttype,
                tempv: data.temp?.tempv,
                dw: data.temp?.dw,
            })
            return res.status(200).send(returnServer);
        } else if (data.bo != undefined) {
            await bo.create({
                iden: data.UID,
                os: data.bo?.os,
                bpm: data.bo?.bpm,
            })
            return res.status(200).send(returnServer);
        } else if (data.bs != undefined) {
            await bs.create({
                iden: data.UID,
                value: data.bs?.value,
                value_type: data.bs?.value_type,
                ua: data.bs?.ua,
                chol: data.bs?.chol,
                hb: data.bs?.hb,
            })
            return res.status(200).send(returnServer);
        } else if (data.whr != undefined) {
            await whr.create({
                iden: data.UID,
                waistline: data.whr?.waistline,
                hipline: data.whr?.hipline,
                ratio: data.whr?.ratio,
            })
            return res.status(200).send(returnServer);
        } else if (data.ncg != undefined) {
            await ncg.create({
                iden: data.UID,
                leu: data.ncg?.leu,
                bld: data.ncg?.bld,
                ph: data.ncg?.ph,
                pro: data.ncg?.pro,
                ubg: data.ncg?.ubg,
                nit: data.ncg?.nit,
                vc: data.ncg?.vc,
                glu: data.ncg?.glu,
                bil: data.ncg?.bil,
                ket: data.ncg?.ket,
                sg: data.ncg?.sg,
                ma: data.ncg?.ma,
                cre: data.ncg?.cre,
                ca: data.ncg?.ca,
            })
            return res.status(200).send(returnServer);
        } else if (data.zytz != undefined) {
            await zytz.create({
                iden: data.UID,
                type: data.zytz?.type
            })
            return res.status(200).send(returnServer);
        } else if (data.ecg != undefined) {
            await ecg.create({
                iden: data.UID,
                hr: data.ecg?.hr,
                p: data.ecg?.p,
                pr: data.ecg?.pr,
                qrs: data.ecg?.qrs,
                qt: data.ecg?.qt,
                qtc: data.ecg?.qtc,
                pa: data.ecg?.pa,
                qrsa: data.ecg?.qrsa,
                ta: data.ecg?.ta,
                rv5: data.ecg?.rv5,
                sv1: data.ecg?.sv1,
                rv5sv1: data.ecg?.rv5sv1,
            })
            return res.status(200).send(returnServer);
        } else if (data.xzsx != undefined) {
            await xzsx.create({
                iden: data.UID,
                chol: data.xzsx?.chol,
                hdl: data.xzsx?.hdl,
                ldl: data.xzsx?.ldl,
                trig: data.xzsx?.trig,
            })
            return res.status(200).send(returnServer);
        } else if (data.eye != undefined) {
            await eye.create({
                iden: data.UID,
                eLeft: data.eye?.eLeft,
                eRight: data.eye?.eRight,
                lLeft: data.eye?.lLeft,
                lRight: data.eye?.lRight,
                color: data.eye?.color,
            })
            return res.status(200).send(returnServer);
        } else if (data.sds != undefined) {
            await sds.create({
                iden: data.UID,
                score: data.sds?.score,
            })
            return res.status(200).send(returnServer);
        } else if (data.thxhdb != undefined) {
            await thxhdb.create({
                iden: data.UID,
                value: data.thxhdb?.value,
            })
            return res.status(200).send(returnServer);
        } else if (data.fei != undefined) {
            await fei.create({
                iden: data.UID,
                pef: data.fei?.pef,
                pef_: data.fei?.pef_,
                fev1: data.fei?.fev1,
                fev1_: data.fei?.fev1_,
                fvc: data.fei?.fvc,
                fvc_: data.fei?.fvc_,
            })
            return res.status(200).send(returnServer);
        } else if (data.jiu != undefined) {
            await jiu.create({
                iden: data.UID,
                value: data.jiu?.value,
            })
            return res.status(200).send(returnServer);
        } else if (data.gmd != undefined) {
            await gmd.create({
                iden: data.UID,
                bodyAge: data.gmd?.bodyAge,
                bodyMonth: data.gmd?.bodyMonth,
                zScore: data.gmd?.zScore,
                zRatio: data.gm?.zRatio,
            })
            return res.status(200).send(returnServer);
        } else if (data.com != undefined) {
            await com.create({
                iden: data.UID,
                tScore: data.com?.tScore,
                tRatio: data.com?.tRatio,
                bqi: data.com?.bqi,
                eoa: data.com?.eoa,
                p_Height: data.com?.p_Height,
            })
            return res.status(200).send(returnServer);
        }
    } catch (err) {
        console.log(err);
        returnServer.refCode = "0";
        returnServer.msg = "failure";
        res.status(500).send(returnServer);
    }
});

app.post('/getpatient', async function (req, res, next) {
    let piden = '11111XXXXXXXX';
    let pat = await findMemberByIden(piden);
    if (pat != undefined) {
        //console.log('Member found:', pat);
        res.status(200).send({ status: 1, info: pat });
    }
    else {
        res.status(200).send({ status: 0, message: 'patient not found' });
    }
});

app.get('/data/:iden', async (req, res) => {
    // 14102XXXXXXXX
    const iden = req.params.iden;
    try {
        const member = await Member.findOne({
            where: { iden: iden },
            attributes: ['id', 'name', 'iden', 'birthday'],
            include: [
                {
                    model: BMI,
                    where: { iden: iden },
                    limit: 1,
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: BP,
                    where: { iden: iden },
                    limit: 1,
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: BF,
                    where: { iden: iden },
                    limit: 1,
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: temp,
                    where: { iden: iden },
                    limit: 1,
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: bo,
                    where: { iden: iden },
                    limit: 1,
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: bs,
                    where: { iden: iden },
                    limit: 1,
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: whr,
                    where: { iden: iden },
                    limit: 1,
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: ncg,
                    where: { iden: iden },
                    limit: 1,
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: zytz,
                    where: { iden: iden },
                    limit: 1,
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: ecg,
                    where: { iden: iden },
                    limit: 1,
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: xzsx,
                    where: { iden: iden },
                    limit: 1,
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: eye,
                    where: { iden: iden },
                    limit: 1,
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: sds,
                    where: { iden: iden },
                    limit: 1,
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: thxhdb,
                    where: { iden: iden },
                    limit: 1,
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: fei,
                    where: { iden: iden },
                    limit: 1,
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: jiu,
                    where: { iden: iden },
                    limit: 1,
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: gmd,
                    where: { iden: iden },
                    limit: 1,
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: com,
                    where: { iden: iden },
                    limit: 1,
                    order: [['createdAt', 'DESC']]
                },
            ],
        });

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        let result = {
            id: member.id,
            iden: member.iden,
            name: member.name,
            birthday: member.birthday,
            age: caulateAge(member.birthday),
            result: []
        }

        if (member.BMIs.length > 0) {
            result.result.push({
                data: member.BMIs,
                categories: 'Height and weight'
            })
        }
        if (member.BPs.length > 0) {
            result.result.push({
                data: member.BPs,
                categories: 'Blood pressure and heart rate'
            })
        }
        if (member.BFs.length > 0) {
            result.result.push({
                data: member.BFs,
                categories: 'Body composition'
            })
        }
        if (member.temps.length > 0) {
            result.result.push({
                data: member.temps,
                categories: 'Thermometry'
            })
        }
        if (member.bos.length > 0) {
            result.result.push({
                data: member.bos,
                categories: 'Blood oxygen'
            })
        }
        if (member.bs.length > 0) {
            result.result.push({
                data: member.bs,
                categories: 'Blood sugar'
            })
        }
        if (member.whrs.length > 0) {
            result.result.push({
                data: member.whrs,
                categories: 'Waist to hip ratio'
            })
        }
        if (member.ncgs.length > 0) {
            result.result.push({
                data: member.ncgs,
                categories: 'Urinalysis'
            })
        }
        if (member.zytzs.length > 0) {
            result.result.push({
                data: member.zytzs,
                categories: 'Traditional Chinese Medicine Constitution Identification'
            })
        }
        if (member.ecgs.length > 0) {
            result.result.push({
                data: member.ecgs,
                categories: 'ECG analysis'
            })
        }
        if (member.xzsxes.length > 0) {
            result.result.push({
                data: member.xzsxes,
                categories: 'Four items of blood lipids'
            })
        }
        if (member.eyes.length > 0) {
            result.result.push({
                data: member.eyes,
                categories: 'Vision measurement'
            })
        }
        if (member.sds.length > 0) {
            result.result.push({
                data: member.sds,
                categories: 'Psychological Testing SDS'
            })
        }
        if (member.thxhdbs.length > 0) {
            result.result.push({
                data: member.thxhdbs,
                categories: 'Glycated hemoglobin test'
            })
        }
        if (member.feis.length > 0) {
            result.result.push({
                data: member.feis,
                categories: 'Spirometry test'
            })
        }
        if (member.jius.length > 0) {
            result.result.push({
                data: member.jius,
                categories: 'Alcohol content test'
            })
        }
        if (member.gmds.length > 0) {
            result.result.push({
                data: member.gmds,
                categories: 'Bone density'
            })
        }
        if (member.coms.length > 0) {
            result.result.push({
                data: member.coms,
                categories: 'Bone quality is average'
            })
        }

        res.json(result);

    } catch (err) {
        console.error('Error fetching data: ', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.get('/getdoctor', async (req, res) => {
    try {
        const doctors = await Member.findAll({
            where: {
                role: role.Doctor,
                status: 1,
            }, attributes: ['name', 'gender', 'birthday']

        })
        if (!doctors) {
            return res.status(400).json({ message: "No doctor." })
        }
        let avatar = []
        fs.readdirSync("./images").forEach((file) => {
            const filePath = path.join('./images', file);
            if (path.extname(file) === '.png') {
                const data = fs.readFileSync(filePath);
                const base64Image = data.toString('base64');

                avatar.push({ name: file, base64: base64Image });
            }
        });

        for (let d = 0; d < doctors.length; d++) {
            doctors[d].dataValues.avatar = {
                name: avatar[d]?.name,
                base64: avatar[d]?.base64
            }
            doctors[d].dataValues.specialty = {
                name: specialties[d]?.name,
                description: specialties[d]?.description,
            }
        }

        res.status(200).json(doctors)

    } catch (err) {
        console.log(err);
        res.status(500).send("Internet Server Error")
    }
})


//Websocket server ============================================================
var ws_client = [];
//{id, socket, islogin, role, info}
var caseList = [];
//{caseId, status, doctorid, deviceid}
//status 0=waiting, 1=booking, 2=cancel, 
// var server = http.createServer(app);
var server = https.createServer(serverOptions, app);

const wsport = process.env.WS_SERVER_PORT;
const wss = new WebSocket.Server({
    server: server,
    path: `/${process.env.WS_PATH}`,
});

wss.on("connection", function (ws, req) {
    // Extract client's IP and port
    const clientIP = req.socket.remoteAddress;
    const clientPort = req.socket.remotePort;

    // Create a new client object
    const client = {
        id: uuidv4(), // Generate a unique ID based on array length
        socket: ws,
        islogin: false,
        role: role.Unrole,
        machineId: "",
        status: -1,
        caseId: "",
        info: {
            name: '',
            username: ""
        },
        ip: clientIP,
        port: clientPort
    };

    // Add the new client to the array
    ws_client.push(client);

    // Log connection information
    console.log(`> Client connected: IP = ${clientIP}, Port = ${clientPort}`);

    // Handle incoming messages
    ws.on("message", function (message) {
        //console.log(`${client.id} : %s`, message);
        CheckWebsocketCommand(client.id, message);
    });

    // Handle client disconnection
    ws.on("close", function () {
        console.log(`Client disconnected: IP = ${clientIP}, Port = ${clientPort}`);

        // Remove the client from the array when they disconnect
        ws_client = ws_client.filter(c => c.socket !== ws);
    });

    // Send an initial message to the client
    //ws.send(`You are ${clientIP}:${clientPort}`);
    sendMessageToClient(client.id, `You are ${clientIP}:${clientPort}`);
});
function sendMessageToClient(clientId, message) {
    const client = getClientById(clientId);
    if (client && client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(JSON.stringify({ clientId, message }));
    } else {
        console.log(`Client with ID ${clientId} not found or connection not open.`);
    }
}

function getClientById(clientId) {
    const client = ws_client.find((client) => client.id === clientId);

    return client;
}
function getClientByMachineId(machineId) {
    const client = ws_client.find((client) => client.machineId === machineId);

    return client;
}
function getClientByCaseId(caseId) {
    const client = ws_client.find((client) => client.caseId === caseId);

    return client;
}
function getCaseByCaseId(caseId) {
    const client = ws_client.filter((client) => client.caseId === caseId);

    return client;
}


// Start the server on the specified port
server.listen(wsport, function () {
    console.log(`> Websocket on port ${wsport}`);
});


async function CheckWebsocketCommand(clientId, package) {
    //console.log(package.toString());
    let data = isJson(package);
    let client = getClientById(clientId);
    if (data != undefined) {


        //console.log(`${client.id} send cmd:${data.cmd}`);
        //{"cmd":1,"param":{"username":"ham", "password":"123456","machineid":"G240416165614686"}}
        //{"cmd":21,"param":{"caseid":"e20e504b-f169-4b76-b9ef-eec2a73c4acc"}}

        //{"cmd":1,"param":{"username":"ham", "password":"123456","machineid":"G240416165614686"}}
        //{"cmd":1,"param":{"username":"ham", "password":"123456","machineid":"G240416165815216"}}
        //{"cmd":21,"param":{"caseid":"e20e504b-f169-4b76-b9ef-eec2a73c4acc"}}
        //{"cmd":22,"param":{"caseid":"e20e504b-f169-4b76-b9ef-eec2a73c4acc"}}
        if (data.cmd != undefined) {
            if (client.islogin != true) { //Not yet logedin
                if (data.cmd == command.login) {
                    if (data.param != undefined) {
                        // check doctor in database
                        //  create database doctor for patient
                        const doctor = await Member.findOne({
                            where: {
                                username: data.param.username,
                                role: role.Doctor
                            }
                        })
                        if (doctor) {
                            client.islogin = true;
                            client.role = doctor.role;
                            client.info.name = doctor.name
                            client.info.username = doctor.username
                            client.machineId = data.param.machineid;
                            // client.role = data.param.username == "ham" ? role.Doctor : role.Patient;
                            // client.info.name = data.param.username;
                            client.machineId = data.param.machineid;
                            console.log(`${client.role == 2 ? "Doctor" : "Patient"}: ${doctor.name} Authen`);
                            let report = {
                                cmd: command.loginresult,
                                param: {
                                    status: 1, //0=undefined, 1=success, 2=failed
                                    name: doctor.name,
                                    role: doctor.role,
                                    machineId: data.param.machineid,
                                    message: "success"
                                }
                            }
                            client.socket.send(JSON.stringify(report));
                        }
                    } else {
                        let report = {
                            status: 0, //0=undefined, 1=success, 2=failed
                            message: "You don't have permission."
                        }
                        client.socket.send(JSON.stringify(report));
                    }
                } else if (data.cmd == command.machinelogin) {
                    if (data.param != undefined) {
                        const user = data.param.username;
                        const pass = data.param.password;
                        try {
                            const mchn = await Machine.findOne({
                                where: { username: user }
                            });
                            if (mchn) {
                                //console.log('Member found:', member.toJSON());
                                console.log('Machine found:');
                                if (mchn.password == pass) {
                                    console.log('Machine access grant');
                                    client.islogin = true;
                                    client.info.name = mchn.name;
                                    client.machineId = mchn.deviceid;
                                    client.status = -1;
                                    let report = {
                                        cmd: command.loginresult,
                                        param: {
                                            status: 1,
                                            message: 'Login success',
                                            info: {
                                                name: mchn.name,
                                                deviceId: mchn.deviceid
                                            }
                                        }
                                    }
                                    client.socket.send(JSON.stringify(report));
                                }
                                else {
                                    console.log('Machine access denied');
                                    client.islogin = false;
                                    let report = {
                                        cmd: command.loginresult,
                                        param: {
                                            status: 2,
                                            message: 'Machine access denied'
                                        }
                                    }
                                    client.socket.send(JSON.stringify(report));
                                }
                            } else {
                                console.log('Machine not found');
                                client.islogin = false;
                                let report = {
                                    cmd: command.loginresult,
                                    param: {
                                        status: 2,
                                        message: 'Machine not found'
                                    }
                                }
                                client.socket.send(JSON.stringify(report));
                            }
                        } catch (error) {
                            console.error('Error fetching member:', error);
                            client.islogin = false;
                        }
                    }
                } else {
                    let report = {
                        status: 0, //0=undefined, 1=success, 2=failed
                        message: "You don't have permission."
                    }
                    //console.log(report);
                    client.socket.send(JSON.stringify(report));
                }
            }
            else if (client.islogin == true) {
                if (data.param != undefined) {
                    if (data.cmd == command.login || data.cmd == command.machinelogin) {
                        console.log(`${clientId} dupplicate authen.`);
                        let report = {
                            status: 0, //0=undefined, 1=success, 2=failed
                            message: "You are already logedin."
                        }
                        //console.log(report);
                        client.socket.send(JSON.stringify(report));
                    }
                    else if (data.cmd == command.anouncCase) {
                        doctorNotAllow(client);
                        client.caseId = data.param.caseId;
                        console.log(`[${client.info.name}] Want to consult with doctor.(case ${data.param.caseId})`);
                        let c = {//case
                            caseId: data.param.caseId,
                            status: 0,
                            deviceid: client.machineId
                        };
                        client.status = 0;
                        //caseList.push(c);
                        //{caseId, status, doctorid, deviceid}
                        broadcastToDoctor({ caseId: data.param.caseId, iden: data.param.iden });
                    }
                    else if (data.cmd == command.askCaseState) {
                        pateintNotAllow(client);
                        console.log(`Dr.${client.info.name} want to confirm.(case ${data.param.caseId})`);
                        let cc = ws_client.find((c) => c.caseId === data.param.caseId);
                        //console.log(cc);
                        //confirm case
                        if (cc != undefined) {
                            if (cc.status == 0) {
                                cc.status = 1;
                                AcceptCase(client, data.param.caseId);//send to patient
                                let report = {
                                    cmd: command.askCaseState,
                                    param: {
                                        caseId: data.param.caseId,
                                        status: 0, //status 0=waiting, 1=booking, 2=cancel, 
                                        message: `Booking success.`
                                    }

                                }
                                client.caseId = data.param.caseId;
                                //console.log(report);
                                client.socket.send(JSON.stringify(report));
                                let releaseCase = {
                                    cmd: command.releaseCase,
                                    param: {
                                        caseId: data.param.caseId,
                                        message: `This case was booking. (${data.param.caseId})`
                                    }

                                }
                                broadToDoctor(releaseCase);//send to other doctor
                            }
                            else {
                                let report = {
                                    cmd: command.askCaseState,
                                    param: {
                                        caseId: data.param.caseId,
                                        status: cc.status, //status 0=waiting, 1=booking, 2=cancel, 
                                        message: `This case cannot booking.`
                                    }

                                }
                                //console.log(report);
                                client.socket.send(JSON.stringify(report));
                            }
                        }
                        else {
                            let report = {
                                cmd: command.askCaseState,
                                param: {
                                    caseId: data.param.caseId,
                                    status: 3, //status 0=waiting, 1=booking, 2=cancel, 3=no case
                                    message: `This case not found.`
                                }

                            }
                            //console.log(report);
                            client.socket.send(JSON.stringify(report));
                        }
                    }
                    else if (data.cmd == command.allowSensitiveInfo) {
                        doctorNotAllow(client);
                        console.log(`${client.name} allow sensitive`);
                        sendToDoctor(data);//This case's Doctor
                    }
                    else if (data.cmd == command.endCase) {
                        let caseClient = getCaseByCaseId(data.param.caseId);

                        let report = {
                            cmd: command.endCase,
                            param: {
                                caseId: data.param.caseId,
                                message: `This case is ending.`
                            }

                        }
                        caseClient.forEach(cc => {
                            client.caseId = '';
                            //console.log(report);
                            cc.socket.send(JSON.stringify(report));
                        });
                    }
                    else if (data.cmd == command.acceptCase) {
                        pateintNotAllow(client);
                        console.log(`Dr.${client.info.name} Accept.(case ${data.param.caseId})`);
                        AcceptCase(client, data.param.caseId);
                    }
                }

            }
        }
    }
    else {
        let report = {
            message: "Invalid payload"
        }
        //console.log(report);
        client.socket.send(JSON.stringify(report));
    }
}

function AcceptCase(client, caseId) {
    let report = {
        cmd: command.acceptCase,
        param: {
            status: 1, //0=undefined, 1=success, 2=failed
            caseId: caseId,
            message: `Doctor ${client.info.name} accepted your case. (${caseId})`
        }
    }
    let c = getClientByCaseId(caseId);
    if (c != undefined) {
        c.socket.send(JSON.stringify(report));
    }
}
function broadcastToDoctor(_case) {
    let report = {
        cmd: command.anouncCase,
        param: {
            status: 1, //0=undefined, 1=success, 2=failed
            caseId: _case.caseId,
            topic: 'General',
            iden: _case.iden,
            message: `New pateint case. (${_case.caseId})`
        }
    }
    ws_client.forEach(c => {

        if (c.role == role.Doctor) {
            c.socket.send(JSON.stringify(report));
        }
    });

}
function broadToDoctor(_paload) {
    ws_client.forEach(c => {

        if (c.role == role.Doctor) {
            c.socket.send(JSON.stringify(_paload));
        }
    });

}
function sendToDoctor(_paload) {
    if (_paload != undefined) {
        if (_paload.param != undefined) {
            let doc = ws_client.find((client) => (client.caseId === _paload.param.caseId && client.role == role.Doctor));
            if (doc != undefined) {
                doc.socket.send(JSON.stringify(_paload));
                console.log(`send sensitive data to ${doc.info.name}`);
            }
        }

    }


}
function pateintNotAllow(client) {
    if (client.role == role.Patient) {
        let report = {
            status: 0, //0=undefined, 1=success, 2=failed
            message: "You don't have permission to request."
        }
        client.socket.send(JSON.stringify(report));
        return;
    }
}
function doctorNotAllow(client) {
    console.log(client.role)
    if (client.role == role.Doctor) {
        let report = {
            status: 0, //0=undefined, 1=success, 2=failed
            message: "You don't have permission to request."
        }
        client.socket.send(JSON.stringify(report));
        return;
    }
}
//=============================================================================
function isJson(data) {
    try {
        return JSON.parse(data);
    }
    catch (e) {
        return undefined;
    }
}
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;

