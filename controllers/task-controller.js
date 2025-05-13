const Task = require("../models/task");
const User = require("../models/user_master");
const Status = require("../models/status");
const Project = require("../models/project");

exports.getAddTask = async (req, res, next) => {
  // Find users whose role role_name is "User"
  const task_owner = await User.find({ "role.role_name": "User" });
  console.log("Task Owner:", task_owner);

  const status = await Status.find();

  const projectId = req.params.projectId;
  console.log('Project Id:', projectId)

  res.render("task/task", {
    pageTitle: "Add Task",
    task_owner: task_owner,
    path: "/task/task",
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
      res.redirect(`/task-list/${project_id}`);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Internal Server Error");
    });
};

exports.postDeleteTask = (req, res, next) => {
  console.log("Task details for delete:", req.body);
  const project_id = req.body.projectId;

  if (req.session.user.role.role_name === 'User') {
    return res.status(403).send("Forbidden: Only admins and managers can delete projects.");
  }

  const taskId = req.body.taskId;
  Task.findByIdAndRemove(taskId)
  .then(() => {
    console.log("Destroyed Task");
    res.redirect(`/task-list/${project_id}`);
  })
  .catch((err) => console.log(err));
};

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
        .populate('project_id', 'project_name')
        .populate('status_id', 'status_name');
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
        .populate('project_id', 'project_name')
        .populate('status_id', 'status_name');
    } else if (user.role.role_name === "User") {
      // Users see only their tasks (optionally filtered by project)
      const taskFilter = { task_owner_id: user._id };

      if (projectId) {
        taskFilter.project_id = projectId;
      }
      // Fetch the tasks for the user
      tasks = await Task.find(taskFilter)
      .populate('task_owner_id', 'name email')
      .populate('project_id', 'project_name')
      .populate('status_id', 'status_name');
    }
    console.log("Task details:", tasks);

    res.render("task/task-list", {
      pageTitle: 'Task List',
      path: 'task/task-list',
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
  const project_id = req.body.projectId;
  if (!editMode) {
    return res.redirect('/task-list');
  }

  const taskId = req.params.taskId;
  try {
    const task = await Task.findById(taskId);
    if (!task) return res.redirect('/task-list');

    const users = await User.find({ 'role.role_name': 'User' }, 'name email');
    const statuses = await Status.find(); 

    res.render("task/task", {
      pageTitle: "Edit Task",
      path: "task/task",
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
    res.redirect(`/task-list/${project_id}`);
  }
};


exports.postEditTask = async (req, res, next) => {
  try {
    console.log("Updated task details", req.body);
    const task_id = req.body.taskId;
    const task_name = req.body.task_name;
    const task_description = req.body.task_description;
    const task_due_date = req.body.task_due_date;
    const task_owner_id = req.body.task_owner;
    const status_id = req.body.status;
    const project_id = req.body.projectId;

    const task = await Task.findById(task_id).populate("project_id", "project_name").populate("status_id", "status_name").populate("task_owner_id", "name email");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    console.log("Task details:", task);

    const prev_status_id = task.status_id;
    const present_status_id = status_id;

    // Save project name before overwriting project_id
    const project_name = task.project_id.project_name;
    const prev_status_name = task.status_id.status_name;
    const task_owner = task.task_owner_id.name;

    // Fetch present status name before overwriting status_id
    const status_doc = await Status.findById(status_id);
    const present_status_name = status_doc ? status_doc.status_name : null;

    // Update fields
    task.task_name = task_name;
    task.task_description = task_description;
    task.task_due_date = task_due_date;
    task.task_owner_id = task_owner_id;
    task.project_id = project_id;
    task.status_id = status_id;
    // Save the task
    await task.save();

    // Compare and insert audit if status changed
    if (prev_status_id.toString() !== present_status_id.toString()) {
      const auditEntry = new Audit({
        task_id: task_id,
        task_name: task_name,
        prev_status: prev_status_name,
        present_status: present_status_name,
        task_owner: task_owner,
        project_name: project_name,
        project_id: project_id,
      });
      await auditEntry.save();
      console.log("Audit record added.");
    }
    res.status(200).json({ message: "Task got updated!" });
    console.log("UPDATED Task!");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating task" });
  }
};

// exports.postEditTask = async(req, res, next) => {
//   // console.log("Updated task details", req.body)
//   // const task_id = req.body.taskId;
//   // const task_name = req.body.task_name;
//   // const task_description = req.body.task_description;
//   // const task_due_date = req.body.due_date;
//   // const task_owner_id = req.body.task_owner;
//   // const status_id = req.body.status;
//   // const project_id = req.body.projectId;

//   // Task.findById(task_id)
//   // .then((task) => {
//   //   task.task_name = task_name;
//   //   task.task_description = task_description;
//   //   task.task_due_date = task_due_date;
//   //   task.task_owner_id = task_owner_id;
//   //   task.project_id = project_id;
//   //   task.status_id = status_id;
//   //   return task.save();
//   // })
//   // .then((result) => {
//   //   console.log("UPDATED Task!");
//   //   res.redirect(`/task-list/${project_id}`);
//   // })
//   // .catch((err) => console.log(err));
//   try {
//     console.log("Updated task details", req.body);

//     const task_id = req.body.taskId;
//     const task_name = req.body.task_name;
//     const task_description = req.body.task_description;
//     const task_due_date = req.body.due_date;
//     const task_owner_id = req.body.task_owner;
//     const status_id = req.body.status;
//     const project_id = req.body.projectId;

//     const task = await Task.findById(task_id);
//     if (!task) {
//       return res.status(404).send("Task not found");
//     }

//     const prev_status = task.status_id;
//     const prev_task_name = task.task_name;

//     // Update task fields
//     task.task_name = task_name;
//     task.task_description = task_description;
//     task.task_due_date = task_due_date;
//     task.task_owner_id = task_owner_id;
//     task.project_id = project_id;
//     task.status_id = status_id;

//     // Save updated task
//     await task.save();

//     // Audit only if status has changed
//     if (prev_status !== status_id) {
//       const auditEntry = new Audit({
//         task_id: task._id,
//         task_name: prev_task_name,
//         prev_status: prev_status,
//         present_status: status_id,
//         task_owner: req.session.user.name, // assuming session has logged-in user
//         project_id: project_id,
//         project_name: task.project_name || "Unknown", // project_name should ideally be populated
//       });

//       await auditEntry.save();
//     }

//     console.log("UPDATED Task!");
//     res.redirect(`/task-list/${project_id}`);
//   } catch (err) {
//     console.error("Error updating task:", err);
//     res.status(500).send("Internal Server Error");
//   }
// };
