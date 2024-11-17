const express = require("express");
const bcrypt = require("bcryptjs");
const speakeasy = require("speakeasy");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const nodemailer = require("nodemailer");
const QRCode = require("qrcode");
const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require("mongoose");
const path = require("path");

const User = require("./models/User");
const PortfolioItem = require("./models/PortfolioItem");

const app = express();


const uri = "mongodb+srv://userTD:kulan1305@monogclus.o7wmm.mongodb.net/portfolioPlatform?retryWrites=true&w=majority&appName=monogClus";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: 'k.ulan7073@gmail.com', 
    pass: 'mrulkaais200606' 
  }
});

async function connectMongoDB() {
  try {
    await client.connect();
    console.log("MongoDB connection established successfully!");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

connectMongoDB();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());


app.use(express.static(path.join(__dirname, 'public'))); 


app.post("/register", async (req, res) => {
  const { id, password, email, name } = req.body;

  try {
    const existingUser = await client.db("portfolioPlatform").collection("users").findOne({ id });
    if (existingUser) {
      return res.json({ success: false, error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id, password: hashedPassword, email, name, portfolioItems: [] };

    await client.db("portfolioPlatform").collection("users").insertOne(newUser);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }

  const mailOptions = {
    from: 'k.ulan7073@gmail.com', 
    to: email,                   
    subject: 'Welcome to Our Service', 
    text: `Hello ${id},\n\nThank you for registering with us! We're excited to have you on board.\n\nBest regards,\nYour Company` // Plain text body
  };

  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ success: false, message: 'Error sending email', error });
    }
    console.log('Email sent: ' + info.response);
    res.status(200).json({ success: true, message: 'Registration successful, confirmation email sent!' });
  });
});


app.post('/api/login', async (req, res) => {
  try {
    const { id, password, code } = req.body;

    
    const user = await User.findOne({ id: id });

    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    
    if (user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid password' });
    }

    
    if (user.twoFACode && code !== user.twoFACode) {
      return res.status(401).json({ success: false, error: 'Invalid 2FA code' });
    }

    
    req.session.userId = user.id; 

    
    return res.json({
      success: true,
      codeRequested: user.twoFACode ? true : false,
    });
  } catch (err) {
    console.error('Error during login:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


app.get("/qrImage", (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, error: "Not logged in" });

  const secret = speakeasy.generateSecret();
  user.twoFASecret = secret.base32;
  user.save();

  QRCode.toDataURL(secret.otpauth_url, (err, imageUrl) => {
    if (err) return res.status(500).json({ success: false, error: "Error generating QR code" });
    res.json({ success: true, image: imageUrl });
  });
});

app.get('/check', (req, res) => {
  if (req.session && req.session.userId) { 
    res.json({ success: true, id: req.session.userId });
  } else {
    res.json({ success: false });
  }
});


app.get("/dashboard", (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/login");
  res.send("Welcome to your Dashboard, " + req.user.name);
});


app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); 
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html')); 
});


app.get("/portfolio", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ success: false, error: "Not logged in" });

  const items = await PortfolioItem.find({ userId: req.user.id });
  res.json({ success: true, items });
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ success: false, error: "Error logging out" });
    res.json({ success: true });
  });
});


const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
