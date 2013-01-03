function Camera()
{
	this.node = null;
}

Camera.prototype.getTransformation = function()
{
	if(this.node)
	{
		return this.node.getAbsoluteTransformation();
	}
	else
	{
		return mat4.identity(mat4.create());
	}
}
