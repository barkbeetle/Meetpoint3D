function Node()
{
	this.model = null;
	this.children = new Array();
	this.transformation = mat4.create();

	mat4.identity(this.transformation);
}

Node.prototype.draw = function()
{
	Mp3D.pushMV();
	
	mat4.multiply(Mp3D.mvMatrix, this.transformation, Mp3D.mvMatrix);
	
	if(this.model)
	{
		this.model.draw();
	}
	
	$.each(this.children, function()
	{
		this.draw();
	});
	
	Mp3D.popMV();
}

Node.prototype.append = function(node)
{
	console.log("append");
	this.children.push(node);
}

Node.prototype.translate = function(vector)
{
	mat4.translate(this.transformation, vector);
}

Node.prototype.scale = function(vector)
{
	mat4.scale(this.transformation, vector);
}

Node.prototype.rotate = function(angle, axis)
{
	mat4.rotate(this.transformation, angle, axis);
}

