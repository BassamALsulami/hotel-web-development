const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const moment = require('moment');
require('dotenv').config();
// the validator 
const { check, validationResult } = require("express-validator");
// let formvalidator = getformvalidation();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json())

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.database_passord,
  database: 'hotel',
  connectionLimit: 10
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

// Handle room booking form submission

app.post('/rooms', [
  check('name').notEmpty().withMessage('Name is required').trim().escape(),
  check('phone').notEmpty().withMessage('Phone number is required'),
  check('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email address').trim().escape(),
  check('roomType').custom((value) => {
    if (!['standard', 'king', 'double', 'small-suite'].includes(value)) {
      throw new Error('Invalid room type');
    }
    return true;
  }),
  check('checkin').notEmpty().withMessage('Check-in date is required'),
  check('checkout').notEmpty().withMessage('Check-out date is required')
],(req, res) => {
  // to check if the form is valid
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send("<h1>Error</h1>" + errors.array()[0].msg);
  }
  const { name, phone ,email, roomType, checkin, checkout } = req.body;
  // Format the checkin date for the SQL query
  const formattedCheckInDate = moment(checkin).format('YYYY-MM-DD ');
  const formattedCheckoutDate = moment(checkout).format('YYYY-MM-DD ');
  // Proceed with database insertion if roomType and checkin are valid
  const sql = 'INSERT INTO booking (name, phone ,email, roomType, checkin, checkout) VALUES (?,?,?, ?, ?,?)';
  connection.query(sql, [name, phone ,email, roomType, formattedCheckInDate, formattedCheckoutDate], (error, results, fields) => {
  if (error) {
  res.status(500).send('Error: ' + error);
  } else {
  res.redirect('/bookAccept.html');
  }
  });
  });

  app.post('/services', [
    check('name').notEmpty().withMessage('Name is required').trim().escape(),
    check('phone').notEmpty().withMessage('Phone number is required'),
    check('serviceType').custom((value) => {
    if (value !== 'Gym' && value !== 'Breakfast' && value !== 'Lunch' && value !== 'Dinner' && value !== 'Wedding hall') {
    throw new Error('Invalid service type');
    }
    return true;
    }),
    check('checkin').notEmpty().withMessage('Check-in date is required')
  ],(req, res) => {
    // to check that the form is valid
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send("<h1>Error</h1>");
    }
    // sending the information 
    const { name, phone , serviceType, checkin} = req.body;
    // Format the checkin date for the SQL query
    const formattedCheckInDate = moment(checkin).format('YYYY-MM-DD ');
    // Proceed with database insertion if roomType and checkin are valid
    const sql = 'INSERT INTO services (name, phone, serviceType, checkin) VALUES (?,?,?,?)';
    connection.query(sql, [name, phone ,serviceType, formattedCheckInDate], (error, results, fields) => {
    if (error) {
    res.status(500).send('Error: ' + error);
    } 
    else {
    res.redirect('/bookAccept.html');
    }
    });
    });

    // Create a transport object using SMTP
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER, // Your Gmail email address
        pass: process.env.SMTP_PASS// Your Gmail account password or app-specific password
      }
    });
    
    
    // Define the email content and recipient
    let mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.SMTP_TO,
      subject: 'New Contact Form Submission',
      text: 'You have a new contact form submission!'
    };
    
    // Send the email when the form is submitted
    app.post('/contact', [
      // validation
      check('firstName').notEmpty().withMessage('First name is required').trim().escape(),
      check('lastName').notEmpty().withMessage('Last name is required').trim().escape(),
      check('phone').notEmpty().withMessage('Phone number is required'),
      check('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email address').trim().escape(),
      check('language').custom((value) => {
        const allowedLanguages = ['Arabic', 'English', 'French']; 
        if (!allowedLanguages.includes(value)) {
          throw new Error('Invalid language');
        }
        return true;
      }),
      check('message').notEmpty().withMessage('Message is required').trim().escape()
    ],(req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send("<h1>you need to fill the form !! </h1>");
      }
      // sending email
      let firstName = req.body.firstName;
      let lastName = req.body.lastName;
      let phone = req.body.phone;
      let email = req.body.email;
      let language = req.body.language;
      let message = req.body.message;
    
      // Update the mailOptions with the form data
      mailOptions.from = email;
      mailOptions.subject = `New Contact Form Submission from ${firstName} ${lastName}`;
      mailOptions.text = `Name: ${firstName} ${lastName}\nPhone: ${phone}\nEmail: ${email}\nLanguage: ${language}\nMessage: ${message}`;
    
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.send('Error'); // Handle the error in the response
        } else {
          console.log('Email sent: ' + info.response);
          res.redirect('/emailSent.html'); // Send a success response
        }
      });
    });

// ... (other routes and code)
const path = require('path');

app.use(express.static(path.join(__dirname, '../')));

// Handle GET request for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});