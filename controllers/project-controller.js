const Project = require("../models/project");
const Task = require("../models/task");
const User = require("../models/user_master");

exports.getAddProject = async (req, res, next) => {
  // Find users whose role role_name is "Manager"
  const project_owner = await User.find({ "role.role_name": "Manager" });
  res.render("project/project", {
    pageTitle: "Add Project",
    project_owner: project_owner,
    path: "/project/project",
    isAuthenticated: true,
    editing: false,
    userRole: req.session.user.role.role_name,
    userName: req.session.user.name
  });
};

exports.postAddProject = (req, res, next) => {
  console.log("Req body:", req.body);
  const project_name = req.body.project_name;
  const project_description = req.body.project_description;
  const start_date = req.body.start_date;
  const end_date = req.body.end_date;
  const project_owner_id = req.body.project_owner;

  User.findById(project_owner_id)
    .then((userData) => {
      if (!userData) {
        throw new Error("User not found");
      }

      const project = new Project({
        project_name: project_name,
        project_description: project_description,
        project_start_date: start_date,
        project_end_date: end_date,
        project_owner_id: project_owner_id,
      });

      return project.save();
    })
    .then((result) => {
      console.log("Created Project");
      res.redirect("/project-list");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Internal Server Error");
    });
};


exports.getProjectList = async (req, res, next) => {
  try {
    console.log('Session:',req.session);
    const user = req.session.user; // assuming req.user is set after authentication
    console.log('Logged in user:', user);
    let projects;

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    if (user.role.role_name === "Admin") {
      // Admin: fetch all projects
      projects = await Project.find().populate('project_owner_id', 'name email');
    } else if (user.role.role_name === "Manager") {
      // Manager: fetch only their projects
      projects = await Project.find({ project_owner_id: user._id }).populate('project_owner_id', 'name email');
    } else {
      // Regular users: fetch project IDs from tasks where they are the task owner
      const tasks = await Task.find({ task_owner_id: user._id }).select('project_id');
      const projectIds = tasks.map(task => task.project_id.toString());
      const uniqueProjectIds = [...new Set(projectIds)];

      // Fetch only those projects
      projects = await Project.find({ _id: { $in: uniqueProjectIds } }).populate('project_owner_id', 'name email');
    }
    console.log("Project Details:", projects);

    res.render("project/project-list", {
      pageTitle: "Project List",
      projects,
      path: "/project/project-list",
      isAuthenticated: true,
      userRole: req.session.user.role.role_name,
      userName: req.session.user.name
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};

exports.postDeleteProject = (req, res, next) => {
  console.log("Project details for delete:", req.body);

  if (req.session.user.role.role_name !== 'Admin') {
    return res.status(403).send("Forbidden: Only admins can delete projects.");
  }

  const projectId = req.body.projectId;
  Project.findByIdAndRemove(projectId)
    .then(() => {
      console.log("DESTROYED Project");
      res.redirect("/project-list");
    })
    .catch((err) => console.log(err));
};

exports.getEditProject = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/project-list');
  }
  const projectId = req.params.projectId;
  Project.findById(projectId)
  .populate('project_owner_id', 'name email') // 👈 Populating name and email of owner
  .then((project) => {
    if(!project) {
      return res.redirect("/project-list");
    }
    console.log('Project details:', project);
    // Now fetch only users with role 'manager'
    User.find({ 'role.role_name': 'Manager' }, 'name email')
    .then((managers) => {
      res.render("project/project", {
        pageTitle: "Edit Project",
        path: "project/project",
        editing: editMode,
        project: project,
        isAuthenticated: req.session.isLoggedIn,
        project_owner: managers,
        userRole: req.session.user.role.role_name,
        userName: req.session.user.name
      });
    })
    .catch(err => {
      console.log('Error fetching managers:', err);
      res.redirect('/project-list');
    });
  })
  .catch((err) => console.log(err));
  };


exports.postEditProject = (req, res, next) => {
  console.log('Updated Project details:', req.body)
  const projId = req.body.projectId;
  const updatedProjectName = req.body.project_name;
  const updatedProjectDescription = req.body.project_description;
  const updatedStartDate = req.body.start_date;
  const updatedEndDate = req.body.end_date;
  const updatedProjectOwnerId = req.body.project_owner;

  
  Project.findById(projId)
    .then((project) => {
      project.project_name = updatedProjectName;
      project.description = updatedProjectDescription;
      project.project_start_date = updatedStartDate;
      project.project_end_date = updatedEndDate;
      project.project_owner_id = updatedProjectOwnerId;
      return project.save();
    })
    .then((result) => {
      console.log("UPDATED Project!");
      res.redirect("/project-list");
    })
    .catch((err) => console.log(err));
};
