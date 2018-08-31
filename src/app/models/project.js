const mongoose = require("../../database");

const ProjectSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        require: true,
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "task",
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const Project = mongoose.model("project", ProjectSchema);

module.exports = Project;