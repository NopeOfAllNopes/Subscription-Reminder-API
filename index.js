
import express from 'express';
import sqlite3 from 'sqlite3';
import emailjs from '@emailjs/browser'
import 'dotenv/config';
//import { fetchAll } from './sql.js';

const db = new sqlite3.Database('reminders.db');

const PORT = 5000;

const app = express();
app.use(express.json());

const currentReminders = [];

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});

const execSQL = async(cdb, sql) => {
    return new Promise((resolve, reject) => {
        cdb.exec(sql, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}

let sqlSchema = `
    CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY ASC, 
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    service VARCHAR(255) NOT NULL,
    billDate INTEGER NOT NULL,
    remindDate INTEGER NOT NULL)`;

db.exec(sqlSchema);

emailjs.init({
    publicKey: process.env.PUBLIC_KEY,
    blockHeadless: true,
    limitRate: {
      id: 'app',
      throttle: 10000,
    },
});

app.post('/createReminder', async(req, res) => {
    console.log('Creating reminder.');
    let sql = `
    INSERT INTO reminders (
    email, 
    name, 
    service, 
    billDate, 
    remindDate
    ) VALUES (
    '${req.body.email}', 
    '${req.body.name}', 
    '${req.body.service}', 
    '${req.body.billDate}', 
    ${req.body.remindPeriod});`;

    try {
        await execSQL(db,sql);
    } catch(error) {
        console.log(error);
        res.sendStatus(404);
    }
    res.sendStatus(200);
});

app.get('/getReminder', async(req, res) => {
    console.log('Getting reminder.');

    let sql = `
        SELECT * FROM reminders;
        `;
    const entries = db.all(sql);

    console.log(entries);
    res.sendStatus(200);
});

app.put('/updateReminder', async(req, res) => {
    console.log('Updating reminder.');
    res.sendStatus(200);
});

app.delete('/deleteReminder', async(req, res) => {
    console.log('Deleting reminder.');
    let idDelete = null
    db.get(`
        SELECT id FROM reminders
        WHERE email = ${req.body.email}
        AND service = ${req.body.service};
        `, (error, reminder) => {
            console.log(`Getting ID: ${reminder.id}`)
            idDelete = reminder.id;
        });
    console.log(`ID to delete: ${idDelete}`);
    let sql = `DELETE FROM reminders WHERE id = ${idDelete};`;

    db.run(sql)
});

function scheduelCheck() {
    let prevDay = -1;
    let checkInterval = 1000;
    const time = new Date();

    let timeOffset = time.getHours();
    timeOffset *= 60;
    timeOffset += time.getMinutes();
    timeOffset *= 60
    timeOffset += time.getSeconds();
    timeOffset *= 1000
    timeOffset += time.getMilliseconds();
    timeOffset = (24 * 3600000) - timeOffset;
    console.log(timeOffset);
    checkInterval = timeOffset;

    let timer = setInterval(function () {
        //console.log(time.getHours())
        if(time.getDay() != prevDay){
            prevDay = time.getDay();
            console.log(`New day, get reminders for today.`);
            /*
            db.each(`
                SELECT id, email, service FROM reminders
                WHERE billDate = ${}
                AND remindPeriod = ${};
                `);
            */
        }
    }, checkInterval);
}


scheduelCheck();
async function sendTestMail(){
    let date = new Date();
    let checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDay())
    console.log(`Running date check: ${checkDate}`);
    /*
    db.each(`
        SELECT name, email FROM reminders
        WHERE remindDate = ${};
        `, (error, reminder) => {
            var data = {
                name: reminder.name,
                email: reminder.email,
                service: reminder.service,
                billDate: reminder.billDate,
            };
            emailjs.send('default_service', 'template_nnkkd37');
        });
    */
}
sendTestMail();


let email = 'dillon.stickler@gmail.com';
let name = 'test guy';
let service = 'some service';
let billDate = '10-08-2021';
let remindPeriod = 3;

const newReminder = { 
    email, 
    name, 
    service, 
    billDate,
    remindPeriod
};

let testAddFetch = async () => {
    console.log(`Running testAddFetch.`);
    const response = await fetch('http://localhost:5000/createReminder', {
        method: 'post',
        body: JSON.stringify(newReminder),
        headers: {
            'Content-Type': 'application/json',
        }
    });
    if(response.status === 200){
        console.log(`Reminder was successfully added.`);
    } else {
        console.log(`Something happened when adding the reminder, try again and check values: ${response.status}`);
    }
};

let testGetFetch = async () => {
    console.log(`Running testGetFetch.`);
    const response = await fetch('http://localhost:5000/getReminder');
    if(response.status === 200){
        console.log(`Reminder was successfully got.`);
    } else {
        console.log(`Something happened when getting the reminder, try again and check values: ${response.status}`);
    }
};    

email = 'test.email@gmail.com';
service = 'some service';
let removeReminder = {email, service};

let testDeleteFetch = async () => {
    console.log(`Running testDeleteFetch.`);
    const response = await fetch('http://localhost:5000/deleteReminder', {
        method: 'post',
        body: JSON.stringify(removeReminder),
        headers: {
            'Content-Type': 'application/json',
        }
    });
    if(response.status === 200){
        console.log(`Reminder was successfully got.`);
    } else {
        console.log(`Something happened when deleting the reminder, try again and check values: ${response.status}`);
    }
};

//testAddFetch();

setTimeout(function () {
    testGetFetch();
    testDeleteFetch();
}, 1000)
