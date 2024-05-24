const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads/certificates', express.static(path.join(__dirname, 'uploads/certificates')));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// File storage configuration for uploaded certificates
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/certificates/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Load data
let data = {
    certificates: [],
    users: [],
    admin: {
        username: 'admin',
        password: 'admin'
    },
    additionalAdmins: [
        { username: "Titiksha Tijare", password: "Titiksha" },
        { username: "Palak Bhimke", password: "Palak" },
        { username: "Shivanjali Lokhande", password: "Shivanjali" },
        { username: "Ojashree Raut", password: "Ojashree" },
        { username: "Shreya Bommarapu", password: "Shreya" },
        { username: "Shweta Bhelonde", password: "Shweta" },
        { username: "Pooja Bhole", password: "Pooja" }
    ]
};

// Helper function to save data to JSON file
function saveData() {
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
}

// Load data from JSON file if it exists
if (fs.existsSync('data.json')) {
    data = JSON.parse(fs.readFileSync('data.json'));
}

// Routes

// User registration
app.post('/user/register', (req, res) => {
    const { username, password } = req.body;
    const existingUser = data.users.find(user => user.username === username);
    if (existingUser) {
        res.redirect('/user_register.html?error=username_taken');
        return;
    }
    data.users.push({ username, password });
    saveData();
    res.redirect('/user_login.html');
});

// User login route
app.post('/user/login', (req, res) => {
    const { username, password } = req.body;
    const user = data.users.find(user => user.username === username && user.password === password);
    if (user) {
        req.session.user = username;
        res.redirect('/user_dashboard.html');
    } else {
        res.redirect('/user_login.html?error=invalid_credentials');
    }
});

// Define a route handler for /event
app.get('/event', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'event.html'));
});

// Modify your existing route to serve user-uploaded certificates
app.get('/certificates', (req, res) => {
    res.json({ certificates: data.certificates });
});

// Admin login
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (
        (username === data.admin.username && password === data.admin.password) ||
        data.additionalAdmins.some(admin => admin.username === username && admin.password === password)
    ) {
        req.session.admin = true;
        res.redirect('/admin/dashboard');
    } else {
        res.redirect('/admin_login.html?error=invalid_credentials');
    }
});

// Middleware to check if the user is an admin
function isAdmin(req, res, next) {
    if (req.session.admin) {
        next();
    } else {
        res.redirect('/admin_login.html');
    }
}

// Admin dashboard route
app.get('/admin/dashboard', isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin_dashboard.html'));
});

// Serve admin style.css
app.get('/admin/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'style.css'));
});

// Serve admin admin_script.js
app.get('/admin/admin_script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'admin_script.js'));
});

// Get certificates for admin dashboard
app.get('/admin/certificates', isAdmin, (req, res) => {
    res.json({ certificates: data.certificates });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Approve certificate route
app.post('/admin/certificates/approve/:certificateId', isAdmin, (req, res) => {
    const certificateId = req.params.certificateId;
    const certificate = data.certificates.find(certificate => certificate.id === certificateId);
    if (certificate) {
        certificate.status = 'approved';
        saveData();
        res.redirect('/admin/dashboard');
    } else {
        res.status(404).send('Certificate not found');
    }
});

// Reject certificate route
app.post('/admin/certificates/reject/:certificateId', isAdmin, (req, res) => {
    const certificateId = req.params.certificateId;
    const certificate = data.certificates.find(certificate => certificate.id === certificateId);
    if (certificate) {
        certificate.status = 'rejected';
        saveData();
        res.redirect('/admin/dashboard');
    } else {
        res.status(404).send('Certificate not found');
    }
});

// Certificate upload route
app.post('/upload', upload.single('certificate'), (req, res) => {
    const { category, type } = req.body;
    const username = req.session.user; // Use the username from the session
    const certificate = {
        id: Date.now().toString(),
        user: username, // Make sure this field contains the user's name
        category,
        type,
        file: req.file.filename,
        status: 'pending'
    };
    console.log('Uploading certificate for user:', username);
    data.certificates.push(certificate);
    saveData();
    res.redirect('/user_dashboard.html');
});

// Add a route to serve view-certificates.html
app.get('/view-certificates', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'view-certificates.html'));
});

// Route to fetch approved certificates
app.get('/approved-certificates', (req, res) => {
    const { category, type } = req.query;
    let approvedCertificates = data.certificates.filter(certificate => certificate.status === 'approved');

    if (category) {
        approvedCertificates = approvedCertificates.filter(certificate => certificate.category === category);
    }
    if (type) {
        approvedCertificates = approvedCertificates.filter(certificate => certificate.type === type);
    }

    res.json({ certificates: approvedCertificates });
});

// Reject certificate route (revised)
app.post('/admin/certificates/reject/:certificateId', isAdmin, (req, res) => {
    const certificateId = req.params.certificateId;
    const certificateIndex = data.certificates.findIndex(certificate => certificate.id === certificateId);
    if (certificateIndex !== -1) {
        // Remove the certificate from the data array
        data.certificates.splice(certificateIndex, 1);
        saveData();
        res.sendStatus(200);
    } else {
        res.status(404).send('Certificate not found');
    }
});
