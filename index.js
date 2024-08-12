import express from "express";
import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from 'url';

configDotenv()

// MongoDB Connection
mongoose.connect(process.env.MONGO)
let db = mongoose.connection

db.once('open',() =>{
    console.log("Database connected")
})

const schema = mongoose.Schema;

const user = new schema({
    name: {type: String},
    email: {type: String}
})

const userSchema = mongoose.model("User", user);

// Route
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());    
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs')

var sendermail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    }
});

app.get('/',(req, res) => {
    res.render('index')
})

app.post('/register',(req,res) => {

    try {
        const user = new userSchema({
            name: req.body.name,
            email: req.body.email
        })
        user.save()

        var mailOptions = {
            from: process.env.EMAIL,
            to: req.body.email,
            subject: 'Welcome to our website',
            text: 'Hello ' + req.body.name + ',\n\nWelcome to our website. We are glad to have you on board.'
        }

        sendermail.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
        });

        res.render('index')
    } catch {
        console.log('Internal Error');
    }
})

var PORT = 1000

app.listen(PORT, (err) => {
    if(err){
        console.log(err)
    } 
    console.log('Server is running on port ' + PORT)
})