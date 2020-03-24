const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express()
const secretKey = 'thisisverysecretkey'
const port = 1337;

// DB

const db = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: 'obat'
})

db.connect((err) => {
    if (err) throw err
    console.log('Database Connected!')
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

const isAuthorized = (request, result, next) => {
    if (typeof(request.headers['auth-token']) == 'undefined') {
        return result.status(403).json({
            success: false,
            message: 'Unauthorized. Token is not provided'
        })
    }

    let token = request.headers['auth-token']

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return result.status(401).json({
                success: false,
                message: 'Unauthorized. Token is invalid'
            })
        }
    })

    next()
}

app.post('/login', function(request, result) {
  let data = request.body
  var username = data.username;
	var password = data.password;
	if (username && password) {
		db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
        let token = jwt.sign(data.username + '|' +data.password, secretKey)
        result.json({
          success: true,
          message: 'Logged In',
          token: token
        });
			} else {
				result.json({
          success: false,
          message: 'Invalid Credential!',
        });
			}
			result.end();
		});
	}
});

app.post('/register', (request, result) => {
    let data = request.body

    let sql = `
        insert into users (username, password)
        values ('`+data.username+`', '`+data.password+`');
    `

    db.query(sql, (err, result) => {
        if (err) throw err
    })

    result.json({
        success: true,
        message: 'Your Account Succesfully Registered!'
    })
})

// USERS
app.get('/users', isAuthorized, (req, res) => {
    let sql = `select id, username, created_at from users`
  
    db.query(sql, (err, result) => {
      if (err) throw err
  
      res.json({
        message: "Success Getting All User",
        data:result
      })
    })
  })
  
  app.post('/users', isAuthorized, (req, res) => {
    let data = req.body
  
    let sql = `insert into users (username, password)
    values ('`+data.username+`', '`+data.password+`')
    `
  
    db.query(sql, (err, result) => {
      if (err) throw err
  
      res.json({
        message: "User Added",
        data: result
      })
    })
  })
  
  app.get('/users/:id', isAuthorized, (req, res) => {
    let sql = `select * from users
    where id = `+req.params.id+`
    limit 1`
  
    db.query(sql, (err, result) => {
      if (err) throw err
  
      res.json({
        message: "Success Getting All User Details",
        data: result[0]
      })
    })
  })
  
  app.put('/users/:id', isAuthorized, (req, res) => {
    let data = req.body
  
    let sql = `
    update users
    set username = '`+data.username+`',
    password = '`+data.password+`'
    where id = '`+req.params.id+`'`
  
    db.query(sql, (err, result) => {
      if (err) throw err
  
      res.json({
        message: "Data Has Been Updated",
        data : result
      })
    })
  })
  
  app.delete('/users/:id', isAuthorized, (req, res) => {
      let sql = `
          delete from users
          where id = '`+req.params.id+`'
      `
  
      db.query(sql, (err, result) => {
          if (err) throw err
  
          res.json({
              message: "Data Has Been Deleted",
              data: result
          })
      })
  })
  