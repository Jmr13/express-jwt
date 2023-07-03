const AppError = require("../utils/appError");
const conn = require("../services/db");

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { validationResult } = require('express-validator');

exports.registerUser = (req, res, next) => {
  // Check for validation error
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  else {
    conn.query(`SELECT * FROM users WHERE LOWER(email) = LOWER(?);`, [conn.escape(req.body.email)], (err, result) => {
      if (result.length) {
        return res.status(409).send({
        msg: 'This user is already existing'
        });
      } 
      else {
        // Encrypt password
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).send({
              msg: err
            });
          } 
          else {
            // If password is encrypted, add to db
            conn.query(`INSERT INTO users (name, email, password , last_login) VALUES ('${req.body.name}', ${conn.escape(req.body.email)}, ${conn.escape(hash)} , null)`, (err, result) => {
              if (err) {
                throw err;
                return res.status(400).send({msg: err});
              }
              return res.status(201).send({
                msg: 'This user is finally registered'
              });
            });
          } 
        });
      }
    });
  }
};

exports.loginUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  else {
    conn.query(`SELECT * FROM users WHERE email = ${conn.escape(req.body.email)};`, (err, result) => {
    // User does not exist
    if (err) {
      throw err;
      return res.status(400).send({
        msg: err
      });
    }
    if (!result.length) {
      return res.status(401).send({
        msg: 'Email or password is incorrect!'
      });
    }
    // check password
    bcrypt.compare(req.body.password, result[0]['password'], (bErr, bResult) => {
    // wrong password
        if (bErr) {
          throw bErr;
          return res.status(401).send({
            msg: 'Email or password is incorrect!'
          });
        }
        if (bResult) {
          const token = jwt.sign({id:result[0].id}, process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '1h' });
          conn.query(`UPDATE users SET last_login = now() WHERE id = '${result[0].id}'`);
          return res.status(200).send({
            msg: 'Logged in!',
            token,
            user: result[0]
          });
        }
        return res.status(401).send({
          msg: 'Username or password is incorrect!'
        });
      });
    });
  }
}

exports.getUser = (req, res, next) => {
  if(
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer') ||
    !req.headers.authorization.split(' ')[1]
  ){
    return res.status(422).json({
      message: "Please provide the token",
    });
  }
    const theToken = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(theToken, process.env.ACCESS_TOKEN_SECRET);
    conn.query('SELECT * FROM users where id=?', decoded.id, function (error, results, fields) {
    if (error) throw error;
    return res.send({ data: results[0], message: 'Fetch Successfully.' });
  });
}
