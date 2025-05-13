const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const User = require("../models/user_master");

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "Authentication failed: User not found." });
      }
      bcrypt.compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            const token = jwt.sign({email: user.email, 
              userId: user._id.toString(),
              name: user.name,
              role_name: user.role.role_name,
              role_id: user.role.role_id.toString()
            },'secret', {expiresIn: '1h'}
          );    
              res.status(200).json({
                message: "Login successful",
                tokens: token,
                user: {
                  id: user._id,
                  email: user.email,
                  name: user.name,
                  role_name: user.role.role_name
                }}
            );
          } else {
            res.status(401).json({ message: "Authentication failed: Incorrect password." });
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ message: "Server error during password comparison." });
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error during login." });
    });
};