const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Sequelize = require("sequelize");
const { sequelize, User } = require("../models/db");

// Sign in
const signIn = (req, res) => {
  // Check if all the required fields are filled
  if (!req.body.email) {
    res.status(400).json({ message: "Prosimo, da izpolniš vsa polja." });
  } else if (!req.body.password) {
    res.status(400).json({ message: "Prosimo, da izpolniš vsa polja." });
  } else {
    User.findOne({ where: { email: req.body.email } })
      .then((user) => {
        if (user) {
          bcrypt.compare(req.body.password, user.password, (error, result) => {
            if (result) {
              return res.status(200).json({ jwt: generateJWT(user) });
            } else {
              return res.status(401).json({
                message: "Neveljavna elektronska pošta ali geslo. Prosimo, poskusi znova.",
              });
            }
          });
        } else {
          return res.status(401).json({
            message: "Neveljavna elektronska pošta ali geslo. Prosimo, poskusi znova.",
          });
        }
      })
      .catch((error) => {
        return res.status(500).json({
          message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
        });
      });
  }
};

// Sign up
const signUp = (req, res) => {
  // Check if all the required fields are filled
  if (!req.body.firstName) {
    res.status(400).json({ message: "Prosimo, da izpolniš vsa polja." });
  } else if (!req.body.lastName) {
    res.status(400).json({ message: "Prosimo, da izpolniš vsa polja." });
  } else if (!req.body.email) {
    res.status(400).json({ message: "Prosimo, da izpolniš vsa polja." });
  } else if (!req.body.phone) {
    res.status(400).json({ message: "Prosimo, da izpolniš vsa polja." });
  } else if (!req.body.password) {
    res.status(400).json({ message: "Prosimo, da izpolniš vsa polja." });
  } else {
    // Check if user with this email already exists
    User.findAll({ where: { email: req.body.email } })
      .then((users) => {
        if (users.length === 0) {
          bcrypt.hash(req.body.password, 10, (error, hash) => {
            if (!error) {
              User.create({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phone: req.body.phone,
                password: hash,
              })
                .then((user) => {
                  return res.status(201).json({ jwt: generateJWT(user) });
                })
                .catch((error) => {
                  return res.status(500).json({
                    message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
                  });
                });
            } else {
              return res.status(500).json({
                message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
              });
            }
          });
        } else {
          return res.status(409).json({
            message: "Uporabnik s to elektronsko pošto že obstaja.",
          });
        }
      })
      .catch((error) => {
        return res.status(500).json({
          message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
        });
      });
  }
};

// Return information about the authorised user
const getUser = (req, res) => {
  User.findOne({ attributes: ["firstName", "lastName", "email", "phone", "image"], where: { id: req.auth.id } })
    .then((user) => {
      if (user) {
        return res.status(200).json(user);
      } else {
        return res.status(404).json({
          message: "Uporabnik s tem enoličnim identifikatorjem ne obstaja.",
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
      });
    });
};

// Update the authorised user
const updateUser = (req, res) => {
  // Check if all the required fields are filled
  if (!req.body.firstName) {
    res.status(400).json({ message: "Prosimo, da izpolniš vsa polja." });
  } else if (!req.body.lastName) {
    res.status(400).json({ message: "Prosimo, da izpolniš vsa polja." });
  } else if (!req.body.phone) {
    res.status(400).json({ message: "Prosimo, da izpolniš vsa polja." });
  } else if (!req.body.password) {
    res.status(400).json({ message: "Prosimo, da izpolniš vsa polja." });
  } else {
    User.findOne({ where: { id: req.auth.id } })
      .then((user) => {
        if (user) {
          bcrypt.hash(req.body.password, 10, (error, hash) => {
            if (!error) {
              user
                .update({
                  firstName: req.body.firstName,
                  lastName: req.body.lastName,
                  phone: req.body.phone,
                  password: hash,
                })
                .then((user) => {
                  return res.status(200).json({ jwt: generateJWT(user) });
                })
                .catch((error) => {
                  return res.status(500).json({
                    message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
                  });
                });
            } else {
              return res.status(500).json({
                message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
              });
            }
          });
        } else {
          return res.status(404).json({
            message: "Uporabnik s tem enoličnim identifikatorjem ne obstaja.",
          });
        }
      })
      .catch((error) => {
        return res.status(500).json({
          message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
        });
      });
  }
};

// Update the image of the authorised user
const updateUserImage = (req, res) => {
  User.findOne({ where: { id: req.auth.id } })
    .then((user) => {
      if (user) {
        user
          .update({
            image: req.body.image,
          })
          .then((user) => {
            return res.status(200).json({ jwt: generateJWT(user) });
          })
          .catch((error) => {
            return res.status(500).json({
              message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
            });
          });
      } else {
        return res.status(404).json({
          message: "Uporabnik s tem enoličnim identifikatorjem ne obstaja.",
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
      });
    });
};

const generateJWT = (user) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);

  return jwt.sign(
    {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      image: user.image,
      expires: expires.getTime(),
    },
    process.env.JWT_PASSWORD,
    {
      algorithm: "HS512",
    },
  );
};

module.exports = {
  signIn,
  signUp,
  getUser,
  updateUser,
  updateUserImage,
};
