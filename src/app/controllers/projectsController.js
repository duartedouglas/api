const express = require("express");
const Task = require("../models/task");
const Project = require("../models/project");
const authMiddlewere = require("../middleweres/auth");
const router = express.Router();

router.use(authMiddlewere);
router.get("/", async (req, res) => {
    try {
        const projects = await Project.find().populate("user, tasks");
        return res.send({ projects });
    } catch (error) {
        res.status(400).send({ error })
    }
});

router.get("/:id", async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate("user, tasks");
        return res.send({ project });
    } catch (error) {
        res.status(400).send({ error })
    }
});

router.post("/", async (req, res) => {
    try {
        const { name, description, tasks } = req.body;
        const project = await Project.create({ name, description, user: req.userId });

        if (tasks && tasks.length) {
            await Promise.all(tasks.map(async task => {
                const projectTask = new Task({ ...task, user: req.userId, project: project.id });
                await projectTask.save();
                project.tasks.push(projectTask);
            }));
        }

        await project.save();
        return res.send({ project });
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: "Erro em criar projeto" })
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { name, description, tasks } = req.body;
        const project = await Project.findByIdAndUpdate(req.params.id, {
            name,
            description,
            user: req.userId
        }, { new:true }).populate("user");

        project.tasks = [];
        await Task.remove({project:project.id});

        if (tasks && tasks.length) {
            await Promise.all(tasks.map(async task => {
                const projectTask = new Task({ ...task, user: req.userId, project: project.id });
                await projectTask.save();
                project.tasks.push(projectTask);
            }));
        }

        await project.save();
        return res.send({ project });
    } catch (error) {
        res.status(400).send({ error: "Erro em criar projeto" })
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const project = await Project.findByIdAndRemove(req.params.id);
        return res.send({ project });
    } catch (error) {
        res.status(400).send({ error: "Erro em deletar" })
    }
});

module.exports = app => app.use("/projects", router);