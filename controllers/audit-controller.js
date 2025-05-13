const Project = require("../models/project");
const Task = require("../models/task");
const User = require("../models/user_master");
const Audit = require("../models/audit")

exports.getAuditList = async (req, res, next) => {
    try {
      // Get all audit entries
      const auditList = await Audit.find({}, {
        task_name: 1,
        prev_status: 1,
        present_status: 1,
        task_owner: 1,
        project_name: 1
      });
  
      res.status(200).json({
        audits: auditList,
        isAuthenticated: true,
        editing: false
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch audit records." });
    }
};

// exports.getAuditList = async (req, res, next) => {
//   try {
//     // Fetch all tasks
//     const audit = await Audit.find();

//     // Format the response
//     const formattedAudit = audit.map((task) => ({
//       task_name: task.task_name || "",
//       prev_status: task.prev_status || "",
//       present_status: task.present_status || "",
//       task_owner: task.task_owner || "",
//       project_name: task.project_name || "",
//     }));

//     // Return the response
//     res.status(200).json(formattedAudit);

//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Something went wrong");
//   }
// };

