

module.exports = function (app) 
{
	app.get('/api/ejemplo', function (req, res) {
		res.send("Ejemplo de ruta");
	});
};