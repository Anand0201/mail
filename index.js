import express from "express";
import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import nodemailer from "nodemailer";
import path from "path";
import cors from "cors";
import { fileURLToPath } from 'url';

configDotenv()

// MongoDB Connection
mongoose.connect(process.env.MONGO)
let db = mongoose.connection

db.once('open', () => {
    console.log("Database connected")
})

const schema = mongoose.Schema;

const UserSchema = new schema({
    pickup: { type: String, required: true },
    drop: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    number: { type: String, required: true }
})

const User = mongoose.model("User", UserSchema);

// Route
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs')

const corsOptions = {
    origin: '*',
    methods: 'GET, POST',
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions))

var sendermail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    }
});

app.get('/', (req, res) => {
    res.render('index')
})

app.post('/register', async (req, res) => {
    try {
        // Debugging logs to check if data is received properly
        console.log("Request Body:", req.body);

        if (!req.body.name || !req.body.email) {
            console.log("Missing name or email in request body.");
            return res.status(400).json({ error: "Name and Email are required." });
        }

        const newUser = new User({
            pickup: req.body.pickup,
            drop: req.body.drop,
            date: req.body.date,
            time: req.body.time,
            number: req.body.number
        });

        await newUser.save();

        var mailOptions = {
            from: "pgvaghela07@gmail.com",
            to: "piyushvaghela223@gmail.com",
            subject: 'Welcome to our website',
            text: 'Hello piyush vaghela,\n\n New booking detials is here,' + req.body.pickup + '\n' + req.body.drop + '\n' + req.body.date + '\n' + req.body.time + '\n' + req.body.number + '.'
        };

        sendermail.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return res.status(500).json({ error: "Failed to send email." });
            } else {
                console.log('Email sent: ' + info.response);
                return res.status(200).json({ message: 'Email Sent successfully.' });
            }
        });
    } catch (error) {
        console.error('Internal Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

var PORT = 1000

app.listen(PORT, (err) => {
    if (err) {
        console.log(err)
    }
    console.log('Server is running on port ' + PORT)
})
