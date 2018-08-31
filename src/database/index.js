const mongoose = require("mongoose");

mongoose.connect("mongodb://192.168.99.100:32773/noderest");
mongoose.Promise = global.Promise;

module.exports = mongoose;