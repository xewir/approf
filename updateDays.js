'use strict'

var mongoose = require('mongoose');

var Profesor = require('./modelos/profesor');

module.exports.updateDays = function (app){

	Profesor.update({diasPromocionRestantes: { $gt: 0} }, { $inc: { diasPromocionRestantes: -1} })
	//console.log("hola");
};