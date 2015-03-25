/*
 Description: Renders the assets.jag view
 Filename:assets.js
 Created Date: 29/7/2013
 */

var server = require('store').server;
var permissions=require('/modules/permissions.js').permissions;
var config = require('/config/publisher.json');
var lcModule = require('/modules/comment.js');
var user=server.current(session);
var um=server.userManager(user.tenantId);
var publisher = require('/modules/publisher.js').publisher(request, session);
var rxtManager = publisher.rxtManager;

var render = function (theme, data, meta, require) {
    var log = new Log();


    var lifecycleColors = {"Create": "btn-green", "Recycle": "btn-blue", "Re-Publish": "btn-blue", "Submit for Review": "btn-blue", "Unpublish": "btn-orange", "Deprecate": "btn-danger", "Retire": "btn-danger", "Publish": "btn-blue", "Approve": "btn-blue", "Reject": "btn-orange"};

    if(data.artifacts){

        var deleteButtonAvailability = false;
        var pubActions = config.publisherActions;
        var publishActionAuthorized = permissions.isAuthorized(user.username, config.permissions.webapp_publish, um);

        var shortName = "webapp";
        var artifactManager = rxtManager.getArtifactManager(shortName);
        //handle asset based notification
        var notifications = [];
        var notificationCount = 0;

        for(var i = 0; i < data.artifacts.length; i++){
            var lifecycleAvailableActionsButtons = new Array();
            if(permissions.isLCActionsPermitted(user.username,data.artifacts[i].path,um)) {
                for (var j = 0; j < data.artifacts[i].lifecycleAvailableActions.length; j++) {
                    var name = data.artifacts[i].lifecycleAvailableActions[j];


                    for(var k = 0; k < data.roles.length; k++){
                        var skipFlag = false;

                        if(pubActions.indexOf(String(name)) > -1){
                            if(!publishActionAuthorized) {
                                skipFlag = true;
                            }
                        }

                        if(!skipFlag) {
                            if (name == "Publish") {
                                lifecycleAvailableActionsButtons.push({name: name, style: lifecycleColors[name]});
                            }
                            if (name == "Reject") {
                                lifecycleAvailableActionsButtons.push({name: name, style: lifecycleColors[name]});
                            }
                            if (name == "Submit for Review") {
                                lifecycleAvailableActionsButtons.push({name: name, style: lifecycleColors[name]});
                            }
                            if (name == "Recycle") {
                                lifecycleAvailableActionsButtons.push({name: name, style: lifecycleColors[name]});
                            }
                            if (name == "Deprecate") {
                                lifecycleAvailableActionsButtons.push({name: name, style: lifecycleColors[name]});
                            }
                            if (name == "Re-Publish") {
                                lifecycleAvailableActionsButtons.push({name: name, style: lifecycleColors[name]});
                            }
                            if (name == "Unpublish") {
                                lifecycleAvailableActionsButtons.push({name: name, style: lifecycleColors[name]});
                            }
                            if (name == "Depreicate") {
                                lifecycleAvailableActionsButtons.push({name: name, style: lifecycleColors[name]});
                            }
                            if (name == "Retire") {
                                lifecycleAvailableActionsButtons.push({name: name, style: lifecycleColors[name]});
                            }
                            if (name == "Approve") {
                                lifecycleAvailableActionsButtons.push({name: name, style: lifecycleColors[name]});
                            }
                            break;
                        }
                    }


                }
            }

            data.artifacts[i].lifecycleAvailableActions = lifecycleAvailableActionsButtons;

            //Adding the delete button
            if (permissions.isDeletePermitted(user.username,data.artifacts[i].path,um)) {
                deleteButtonAvailability = true;
            }

            data.artifacts[i].deleteButtonAvailability = deleteButtonAvailability;

            //handle asset based notification - collect notifications
            if(data.artifacts[i].lifecycleState == "Rejected"){
                notificationCount++;
                var notifyObject;
                var lcComments = lcModule.getlatestLCComment(artifactManager, data.artifacts[i].path);
                for(key in lcComments) {
                    if(lcComments.hasOwnProperty(key)) {
                        notifyObject = {'url': '/publisher/asset/webapp/'+ data.artifacts[i].id,
                            'notification': lcComments[key], 'appname':data.artifacts[i].attributes.overview_displayName }
                    }
                }
                notifications.push(notifyObject);
            }
        }
        //handle asset based notification - bind with session
        session.put('notifications', notifications);
        session.put('notificationCount', notificationCount);

    }

    var notifications = session.get('notifications');
    var notificationCount = session.get('notificationCount');

    var listPartial = 'list-assets';

//Determine what view to show
    switch (data.op) {
        case 'list':
            listPartial = 'list-assets';
            data = require('/helpers/view-asset.js').format(data);
            break;
        case 'statistics':
            listPartial = 'statistics';
            break;
        case 'app_sub_user':
            listPartial = 'app_sub_user';
            break;
        case 'apps':
            listPartial = 'apps';
            break;
        case 'response-time':
            listPartial = 'response-time';
            break;
        case 'usage-page':
            listPartial = 'usage-page';
            break;
        case 'cache-stat':
            listPartial = 'cache-stat';
            break;
        case 'app-by-endpoint':
            listPartial = 'app-by-endpoint';
            break;

        default:
            break;
    }


    var breadCrumbData = require('/helpers/breadcrumb.js').generateBreadcrumbJson(data);
    var createActionAuthorized = permissions.isAuthorized(user.username, config.permissions.webapp_create, um);
    var viewStatsAuthorized = permissions.isAuthorized(user.username, config.permissions.view_statistics, um);

    theme('single-col-fluid', {
        title: data.title,
        header: [
            {
                partial: 'header',
                context: data
            }
        ],
        ribbon: [
            {
                partial: 'ribbon',
                context: {
                        active:listPartial,
                        createPermission : createActionAuthorized,
                        viewStats : viewStatsAuthorized,
                        notifications : notifications,
                        notificationCount: notificationCount
                }
            }
        ],
        leftnav: [
            {
                partial: 'left-nav',
                context: require('/helpers/left-nav.js').generateLeftNavJson(data, listPartial)
            }
        ],
        listassets: [
            {
                partial: listPartial,
                context: data
            }
        ]
    });
};
