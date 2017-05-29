'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var alumnoSchema = new Schema({
	userName: {type: String, required: true, index: true, unique: true},
	password: {type: String, required: true},

	sesion: {type: String, required: true}
});
 
module.exports=mongoose.model('Alumno',alumnoSchema);