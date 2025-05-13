exports.get404 = (req, res, next) => {
    res
      .status(404)
      .render("404", {
        pageTitle: "Page Not Found",
        path: "/404",
        isAuthenticated: req.session.isLoggedIn,
        userRole: req.session.user.role.role_name,
        userName: req.session.user.name
      });
  };
  