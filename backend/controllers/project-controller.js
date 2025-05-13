const Project = require("../models/project");
const Task = require("../models/task");
const User = require("../models/user_master");

exports.getAddProject = async (req, res, next) => {
  try {
    //Find users whose role_name is "Manager"
    const project_owner = await User.find({ "role.role_name": "Manager" });
    res.status(200).json({
      project_owner: project_owner,
      isAuthenticated: true,
      editing: false
    });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({message: "Failed to fetch project owners."});
  }
}

exports.postAddProject = (req, res, next) => {
  console.log("Req body:", req.body);
  const project_name = req.body.project_name;
  const project_description = req.body.project_description;
  const start_date = req.body.project_start_date;
  const end_date = req.body.project_end_date;
  const project_owner_id = req.body.project_owner_id;

  User.findById(project_owner_id)
    .then((userData) => {
      console.log("User Data:", userData);
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
      res.status(200).send("Project created");
      console.log("Created Project");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Internal Server Error");
    });
};



exports.postProjectList = async (req, res, next) => {
  try {
    /*console.log('Session:', req.session);
    const user = req.session.user;
    console.log('Logged in user:', user);*/
    const user_role_name = req.body.role_name;
    const user_id = req.body.user_id;
    const user_name = await User.findById(user_id).select('name');

    /*if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }*/

    let projects;

    if (user_role_name === "Admin") {
      // Admin: fetch all projects
      projects = await Project.find().populate('project_owner_id', 'name email');
    } else if (user_role_name === "Manager") {
      // Manager: fetch only their projects
      projects = await Project.find({ project_owner_id: user_id }).populate('project_owner_id', 'name email');
    } else {
      // Regular users: fetch project IDs from tasks where they are the task owner
      const tasks = await Task.find({ task_owner_id: user_id }).select('project_id');
      const projectIds = tasks.map(task => task.project_id.toString());
      const uniqueProjectIds = [...new Set(projectIds)];

      projects = await Project.find({ _id: { $in: uniqueProjectIds } }).populate('project_owner_id', 'name email');
    }

    console.log("Project Details:", projects);

    res.status(200).json({
      message: "Projects fetched successfully",
      projects: projects,
      userRole: user_role_name,
      userName: user_name
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};





exports.postDeleteProject = async (req, res, next) => {
  try {
    console.log("Project details for delete:", req.body);

    /*if (!req.session.user || req.session.user.role.role_name !== 'Admin') {
      return res.status(403).json({ message: "Forbidden: Only admins can delete projects." });
    }*/

    const projectId = req.body.projectId;

    const deletedProject = await Project.findByIdAndDelete(projectId);

    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found." });
    }

    console.log("DESTROYED Project:", deletedProject);

    res.status(200).json({ message: "Project deleted successfully", deletedProject });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong while deleting project." });
  }
};

exports.postEditProject = (req, res, next) => {
  console.log('Updated Project details:', req.body)
  const projId = req.body.projectId;
  const updatedProjectName = req.body.project_name;
  const updatedProjectDescription = req.body.project_description;
  const updatedStartDate = req.body.project_start_date;
  const updatedEndDate = req.body.project_end_date;
  const updatedProjectOwnerId = req.body.project_owner_id;

  
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
      res.status(200).send("Project updated");
      console.log("UPDATED Project!");
    })
    .catch((err) => console.log(err));
};
