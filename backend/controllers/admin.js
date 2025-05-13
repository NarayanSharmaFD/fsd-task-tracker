const Role = require("../models/role");
const Status = require("../models/status");


exports.getAddRole = (req, res, next) => {
  res.render("admin/roles", {
    pageTitle: "Add Role",
    path: "/admin/roles",
    isAuthenticated: true,
    userRole: req.session.user.role.role_name,
    userName: req.session.user.name
  });
};

exports.postAddRole = (req, res, next) => {
  const role_name = req.body.role_name;
  const role = new Role({
    role_name: role_name,
  });
  role
    .save()
    .then((result) => {
      console.log("Created Role");
      res.redirect("/roles");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getAddStatus = (req, res, next) => {
  res.render("admin/statuses", {
    pageTitle: "Add Status",
    path: "/admin/statuses",
    isAuthenticated: true,
    userRole: req.session.user.role.role_name,
    userName: req.session.user.name
  });
};

exports.postAddStatus = (req, res, next) => {
  const status_name = req.body.status_name;
  const status = new Status({
    status_name: status_name,
  });
  status
    .save()
    .then((result) => {
      console.log("Created Status");
      res.redirect("/admin/statuses");
    })
    .catch((err) => {
      console.log(err);
    });
};