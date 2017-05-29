'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var imparteSchema = new Schema({ 
	asignatura: {type: Schema.Types.ObjectId, ref: 'Asignatura',required:true},
	profesor: {type: Schema.Types.ObjectId, ref: 'Profesor',required:true},
});
 
module.exports=mongoose.model('Imparte',imparteSchema);