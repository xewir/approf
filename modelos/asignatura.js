'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var asignaturaSchema = new Schema({ 
	nombre: {type: String,required:true},
	nivel: {type: String,required:true},
});
 
module.exports=mongoose.model('Asignatura',asignaturaSchema);