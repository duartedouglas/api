const mongoose = require("../../database");

const TaskSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "project",
        require: true,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        require: true,
    },
    completed: {
        type: Boolean,
        require: true,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Task = mongoose.model("task", TaskSchema);

module.exports = Task;