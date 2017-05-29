'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var valoracionSchema = new Schema({ 
	alumno: {type: Schema.Types.ObjectId, ref: 'Alumno',required:true},
	profesor: {type: Schema.Types.ObjectId, ref: 'Profesor',required:true},
	puntuacion: {type: Number,required:true}
});
 
module.exports=mongoose.model('Valoracion',valoracionSchema);
