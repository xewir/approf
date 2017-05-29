'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var favoritosSchema = new Schema({ 
	alumno: {type: Schema.Types.ObjectId, ref: 'Alumno',required:true},
	profesor: {type: Schema.Types.ObjectId, ref: 'Profesor',required:true},
});
 
module.exports=mongoose.model('Favoritos',favoritosSchema);