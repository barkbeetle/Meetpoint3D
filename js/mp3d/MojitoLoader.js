MojitoLoader = new Object();

MojitoLoader.parseMojito = function(mojito)
{
	var model = new Model();
	
	$(mojito).find("nodes").each(function()
	{
		MojitoLoader.parseNode(this);
	});
	
	return model;
}


MojitoLoader.parseNode = function(polygons)
{
	
}

