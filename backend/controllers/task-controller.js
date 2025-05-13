const Task = require("../models/task");
const User = require("../models/user_master");
const Status = require("../models/status");
const Project = require("../models/project");
const Audit = require("../models/audit");

exports.getAddTask = async (req, res, next) => {
  try {
    // Find users whose role role_name is "User"
    const task_owner = await User.find({ "role.role_name": "User" });
    console.log("Task Owner:", task_owner);

    const status = await Status.find();

    const projectId = req.params.projectId;
    console.log("Project Id:", projectId);

    return res.status(200).json({
      success: true,
      data: {
        task_owner,
        status,
        project_id: projectId,
      },
    });
  } catch (error) {
    console.error("Error in getAddTask:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch task form data.",
      error: error.message,
    });
  }
};

exports.postAddTask = (req, res, next) => {
  console.log("Task details:", req.body);
  const task_name = req.body.task_name;
  const task_description = req.body.task_description;
  const task_due_date = req.body.task_due_date;
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
        status_id: status_id,
      });

      return task.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Task got created!" });
      console.log("Created Task");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Internal Server Error");
    });
};

exports.postDeleteTask = async (req, res, next) => {
  try {
    console.log("Task details for delete:", req.body);
    const project_id = req.body.projectId;

    /*if (req.session.user.role.role_name === 'User') {
      return res.status(403).send("Forbidden: Only admins and managers can delete projects.");
    }*/

    const taskId = req.body.taskId;

    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found." });
    }

    console.log("DESTROYED Task:", deletedTask);

    res.status(200).json({ message: "Task deleted successfully", deletedTask });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Something went wrong while deleting task." });
  }
};

exports.getTaskList = async (req, res, next) => {
  try {
    const user_role_name = req.body.role_name;
    const projectId = req.params.projectId;
    const user_id = req.body.user_id;
    const user_name = await User.findById(user_id).select("name");
    console.log("Logged in user:", user_role_name);
    console.log("Project ID:", projectId);
    console.log("Params:", req.params);

    /*if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }*/

    let tasks;

    if (user_role_name === "Admin") {
      // Admin can see all tasks (optionally filter by project)
      tasks = await Task.find(projectId ? { project_id: projectId } : {})
        .populate("task_owner_id", "name email")
        .populate("project_id", "project_name")
        .populate("status_id", "status_name");
    } else if (user_role_name === "Manager") {
      // Get all project IDs owned by this manager
      const ownedProjects = await Project.find(
        { project_owner_id: user_id },
        "_id"
      );
      const ownedProjectIds = ownedProjects.map((p) => p._id);

      const taskFilter = {
        project_id: { $in: ownedProjectIds },
      };

      // If a specific projectId is provided, further filter it
      if (projectId) {
        taskFilter.project_id = projectId;
      }

      tasks = await Task.find(taskFilter)
        .populate("task_owner_id", "name email")
        .populate("project_id", "project_name")
        .populate("status_id", "status_name");
    } else if (user_role_name === "User") {
      // Users see only their tasks (optionally filtered by project)
      const taskFilter = { task_owner_id: user_id };

      if (projectId) {
        taskFilter.project_id = projectId;
      }

      tasks = await Task.find(taskFilter)
        .populate("task_owner_id", "name email")
        .populate("project_id", "project_name")
        .populate("status_id", "status_name");
    }

    console.log("Task details:", tasks);

    res.status(200).json({
      message: "Tasks fetched successfully",
      tasks,
      projectId,
      userRole: user_role_name,
      userName: user_name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
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
