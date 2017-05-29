'use strict';

var Alumno = require('./modelos/alumno'); 
var Asignatura = require('./modelos/asignatura');
var Favoritos = require('./modelos/favoritos');
var Imparte = require('./modelos/imparte');
var Profesor = require('./modelos/profesor');
var Valoracion = require('./modelos/valoracion');

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var config = require('./config');

var mongoose = require('mongoose');
var async = require('async');



function populate(next){
	async.waterfall(
		[
			function(callback)
			{
							Alumno.remove(function(err) { callback(); });
			},
			function(callback)
			{
							Asignatura.remove(function(err) { callback(); });
			},
			function(callback)
			{
							Favoritos.remove(function(err) { callback(); });
			},
			function(callback)
			{
							Imparte.remove(function(err) { callback(); });
			},
			function(callback)
			{
							Profesor.remove(function(err) { callback(); });
			},
			function(callback)
			{
							Valoracion.remove(function(err) { callback(); });
			}
			
		]);

	config.saltInit(false);
	var addedAlumnos = [];
	var addedProfesores = [];
	var addedAsignaturas = [];

	var n = new Array(10);
	for (var i = 0 ; i < 10; i++)
	{
		n[i] = i;
	}

	console.log("eliminado todo");
	async.each(n, function(i, callback) {
		
		var hashed_pass = bcrypt.hashSync('alumno' + i,config.salt);
		var newAlumno = new Alumno({
			userName: 'alumno' + i,
			password: hashed_pass,
			sesion: 'test'
		});

		addedAlumnos.push(newAlumno);
		newAlumno.save(function(err,data){
			console.log("insertando");
			hashed_pass = bcrypt.hashSync('profesor' + i,config.salt);
			var newProfesor = new Profesor({
				nombre:'nombre' + i,
				apellidos:'apellidos' + i,
				telefono:696696900 + i,
				userName:'profesor' + i,
				password: hashed_pass,
				email:'zanahorio55@hotmail.com',
				diasPromocionRestantes:i,
				precioHora:i,
				ciudad:'Mañolandia',
				horarios:'De nunca hasta nunca',
			});

			addedProfesores.push(newProfesor);

			newProfesor.save(function(err){


				var materia;
				var lvl;
				if (i == 0) {
					materia = 'Matematicas';
					lvl = "ESO"; 
				}
				else if (i == 1){
					materia = "Lengua castellana";
					lvl = "Bachillerato"; 
				}
				else if (i == 2){
					materia = "Programacion I";
					lvl = "1º Ingenieria informatica"; 
				}
				else if (i == 3){
					materia = "Educacion fisica";
					lvl = "Infantil"; 
				}
				else if (i == 4){
					materia = "Latin";
					lvl = "Bachillerato"; 
				}
				else if (i == 5){
					materia = "AOC1";
					lvl = "1º Ingenieria informatica"; 
				}
				else if (i == 6){
					materia = "Fisica y electronica";
					lvl = "1º Ingenieria informatica"; 
				}
				else if (i == 7){
					materia = "Estadistica";
					lvl = "1º Ingenieria informatica"; 
				}
				else if (i == 8){
					materia = "Programacion II";
					lvl = "1º Ingenieria informatica"; 
				}
				else if (i == 9){
					materia = "IC";
					lvl = "1º Ingenieria informatica"; 
				}

				var newAsignatura = new Asignatura({
					nombre:materia,
					nivel:lvl
				});

				addedAsignaturas.push(newAsignatura);
				newAsignatura.save(function(err){
					
						async.each(addedAlumnos, function(alumno, callback) {
							var valoracion = new Valoracion({
							alumno: alumno._id,
							profesor: addedProfesores[i]._id,
							puntuacion: i
							});
							valoracion.save(function(err){

							var favorito = new Favoritos({
								alumno: alumno._id,
								profesor: addedProfesores[i]._id,
							});
							favorito.save(function(err){callback();});
							});
						});
				
						async.each(addedAsignaturas, function(asig, callback) {
							var imparte = new Imparte({
							asignatura: asig._id,
							profesor: addedProfesores[i]._id
						});
							
						imparte.save();
						addedProfesores[i].update(
										{
											$push: {asignaturas: asig._id}
										}, function(err){callback();});

						});
					
					
					console.log('antes de callback ' + i)

					if (i == 9) { 	console.log('fin each'); next(); }

					callback();
				});
			});
		});
	});
}



// Crea conexion con la base de datos
mongoose.connect('mongodb://' + config.dbUser + ':' + config.dbPass + '@' + config.dbURI);

// Si la conexion falla
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open',function(){

	console.log('HOLA');
	populate(function (){
		//For test
		Asignatura.find({},function(err,data){
		if(err || !data){
			console.log(err);
		}
		else{
			console.log(data);
		}
		mongoose.disconnect(function(){
		console.log('off');
	});
	});
	});
	
});



