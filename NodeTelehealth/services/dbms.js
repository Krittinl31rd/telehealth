/*var host = "";
var user = "";
var password = "";
var database = "";*/
var type = "";//mysql, mssql
var con = null;

function DB_INITIAL() {
    type = process.env.DB_Type;
    /*host = process.env.DB_HOST;
    user = process.env.DB_USER;
    password = process.env.DB_PASSWORD;
    database = process.env.DB_DATABASE;*/

    if (type == 'mysql') {
        var mysql = require('mysql2');
        con = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });
        console.log(`\n> host:${process.env.DB_HOST}, \n> user:${process.env.DB_USER}, \n> pass:${process.env.DB_PASSWORD}, \n> db:${process.env.DB_DATABASE}`);
        con.connect(function (err) {
            if (err) return { status: 0, error: err };
            console.log("> Database Connected!");
            /*let id = 1;
            con.query(
                'SELECT * FROM `member` WHERE `id` = ?',
                [id],
                function (err, results) {
                    console.log(results[0].name);
                    console.log(results[0].iden);
                    console.log(results[0].gender == 1?"Male":"Female");

                    let queryDate = new Date(results[0].birthday); // Assume UTC
                    // Adjust manually by calculating the time zone offset in milliseconds
                    const timeZoneOffset = 7 * 60 * 60 * 1000; // UTC+7 offset
                    const localQueryDate = new Date(queryDate.getTime() + timeZoneOffset);
                    // Get the adjusted date part (YYYY-MM-DD)
                    const localQueryDateString = localQueryDate.toISOString().split('T')[0];
                    console.log(localQueryDateString); // "1996-10-22" if adjusted correctly

                    console.log(results[0].email);
                    console.log(results[0].phone);
                    console.log(results[0].status==1?"Active":"Inactive");
                }
            );*/
        });
    }
    else if (type == 'mssql') {

    }
}

function dblog(_text) {
    console.log(_text)
    /*console.log(results[0].name);
    console.log(results[0].iden);
    console.log(results[0].gender == 1 ? "Male" : "Female");

    let queryDate = new Date(results[0].birthday); // Assume UTC
    // Adjust manually by calculating the time zone offset in milliseconds
    const timeZoneOffset = 7 * 60 * 60 * 1000; // UTC+7 offset
    const localQueryDate = new Date(queryDate.getTime() + timeZoneOffset);
    // Get the adjusted date part (YYYY-MM-DD)
    const localQueryDateString = localQueryDate.toISOString().split('T')[0];
    console.log(localQueryDateString); // "1996-10-22" if adjusted correctly

    console.log(results[0].email);
    console.log(results[0].phone);
    console.log(results[0].status == 1 ? "Active" : "Inactive");*/
}

function DB_SEL(_sql, callback) {
    console.log(_sql);
    con.query(_sql, function (err, results) {
        if (err) {
            console.log(`DB_SEL.Error ${err}`);
            return callback({ status: 0, result: undefined, error: err });
        }
        callback({ status: 1, result: results });
    });
}

function DB_SELP(_sql, _params, callback) {
    console.log(_sql);
    con.query(_sql, _params, function (err, results) {
        if (err) {
            console.log(`DB_SELP.Error ${err}`);
            return callback({ status: 0, result: undefined, error: err });
        }
        callback({ status: 1, result: results });
    });
}

function DB_EXC(_sql, callback){
    console.log(_sql);
    con.query(_sql, function (err, results) {
        if (err) {
            console.log(`DB_EXC.Error ${err}`);
            return callback({ status: 0, result: undefined, error: err });
        }
        callback({ status: 1, result: results });
    });
}
function DB_EXCP(_sql, _params, callback){
    console.log(_sql);
    con.query(_sql, _params, function (err, results) {
        if (err) {
            console.log(`DB_EXC.Error ${err}`);
            return callback({ status: 0, result: undefined, error: err });
        }
        callback({ status: 1, result: results });
    });
}
/*
function DB_Select(_sql) {
    console.log(_sql);
    return new Promise((resolve, reject) => {
        con.query(_sql, function (err, results) {
            if (err) {
                console.log(`DB_Select.Error ${err}`);
                return reject({ status: 0, result: undefined, error: err });
            }
            resolve({ status: 1, result: results });
        });
    });
}

function DB_SelectParam(_sql, _params) {
    console.log(_sql);
    return new Promise((resolve, reject) => {
        con.query(_sql, _params, function (err, results) {
            if (err) {
                console.log(`DB_Select.Error ${err}`);
                return reject({ status: 0, result: undefined, error: err });
            }
            resolve({ status: 1, result: results });
        });
    });
}

// Usage example:
DB_Select("SELECT * FROM `member`")
    .then(response => console.log(response))
    .catch(error => console.log(error));
*/

module.exports = { DB_INITIAL, DB_SEL, DB_SELP, DB_EXC, DB_EXCP };