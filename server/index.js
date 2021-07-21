const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const jwt = require("jsonwebtoken");

app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true }));

app.use(
    session({
        key: "userID",
        secret: "sample1*_",
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 60 * 60 * 24
        }

    })
)

app.use(express.json());

const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "*****",
    database: "loginsystem"

})

app.post("/register", (req, res) => {
    
    const username = req.body.username
    const password = req.body.password

    bcrypt.hash(password, saltRounds, (err, hash) => {
        
        if (err){
            console.log(err)
        }

        db.query(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hash],
        (err, result) => {
            if (err) {
                console.log(err);
            }
              else {
                  res.send("Password inserted");
              }
                
            }
    );

    })

});

const verifyJWT = (req, res, next) => {
    const token = req.headers["x-access-token"]

    if (!token) {
        res.send("You have no token, Login to get token");
    } else {
        jwt.verify(token, "sample2*_", (err, decoded) => {
            if (err) {
                res.json({ auth: false, message: "Wrong json web token"});
            } else {
                req.userId = decoded.id;
                next();
            }
        } )
    }
}

app.get("/isUserAuth", verifyJWT, (req, res) => {
    res.send("You are authenticated")
})

app.get("/login", (req, res) => {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user});
    } else {
        res.send({ loggedIn: false});
    }
});

app.post("/login", (req, res) => {
    
    const username = req.body.username
    const password = req.body.password
    
    db.query(
        "SELECT * FROM users WHERE username = ? ",
        username,
        (err, result) => {
            if (err) {
                res.send({err:err});
            }
             
              if (result.length > 0) {
                bcrypt.compare(password, result[0].password, (error, response) => {
                    if (response) {
                                                
                        const id = result[0].id;
                        const token = jwt.sign({ id }, "sample2*_", {
                            expiresIn: 300
                        });
                        req.session.user = result;

                        res.json({ auth: true, token: token, result: result });
                        
                    } else {
                  res.json({
                    auth: false,  
                    message: "Wrong username and/or password"
                });
              }
                })
              } else {
                  res.json({auth: false, message: "User doesn't exist"});
              }
                
            }
    );
});

app.listen(3002, () => {
    console.log("Server received your request, everything is OK!")
});
