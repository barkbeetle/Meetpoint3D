MojitoLoader = new Object();

MojitoLoader.parseMojito = function(mojito)
{
	var rootNode = new Node();
	$(mojito.firstChild).children("nodes").children().each(function()
	{
		rootNode.append(MojitoLoader.parseNode(this, new Object()));
	});
	
	return rootNode;
}

MojitoLoader.parseNode = function(contentNode, parentProperties)
{
	var node = new Node();

	if(contentNode.nodeName.toLowerCase() == "polygon")
	{	
		var vertices = $(contentNode).children("vertices")[0].textContent;
		var normals = $(contentNode).children("normals")[0].textContent;
		var uvCoords = $(contentNode).children("uvset")[0].textContent;
		var faces = $(contentNode).children("faces")[0].textContent;
		var transformation = $(contentNode).children("transformation")[0].textContent;
		
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
		
		var material = null;
		
		// parse materials
		if($(contentNode).children("material")[0])
		{
			var materialName = $(contentNode).children("material")[0].textContent;
			var materialObject = Mp3D.materials[materialName];
			if(!materialObject)
			{
				throw "material '"+materialName+"' is not defined in materials.xml";
			}
			material = materialObject;
		}
		else if(parentProperties.material)
		{
			material = parentProperties.material;
		}
		else
		{
			if(Mp3D.defaultMaterial)
			{
				material = Mp3D.defaultMaterial;
			}
			else
			{
				throw "no default material set."
			}
		}
		
		model.setMaterial(material);
		parentProperties.material = material;
		node.model = model;

		// parse transformation
		var transformationStringArray = transformation.split(" ");
		var transformationArray = new Array();
		for(var i = 0; i < 16; i++)
		{
			transformationArray.push(parseFloat(transformationStringArray[i]));
		}
		if(transformationArray)
		{
			var transformationMatrix = mat4.create(transformationArray);
			mat4.transpose(transformationMatrix);
			mat4.set(transformationMatrix, node.transformation);
		}

		// parse children
		var childrenNode = $(contentNode).children("children")[0];
		if(childrenNode)
		{
			$.each($(childrenNode).children(), function()
			{
				node.append(MojitoLoader.parseNode(this, parentProperties));
			});
		}
	}
	else if(contentNode.nodeName.toLowerCase() == "null")
	{
		var transformation = $(contentNode).children("transformation")[0].textContent;
	
		// parse transformation
		var transformationStringArray = transformation.split(" ");
		var transformationArray = new Array();
		for(var i = 0; i < 16; i++)
		{
			transformationArray.push(parseFloat(transformationStringArray[i]));
		}
		if(transformationArray)
		{
			var transformationMatrix = mat4.create(transformationArray);
			mat4.transpose(transformationMatrix);
			mat4.set(transformationMatrix, node.transformation);
		}
		
		var material = null;
		
		// parse materials
		if($(contentNode).children("material")[0])
		{
			var materialName = $(contentNode).children("material")[0].textContent;
			var materialObject = Mp3D.materials[materialName];
			if(!materialObject)
			{
				throw "material '"+materialName+"' is not defined in materials.xml";
			}
			material = materialObject;
		}
		else if(parentProperties.material)
		{
			material = parentProperties.material;
		}
		else
		{
			if(Mp3D.defaultMaterial)
			{
				material = Mp3D.defaultMaterial;
			}
			else
			{
				throw "no default material set.";
			}
		}
	
		// parse children
		var childrenNode = $(contentNode).children("children")[0];
		if(childrenNode)
		{
			$.each($(childrenNode).children(), function()
			{
				node.append(MojitoLoader.parseNode(this, material));
			});
		}
	}
	else
	{
		throw "unknown tagname: "+contentNode.nodeName;
	}
	
	return node;
}

