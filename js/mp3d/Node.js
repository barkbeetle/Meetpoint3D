function Node()
{
	this.model = null;
	this.parent = null;
	this.children = new Array();
	this.transformation = mat4.create();

	mat4.identity(this.transformation);
}

Node.prototype.draw = function(parentMVMatrix)
{	
	var mvMatrix = mat4.create();
	mat4.multiply(parentMVMatrix, this.transformation, mvMatrix);
	
	if(this.model)
	{
		this.model.draw(mvMatrix);
	}
	
	$.each(this.children, function()
	{
		this.draw(mvMatrix);
	});
}

/*Node.prototype.draw = function()
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
}*/

Node.prototype.append = function(node)
{
	node.parent = this;
	this.children.push(node);
}

Node.prototype.detach = function(node)
{
	
}

Node.prototype.resetTransformation = function()
{
	mat4.identity(this.transformation);
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

Node.prototype.getAbsoluteTransformation = function()
{
	var absoluteTransformation = mat4.create();
	mat4.set(this.transformation, absoluteTransformation);
	var parentNode = this.parent;
	while(parentNode)
	{
		mat4.multiply(parentNode.transformation, absoluteTransformation, absoluteTransformation);
		parentNode = parentNode.parent;
	}
	return absoluteTransformation;
}
