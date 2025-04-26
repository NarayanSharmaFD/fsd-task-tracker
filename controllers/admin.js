const Product = require("../models/product");
const Role = require("../models/role");
const Status = require("../models/status");
const User = require("../models/user_master");
const Project = require("../models/project");
const Task = require("../models/task");

const bcrypt = require("bcryptjs");

exports.getAddProduct = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
  });
};

//creating a new product
exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      // console.log(result);
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

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

exports.getAddUser = async (req, res, next) => {
  const roles = await Role.find(); // Assuming Role is your model
  console.log("Role", roles);
  res.render("admin/user", {
    pageTitle: "Add User",
    roles: roles,
    path: "/admin/user",
    isAuthenticated: true,
  });
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
          console.log("Created User");
          res.redirect("/admin/user");
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getAddProject = async (req, res, next) => {
  // Find users whose role role_name is "Manager"
  const project_owner = await User.find({ "role.role_name": "Manager" });
  console.log("Project Owner:", project_owner);
  res.render("admin/project", {
    pageTitle: "Add Project",
    project_owner: project_owner,
    path: "/admin/project",
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
      res.redirect("/admin/project");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Internal Server Error");
    });
};

exports.getAddTask = async (req, res, next) => {
  // Find users whose role role_name is "User"
  const task_owner = await User.find({ "role.role_name": "User" });
  console.log("Task Owner:", task_owner);

  const status = await Status.find();

  const projectId = req.params.projectId;
  console.log('Project Id:', projectId)

  res.render("admin/task", {
    pageTitle: "Add Task",
    task_owner: task_owner,
    path: "/admin/task",
    isAuthenticated: true,
    project_id: projectId, // 👈 pass it like this
    status: status,
    userRole: req.session.user.role.role_name,
    userName: req.session.user.name,
    editing: false
  });
};

exports.postAddTask = (req, res, next) => {
  console.log("Task details:", req.body);
  const task_name = req.body.task_name;
  const task_description = req.body.task_description;
  const task_due_date = req.body.due_date;
  const task_owner_id = req.body.task_owner;
  const project_id = req.body.projectId;
  const status_id = req.body.status;

  User.findById(task_owner_id)
    .then((userData) => {
      if (!userData) {
        throw new Error("User not found");
      }

      const task = new Task({
        task_name: task_name,
        task_description: task_description,
        task_due_date: task_due_date,
        task_owner_id: task_owner_id,
        project_id: project_id,
        status_id: status_id
      });

      return task.save();
    })
    .then((result) => {
      console.log("Created Task");
      res.redirect("/admin/task-list");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Internal Server Error");
    });
};

exports.getProjectList = async (req, res, next) => {
  try {
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

    res.render("admin/project-list", {
      pageTitle: "Project List",
      projects,
      path: "/admin/project-list",
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
      res.redirect("/admin/project-list");
    })
    .catch((err) => console.log(err));
};

exports.postDeleteTask = (req, res, next) => {
  console.log("Task details for delete:", req.body);

  if (req.session.user.role.role_name === 'User') {
    return res.status(403).send("Forbidden: Only admins and managers can delete projects.");
  }

  const taskId = req.body.taskId;
  Task.findByIdAndRemove(taskId)
  .then(() => {
    console.log("Destroyed Task");
    res.redirect("/admin/task-list");
  })
  .catch((err) => console.log(err));
}

/*exports.getTaskList = (req, res, next) => {

  const projectId = req.params.projectId;
  res.render("admin/task-list", {
    pageTitle: 'Task List',
    path: 'admin/task-list',
    isAuthenticated: req.session.isLoggedIn,
    tasks: [],
    projectId
  })
}*/

exports.getTaskList = async (req, res, next) => {
  try {
    const user = req.session.user;
    const projectId = req.params.projectId;
    console.log("Logged in user:", user);
    console.log("Project ID:", projectId);

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    let tasks;

    if (user.role.role_name === "Admin") {
      // Admin can see all tasks (optionally filter by project)
      tasks = await Task.find(projectId ? { project_id: projectId } : {})
        .populate('task_owner_id', 'name email')
        .populate('project_id', 'project_name');
    } else if (user.role.role_name === "Manager") {
      // Get all project IDs owned by this manager
      const ownedProjects = await Project.find({ project_owner_id: user._id }, '_id');
      const ownedProjectIds = ownedProjects.map(p => p._id);

      const taskFilter = {
        project_id: { $in: ownedProjectIds }
      };

      // If a specific projectId is provided, further filter it
      if (projectId) {
        taskFilter.project_id = projectId;
      }

      tasks = await Task.find(taskFilter)
        .populate('task_owner_id', 'name email')
        .populate('project_id', 'project_name');
    } else if (user.role.role_name === "User") {
      // Users see only their tasks (optionally filtered by project)
      const taskFilter = { task_owner_id: user._id };

      if (projectId) {
        taskFilter.project_id = projectId;
      }

      tasks = await Task.find(taskFilter)
        .populate('task_owner_id', 'name email')
        .populate('project_id', 'project_name');
    }

    res.render("admin/task-list", {
      pageTitle: 'Task List',
      path: 'admin/task-list',
      isAuthenticated: req.session.isLoggedIn,
      tasks,
      projectId,
      userRole: req.session.user.role.role_name,
      userName: req.session.user.name
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};

exports.getEditTask = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/admin/task-list');
  }

  const taskId = req.params.taskId;
  try {
    const task = await Task.findById(taskId);
    if (!task) return res.redirect('/admin/task-list');

    const users = await User.find({ 'role.role_name': 'User' }, 'name email');
    const statuses = await Status.find(); 

    res.render("admin/task", {
      pageTitle: "Edit Task",
      path: "admin/task",
      editing: editMode,
      task,
      task_owner: users,
      status: statuses,
      project_id: task.project_id, // needed for dynamic form action,
      task_id: taskId,
      isAuthenticated: req.session.isLoggedIn,
      userRole: req.session.user.role.role_name,
      userName: req.session.user.name
    });
  } catch (err) {
    console.error('Edit Task Error:', err);
    res.redirect('/admin/task-list');
  }
};

exports.getEditProject = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/admin/project-list');
  }
  const projectId = req.params.projectId;
  Project.findById(projectId)
  .populate('project_owner_id', 'name email') // 👈 Populating name and email of owner
  .then((project) => {
    if(!project) {
      return res.redirect("/admin/project-list");
    }
    console.log('Project details:', project);
    // Now fetch only users with role 'manager'
    User.find({ 'role.role_name': 'Manager' }, 'name email')
    .then((managers) => {
      res.render("admin/project", {
        pageTitle: "Edit Project",
        path: "admin/project",
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
      res.redirect('/admin/project-list');
    });
  })
  .catch((err) => console.log(err));
  };


exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    // Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        isAuthenticated: req.session.isLoggedIn,
        userRole: req.session.user.role.role_name,
        userName: req.session.user.name
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  /*const product = new Product(
    updatedTitle,
    updatedPrice,
    updatedDesc,
    updatedImageUrl,
    prodId
  );*/
  Product.findById(prodId)
    .then((product) => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;
      return product.save();
    })
    .then((result) => {
      console.log("UPDATED PRODUCT!");
      res.redirect("/admin/products");
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
      res.redirect("/admin/project-list");
    })
    .catch((err) => console.log(err));
};

exports.postEditTask = (req, res, next) => {
  console.log("Updated task details", req.body)
  const task_id = req.body.taskId;
  const task_name = req.body.task_name;
  const task_description = req.body.task_description;
  const task_due_date = req.body.due_date;
  const task_owner_id = req.body.task_owner;
  const status_id = req.body.status;
  const project_id = req.body.projectId;

  Task.findById(task_id)
  .then((task) => {
    task.task_name = task_name;
    task.task_description = task_description;
    task.task_due_date = task_due_date;
    task.task_owner_id = task_owner_id;
    task.project_id = project_id;
    task.status_id = status_id;
    return task.save();
  })
  .then((result) => {
    console.log("UPDATED Task!");
    res.redirect("/admin/task-list");
  })
  .catch((err) => console.log(err));
};


//fetching all the products
exports.getProducts = (req, res, next) => {
  Product.find()
    //.select('title price -_id')
    //.populate('userId', 'name')
    .then((products) => {
      console.log(products);
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  console.log("Product details for delete:", req.body);
  const prodId = req.body.productId;
  Product.findByIdAndRemove(prodId)
    .then(() => {
      console.log("DESTROYED PRODUCT");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
