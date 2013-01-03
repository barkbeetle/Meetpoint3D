function Client()
{
	this.clientId = null;
	this.characterId = null;
	this.node = null;
	this.bubbleNode = null;
	this.scale = 1;
	this.xPosition = 0;
	this.zPosition = 0;
	this.angle = 0;
	this.newXPosition = 0;
	this.newZPosition = 0;
	this.newAngle = 0;
	this.smoothMovements = false;
	this.lastSpeaking = 0;
	this.bubbleAngle = 0;
}

Client.prototype.rotate = function(rotAngle)
{
	this.angle = this.angle+rotAngle;
}

Client.prototype.move = function(distance)
{
	this.xPosition -= Math.sin(Mp3D.degToRad(this.angle))*distance;
	this.zPosition -= Math.cos(Mp3D.degToRad(this.angle))*distance;
}

Client.prototype.updateNode = function()
{
	if(this.smoothMovements)
	{
		this.xPosition = (12*this.xPosition + this.newXPosition)/13
		this.zPosition = (12*this.zPosition + this.newZPosition)/13
		this.angle = (12*this.angle + this.newAngle)/13
	}
	
	if(this.node)
	{
		//console.log("updating client "+this.clientId);
		this.node.resetTransformation();
		this.node.translate([this.xPosition, 0, this.zPosition]);
		this.node.rotate(Mp3D.degToRad(this.angle), [0, 1, 0]);
		this.node.scale([this.scale, this.scale, this.scale]);
		
		if(this.bubbleNode)
		{
			if(this.lastSpeaking > (new Date().getTime()-3000))
			{
				this.bubbleNode.resetTransformation();
				this.bubbleNode.rotate(Mp3D.degToRad(this.bubbleAngle), [0, 1, 0]);
			}
			else
			{
				this.bubbleNode.scale([0, 0, 0]);
			}
		}
	}
}

Client.prototype.getInformationString = function()
{
	var informationString = this.clientId+"&"+this.xPosition+"&"+this.zPosition+"&"+this.angle;
	return informationString;
}
