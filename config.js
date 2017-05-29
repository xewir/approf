'use strict';

var fs = require('fs');
var bcrypt = require('bcrypt-nodejs');
var _ = require('lodash');
var glob = require('glob');
var chalk = require('chalk');

var config = {
	// MongoDb
	dbURI: "ds031167.mlab.com:31167/thisisnotsteam",
	dbUser : "potus",
	dbPass : "potus",

	// Puerto del servidor
	puerto: 8080,

	// JsonWebToken
	TIME_EXPIRE : '12h',
	secret : 'approf',

	// Salt para el hash de passwords
	salt : null,
	saltInit : function(debug) {
		if(!fs.existsSync('./salty.salt')) {
			var salt_gen = bcrypt.genSaltSync(10);
			var bytes = fs.writeFileSync('./salty.salt', salt_gen);
			if (bytes != -1) {
				this.salt = salt_gen;
				if(debug) console.log(chalk.yellow('Generado correctamente el salt : ' + salt_gen));
			} else {
				console.log(chalk.red('Error generando el salt'));
				process.exit(-1);
			}
		} else {
			this.salt = fs.readFileSync('./salty.salt').toString();
			if (this.salt) {
				if(debug) console.log(chalk.yellow('Obtenido correctamente el salt : ' + this.salt));
			} else {
				if(debug) console.log(chalk.red('Error leyendo el salt'));
				process.exit(-1);
			}
		}
	},

	foldersRutas : {},

	initRutasFolder : function () {
		var ruta = __dirname + '/rutas/*.js';
		this.foldersRutas = this.getGlobbedPaths(ruta);
	},

	getGlobbedPaths : function (globPatterns, excludes) {
  		  // URL paths regex
		  var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

		  // The output array
		  var output = [];

		  // If glob pattern is array then we use each pattern in a recursive way, otherwise we use glob
		  if (_.isArray(globPatterns)) {
		    globPatterns.forEach(function (globPattern) {
		      output = _.union(output, getGlobbedPaths(globPattern, excludes));
		    });
		  } else if (_.isString(globPatterns)) {
		    if (urlRegex.test(globPatterns)) {
		      output.push(globPatterns);
		    } else {
		      var files = glob.sync(globPatterns);
		      if (excludes) {
		        files = files.map(function (file) {
		          if (_.isArray(excludes)) {
		            for (var i in excludes) {
		              file = file.replace(excludes[i], '');
		            }
		          } else {
		            file = file.replace(excludes, '');
		          }
		          return file;
		        });
		      }
		      output = _.union(output, files);
		    }
		  }

		  return output;
	}
};

module.exports = config;