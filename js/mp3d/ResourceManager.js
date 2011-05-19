ResourceManager = new Object();

ResourceManager.requests = new Array();
ResourceManager.dependencies = new Array();
ResourceManager.data = new Array();

ResourceManager.addRequest = function(name, url, type)
{
	if(ResourceManager.requests[name])
	{
		throw "duplicate entry for '"+name+"'";
	}
	else
	{
		ResourceManager.requests[name] = {url:url, type:type};
	}
}

ResourceManager.addDependency = function(name, func)
{
	if(ResourceManager.dependencies[name])
	{
		throw "duplicate entry for '"+name+"'";
	}
	else
	{
		ResourceManager.dependencies[name] = func;
	}
}

ResourceManager.addDependencies = function(names, func)
{
	$.each(names, function()
	{
		ResourceManager.addDependency(this, func);
	});
}

ResourceManager.loadAll = function()
{
	var name;
	for(name in ResourceManager.requests)
	{
		ResourceManager.loadResource(name);
	}
}

ResourceManager.loadResource = function(name)
{
	$.ajax({
		url: ResourceManager.requests[name].url,
		type: "GET",
		dataType: ResourceManager.requests[name].type,
		success: function(data)
		{
			ResourceManager.data[name] = data;
			delete ResourceManager.requests[name];
			
			var func = ResourceManager.dependencies[name];
			if(func)
			{
				delete ResourceManager.dependencies[name];
			
				var isOnlyDependency = true;
				for(otherName in ResourceManager.dependencies)
				{
					if(String(ResourceManager.dependencies[otherName]) == String(func))
					{
						isOnlyDependency = false;
					}
				}
				
				if(isOnlyDependency)
				{
					func();
				}
			}
		},
		error: function(error)
		{
			Mp3D.error(error.responseText);
		}
	});

	/*$.get(ResourceManager.requests[name], function(data)
	{
		ResourceManager.data[name] = data;
		delete ResourceManager.requests[name];
		
		var func = ResourceManager.dependencies[name];
		if(func)
		{
			delete ResourceManager.dependencies[name];
		
			var isOnlyDependency = true;
			for(otherName in ResourceManager.dependencies)
			{
				if(String(ResourceManager.dependencies[otherName]) == String(func))
				{
					isOnlyDependency = false;
				}
			}
			
			if(isOnlyDependency)
			{
				func();
			}
		}	
	});*/
};
