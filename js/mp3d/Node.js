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
	Mp3D.setMatrixUniforms();
	
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
