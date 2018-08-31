const express = require("express");
const User = require("../models/user");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const mailer = require("../services/mailer")
const authConfig = require('../../config/auth');

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { email } = req.body;

        if (await User.findOne({ email })) {
            return res.status(400).send({ error: "usuário já existe" });
        }
        const user = await User.create(req.body)
        user.password = undefined;

        const token = generateToken({ id: user.id });

        return res.send({ user, token });
    } catch (e) {
        res.status(400).send({ error: "error on register" })
    }
});

router.post("/authenticate", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(400).send({ error: "user not found" });
        }

        if (!await bcrypt.compare(password, user.password)) {
            return res.status(400).send({ error: "invalide password!" });
        }
        user.password = undefined;

        const token = generateToken({ id: user.id });

        return res.send({ user, token });
    } catch (e) {
        res.status(400).send({ error: "error on register" })
    }
});

router.post("/forgot_password", async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send({ error: "user not found" });
        }
        const passwordResetToken = crypto.randomBytes(20).toString("hex");
        const passwordResetExpiress = new Date();
        passwordResetExpiress.setHours(passwordResetExpiress.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            "$set": { passwordResetToken, passwordResetExpiress }
        });

        mailer.sendMail({
            to: email,
            from: "douglasg3x@gmail.com",
            template: "forgot_password",
            context: { token: passwordResetToken },
        }, (err) => {
            if (err) {
                return res.status(400).send({ error: "Não foi possivel envial email de recuperação" });
            }
            return res.send({ msg: "email de recuperação de senha enviado" });
        });
    } catch (error) {
        return res.status(400).send({ error });
    }
});

router.post("/reset_password", async (req, res) => {
    const { email, token, password } = req.body;
    try {
        const user = await User.findOne({ email }).select("+passwordResetToken passwordResetExpiress");
        if (!user) {
            return res.status(400).send({ error: "usuário não encontrado" });
        }
        if (user.passwordResetToken !== token) {
            return res.status(400).send({ error: "token invalidao" });
        }
        if (new Date() > user.passwordResetExpiress) {
            return res.status(400).send({ error: "token expirado" });
        }

        user.password = password;
        await user.save();

        return res.send({ msg: "senha auterada com sucesso" });
    } catch (error) {
        return res.status(400).send({ error });
    }
});

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400
    });
}

module.exports = app => app.use("/auth", router);