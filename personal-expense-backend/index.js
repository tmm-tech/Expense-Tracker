const express = require('express');
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
// const cloudinary = require('cloudinary').v2;
// const UserRoutes = require('./routes/UserRoutes');
// const ImageRoutes = require('./routes/ImageRoutes');
// const ProgramRoutes = require('./routes/ProgramRoutes');
// const NewsRoutes = require('./routes/NewsRoutes');
// const NotificationRoutes = require('./routes/NotificationRoutes'); 


const app = express(); 



// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware to add token to the request
const addTokenToRequest = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7); // Remove 'Bearer ' from the beginning
        try {
            const decodedToken = await jwt.verify(token, process.env.SECRET);
            req.token = decodedToken;
        } catch (error) {
            return res.status(401).json({ error: 'Invalid token.' });
        }
    }
    next();
};

app.use(addTokenToRequest);

// // Route handling
// app.use('/users', UserRoutes);
// app.use('/images', ImageRoutes);
// app.use('/programs', ProgramRoutes);
// app.use('/notifications', NotificationRoutes);
// app.use('/news', NewsRoutes);
app.get('/', (req, res) => {
    res.json({ message: "Confirmed Connection to KETRB CMS" });
});


// Server setup
const port = process.env.PORT || 4080;
app.listen(port, () => {
    console.log(`Authentication Server Listening on port: ${port}`);
});
