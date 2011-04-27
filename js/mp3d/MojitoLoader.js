MojitoLoader = new Object();

MojitoLoader.parseMojito = function(mojito)
{
	var rootNode = new Node();
	
	$(mojito).children("nodes").children().each(function()
	{
		rootNode.append(MojitoLoader.parseNode(this));
	});
	
	return rootNode;
}

MojitoLoader.parseNode = function(contentNode)
{
	var node = new Node();

	if(contentNode.nodeName.toLowerCase() == "polygon")
	{
		var vertices = $(contentNode).children("vertices")[0].textContent;
		var uvCoords = $(contentNode).children("uvset")[0].textContent;
		var normals = $(contentNode).children("normals")[0].textContent;
		var faces = $(contentNode).children("faces")[0].textContent;
		//var material = $(node).children("material")[0].innerText;
		
		// parse vertices
		var allVertices = new Array();
		$.each(vertices.split(" "), function()
		{
			allVertices.push(parseFloat(this));
		});
		
		// parse uvsets
		var allUVCoords = new Array();
		$.each(uvCoords.split(" "), function()
		{
			allUVCoords.push(parseFloat(this));
		});
		
		// parse normals
		var allNormals = new Array();
		$.each(normals.split(" "), function()
		{
			allNormals.push(parseFloat(this));
		});
		
		// parse faces
		var verticesArray = new Array();
		var uvCoordsArray = new Array();
		var normalsArray = new Array();
		var indexArray = new Array();
		
		var facesArray = faces.split(" ");
		
		for(var i = 0; i < facesArray.length; i+=9)
		{		
			var vertexIndex = parseInt(facesArray[i+0]);
			var uvCoordIndex = parseInt(facesArray[i+1]);
			var normalIndex = parseInt(facesArray[i+2]);
			
			for(var j = 0; j < 3; j++)
			{
				var vertexIndex = parseInt(facesArray[i+j]);
				
				verticesArray.push(allVertices[vertexIndex*3+0]);
				verticesArray.push(allVertices[vertexIndex*3+1]);
				verticesArray.push(allVertices[vertexIndex*3+2]);
				
				var normalIndex = parseInt(facesArray[i+j+3]);
				
				normalsArray.push(allNormals[normalIndex*3+0]);
				normalsArray.push(allNormals[normalIndex*3+1]);
				normalsArray.push(allNormals[normalIndex*3+2]);
				
				var uvCoordIndex = parseInt(facesArray[i+j+6]);
				
				uvCoordsArray.push(allUVCoords[uvCoordIndex*2+0]);
				uvCoordsArray.push(allUVCoords[uvCoordIndex*2+1]);
				
				indexArray.push(i/3+0);
				indexArray.push(i/3+1);
				indexArray.push(i/3+2);
			}
		}
		
		var model = new Model();
		
		model.setVertexPositions(verticesArray);
		model.setVertexTexCoords(uvCoordsArray);
		model.setVertexNormals(normalsArray);
		model.setVertexIndices(indexArray);
		
		model.setTexture("res/cube1.png");
			
		model.shaderProgram = Mp3D.simpleTextureShader;
		
		node.model = model;

		var childrenNode = $(contentNode).children("children");
		if(childrenNode)
		{
			$.each(childrenNode.children(), function()
			{
				node.append(MojitoLoader.parseNode(this));
			});
		}
	}
	else if(contentNode.nodeName.toLowerCase() == "null")
	{
		var childrenNode = $(contentNode).children("children");
		if(childrenNode)
		{
			$.each(childrenNode.children(), function()
			{
				node.append(MojitoLoader.parseNode(this));
			});
		}
	}
	else
	{
		throw "unknown tagname: "+contentNode.nodeName;
	}
	
	return node;
}

