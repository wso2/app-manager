var getTypeObj, breadcrumbItems;
var deploymentManagement = require('/modules/deployment/deployment.manager.js')
		.deploymentManagementModule();
var deploymentManager = deploymentManagement.cached();

var log = new Log();

breadcrumbItems = deploymentManager.getAssetData()

var generateLeftNavJson = function(data, listPartial) {

	var currentTypeObj = getTypeObj(data.shortName);

	var leftNavItems = {
		leftNavLinks : [
				/*
				 * { name : "Browse All", additionalClasses : "prominent-link",
				 * url : "/publisher/assets/" + data.shortName + "/" },
				 */

				{
					name : "Add " + data.shortName + "",
					iconClass : "icon-plus-sign-alt",
					additionalClasses : (listPartial == "add-asset") ? "prominent-link"
							: null,
					url : "/publisher/asset/" + data.shortName + ""
				},
				{
					name : "Statistics",
					iconClass : "icon-dashboard",
					additionalClasses : (listPartial == "statistics") ? "prominent-link"
							: null,
					url : "/publisher/assets/statistics/" + data.shortName
							+ "/"
				} ]
	};
	if (data.artifact) {
		
		var deleteUrl = "/"+data.artifact.attributes.overview_name+"/"+data.artifact.attributes.overview_version+"/"
		+data.artifact.attributes.overview_provider;
		leftNavItems = {
			leftNavLinks : [
					/*
					 * { name : "Browse All", additionalClasses :
					 * "prominent-link", url : "/publisher/assets/" +
					 * data.shortName + "/" },
					 */

					{
						name : "Overview",
						iconClass : "icon-list-alt",
						additionalClasses : (listPartial == "view-asset") ? "prominent-link"
								: null,
						url : "/publisher/asset/operations/view/"
								+ data.shortName + "/" + data.artifact.id + ""
					},
					{
						name : "Edit",
						iconClass : "icon-edit",
						additionalClasses : (listPartial == "edit-asset") ? "prominent-link"
								: null,
						url : "/publisher/asset/operations/edit/"
								+ data.shortName + "/" + data.artifact.id + ""
					},
					{
						name : "Life Cycle",
						iconClass : "icon-retweet",
						additionalClasses : (listPartial == "lifecycle-asset") ? "prominent-link"
								: null,
						url : "/publisher/asset/operations/lifecycle/"
								+ data.shortName + "/" + data.artifact.id + ""
					},
					{
						name : "Documentation",
						iconClass : "icon-file-alt",
						additionalClasses : (listPartial == "documentation") ? "prominent-link"
								: null,
						url : "/publisher/asset/operations/documentation/"
								+ data.shortName + "/" + data.artifact.id + ""
					},
					{
						name : "Delete",
						iconClass : "icon-remove",
						additionalClasses : (listPartial == "delete-asset") ? "prominent-link"
								: null,
						url : "/publisher/asset/operations/delete/" + data.shortName + "/"
								+ data.artifact.id + ""
					}

			]
		};
	}
	return leftNavItems;
};

getTypeObj = function(type) {
	for (item in breadcrumbItems) {
		var obj = breadcrumbItems[item]
		if (obj.assetType == type) {
			return obj;
		}
	}
}
