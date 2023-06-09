const AppError = require("../utils/appError");
const conn = require("../services/db");

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
/*
const { signupValidation, loginValidation } = require('./validation');
const { validationResult } = require('express-validator');
*/

exports.registerUser = (req, res, next) => {
 conn.query(`SELECT * FROM users WHERE LOWER(email) = LOWER(?);`, [conn.escape(req.body.email)], (err, result) => {
    if (result.length) {
      return res.status(409).send({
      msg: 'This user is already existing'
      });
    } 
    else {
      // username is available
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return res.status(500).send({
            msg: err
          });
        } 
        else {
        // has hashed pw => add to database
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
};

exports.loginUser = (req, res, next) => {
  conn.query(`SELECT * FROM users WHERE email = ${conn.escape(req.body.email)};`, (err, result) => {
  // user does not exists
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
        const token = jwt.sign({id:result[0].id},'the-super-strong-secrect',{ expiresIn: '1h' });
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
    const decoded = jwt.verify(theToken, 'the-super-strong-secrect');
    conn.query('SELECT * FROM users where id=?', decoded.id, function (error, results, fields) {
    if (error) throw error;
    return res.send({ data: results[0], message: 'Fetch Successfully.' });
  });
}
