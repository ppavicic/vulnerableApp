const express = require('express');
const pg = require('pg')
const { auth, requiresAuth } = require('express-openid-connect');
const db = require('./db')
const csrf = require('csurf')
const cookieParser = require('cookie-parser')

const app = express();

const csrfMiddleware = csrf({
    cookie: {key: "__session", httpOnly: true}
});

const dotenv = require('dotenv');
dotenv.config();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('view engine', 'ejs')

const port = process.env.PORT || 3000;

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SECRET,
    baseURL: process.env.APP_URL || `http://localhost:${port}`,
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: 'https://dev-q02guoproqbw6f6h.us.auth0.com',
    clientSecret: process.env.CLIENT_SECRET,
    authorizationParams: {
        response_type: 'code',
        //scope: "openid profile email"   
    }
};

app.use(auth(config));

app.get('/', function (req, res) {
    res.render('index')
});

app.get('/sqlomogucenaranjivost', function (req, res) {
    res.render('sqlinjection', {
        podaci: undefined
    })
});

app.post('/sqlomogucenaranjivost', async function (req, res) {
    podaci = await retrieveData(req.body.username)
    console.log(podaci)
    res.render('sqlinjection', {
        podaci: podaci
    })
})

app.get('/sqlonemogucenaranjivost', function (req, res) {
    res.render('sqlNOinjection', {
        podaci: undefined
    })
});

app.post('/sqlonemogucenaranjivost', async function (req, res) {
    let podaci = undefined
    let username = req.body.username
    if (typeof username == "string") {
        usernameArray = req.body.username.split(" ")
        if (usernameArray.length === 1)
            if (usernameArray[0].length >= 1 && usernameArray[0].length <= 100 && !usernameArray[0].toLowerCase().includes('or')
                && !usernameArray[0].toLowerCase().includes('union') && !usernameArray[0].toLowerCase().includes('order'))
                podaci = await retrieveData(usernameArray[0])
    }
    res.render('sqlNOinjection', {
        podaci: podaci
    })
});

app.get('/csrfvulnera', requiresAuth(), function (req, res) {
    res.render('csrfvulnera', {
        data: undefined
    })
});

app.get('/csrfnonvulnera', requiresAuth(), function (req, res) {
    res.render('csrfnonvulnera', {
        data: undefined,
        csrfToken: req.csrfToken()
    })
});

app.post('/csrfvulnera/changePassword', requiresAuth(), function (req, res) {
    result = undefined
    if(req.body.passwd1 === req.body.passwd2){
        result = "Nova lozinka je "+ req.body.passwd1
    }else{
        result = "Neuspjesna promjena"
    }

    res.render('csrfvulnera', {
        data: result
    })
    
});

retrieveData = async (username) => {
    const sql = `SELECT username, password, first_name, last_name 
                 FROM users 
                 WHERE username = '` + username + `'`
    
    try {
        const result = await db.query(sql, []);
        return result.rows
    } catch (err) {
        console.log(err);
        return undefined
    }
}

if (process.env.PORT) {
    app.listen(port, function () {
        console.log(`Server running at ${process.env.APP_URL}`);
    })
} else {
    app.listen(port, (error) => {
        if (!error)
            console.log("Server is Successfully Running, and App is listening on port " + port)
        else
            console.log("Error occurred, server can't start", error);
    });
}