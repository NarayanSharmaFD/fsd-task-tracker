const Audit = require("../models/audit");

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