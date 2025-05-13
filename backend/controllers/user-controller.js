const User = require("../models/user_master");
const Role = require("../models/role");
const bcrypt = require("bcryptjs");

exports.getEditUser = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/user-list');
  }
  const userId = req.params.userId;
  console.log("Edit used id", userId);
  const role = await Role.find();
  console.log("Role details:", role);
  User.findById(userId)
  .then((user) => {
    console.log("USER:",user);
    if(!user) {
      return res.redirect("/user-list");
    }
    res.render("user/user", {
      pageTitle: "Edit User",
      path: "user/user",
      editing: editMode,
      roles: role,
      user: user,
      isAuthenticated: req.session.isLoggedIn,
      userRole: req.session.user.role.role_name,
      userName: req.session.user.name
    })
  })
};

exports.postDeleteUser = (req, res, next) => {
  console.log("User details for delete:", req.body);
  const userId = req.body.userId;
  User.findByIdAndDelete(userId)
  .then(() => {
    console.log('User deleted');
    res.redirect('/user-list');
  })
  .catch((err) => console.log(err));
};

exports.getUserList = async (req, res, next) => {
  try {
    const users = await User.find();
    console.log("User List:", users);

    res.status(200).json({
      success: true,
      users
    });
  }
  catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};

exports.postAddUser = async (req, res, next) => {
  console.log("Req body:", req.body);
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const roleId = req.body.role;
  const roleData = await Role.findById(roleId);
  console.log("Role id:", roleId);
  
  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        return res.redirect("/signup");
      }
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            email: email,
            password: hashedPassword,
            role: {
              role_name: roleData.role_name,
              role_id: roleId,
            },
            name: name,
          });
          return user.save();
        })
        .then((result) => {
          res.status(201).json({message: 'User created', userId: result._id});
          console.log("Created User");
          res.redirect("/user-list");
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getAddUser = async (req, res, next) => {
  try {
    const roles = await Role.find(); // Fetch roles from DB
    console.log("Roles:", roles);

    res.status(200).json({
      roles: roles,
      editing: false
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Failed to fetch roles', error: error.message });
  }
};

exports.postEditUser = async (req, res, next) => {
    console.log("Updated user details:", req.body)
    const user_id = req.body.userId;
    const name = req.body.name;
    const email = req.body.email;
    const role_id = req.body.role;
    const role_data = await Role.findById(role_id);
    User.findById(user_id)
    .then((user) => {
        user.name = name;
        user.email = email;
        user.role.role_id = role_id;
        user.role.role_name = role_data.role_name;
        return user.save();
    })
    .then((result) => {
        console.log("UPDATED User!");
        res.redirect("/user-list");
    })
    .catch((err) => console.log(err));
};