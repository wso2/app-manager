/*
 *  Copyright (c) 2014, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


var editedPolicyGroup = 0; //contains status (if edit or save)
var policyGroupsArray = new Array(); //policy group related details array
var policyGroupBlock; //contains html formatted options list of Policy Groups

$(document).ready(function () {
    //load throttling tiers
    $("#throttlingTier").empty().append(throttlingTierControlBlock);
});


$('#userRoles').tokenInput('/publisher/api/lifecycle/information/meta/' + $('#meta-asset-type').val() + '/roles', {
    theme: 'facebook',
    preventDuplicates: true,
    onAdd: function (role) {
    },
    onDelete: function (role) {
    }
});

/** validate data before saving
 *
 * @param policyGroupName :Policy Group Name
 * @returns {boolean} :if successfully validated returns true else returns false
 */
function validate(policyGroupName) {
    var result = true;
    if (policyGroupName == "") {
        showPolicyGroupNotification(($('#lblPolicyGroupName').text() + " field cannot be blank"), "alert-danger");
        result = false;
    }
    return result;
}

/**
 * Save policy group
 * @param policyGroupName :Policy Group Name
 * @param throttlingTier :Throttling Tier
 * @param anonymousAccessToUrlPattern : if anonymous access allowed for the related url pattern/verb
 * @param userRoles : User Roles
 * @param objPartialMappings : Object which contains XACML policy partial details arrays
 * @param policyGroupDesc : Policy Group DEscription
 * @param isSaveAndClose : check if the call is from the save and close button
 */
function insertPolicyGroup( policyGroupName, throttlingTier, anonymousAccessToUrlPattern, userRoles, objPartialMappings, isSaveAndClose ,policyGroupDesc) {

    $.ajax({
        url: '/publisher/api/entitlement/policy/partial/policyGroup/save',
        type: 'POST',
        data: {
            "policyGroupName": policyGroupName,
            "throttlingTier": throttlingTier,
            "userRoles": userRoles,
            "anonymousAccessToUrlPattern": anonymousAccessToUrlPattern,
            "objPartialMappings": objPartialMappings,
            "policyGroupDesc" :policyGroupDesc
        },
        success: function (data) {
            editedPolicyGroup = JSON.parse(data).response.id;
            var policyPartialsMapping = [];
            var objPartialMappingsParsed = JSON.parse(objPartialMappings);

            for(var i=0; i < objPartialMappingsParsed.length; i++){
                var POLICY_PARTIAL_ID = objPartialMappingsParsed[i].entitlementPolicyPartialId;
                var EFFECT = objPartialMappingsParsed[i].effect;
                policyPartialsMapping.push({
                    "POLICY_GRP_ID": editedPolicyGroup,
                    "POLICY_PARTIAL_ID": POLICY_PARTIAL_ID,
                    "EFFECT": EFFECT
                });
            }
            policyGroupsArray.push({
                policyGroupId: editedPolicyGroup,
                policyGroupName: policyGroupName,
                throttlingTier: throttlingTier,
                anonymousAccessToUrlPattern: anonymousAccessToUrlPattern,
                userRoles: userRoles,
                policyPartials: JSON.stringify(policyPartialsMapping),
                policyGroupDesc: policyGroupDesc

            });
            //Policy Group partial update
            updatePolicyGroupPartial(policyGroupsArray);
            $('#policy-group-editor #policyGroupName').prop("readonly", true);
            showPolicyGroupNotification("Policy Group - " + policyGroupName + " saved successfully ", "alert-success");

            //close the modal if the call is from Save and close button
            if (isSaveAndClose) {
                $("#policy-group-editor").modal('hide');
            }
        },
        error: function () {
            showPolicyGroupNotification("Error occurred while saving the Policy Group data");
        }
    });
}


/**
 * Update policy group
 * @param policyGroupName :Policy Group Name
 * @param throttlingTier :Throttling Tier
 * @param anonymousAccessToUrlPattern : if anonymous access allowed for the related url pattern/verb
 * @param userRoles : User Roles
 * @param objPartialMappings : Object which contains XACML policy partial details arrays
 * @param isSaveAndClose : check if the call is from the save and close button
 */
function updatePolicyGroup(policyGroupName, throttlingTier, anonymousAccessToUrlPattern, userRoles, objPartialMappings, isSaveAndClose, policyGroupDesc) {
    $.ajax({
        url: '/publisher/api/entitlement/policy/partial/policyGroup/details/update',
        type: 'POST',
        data: {
            "policyGroupName": policyGroupName,
            "throttlingTier": throttlingTier,
            "userRoles": userRoles,
            "anonymousAccessToUrlPattern": anonymousAccessToUrlPattern,
            "policyGroupId": editedPolicyGroup,
            "objPartialMappings": objPartialMappings,
            "policyGroupDesc" :policyGroupDesc
        },
        success: function (data) {
            var policyPartialsMapping = [];
            var objPartialMappingsParsed = JSON.parse(objPartialMappings);

            for(var i=0; i < objPartialMappingsParsed.length; i++){
                var POLICY_PARTIAL_ID = objPartialMappingsParsed[i].entitlementPolicyPartialId;
                var EFFECT = objPartialMappingsParsed[i].effect;
                policyPartialsMapping.push({
                    "POLICY_GRP_ID": editedPolicyGroup,
                    "POLICY_PARTIAL_ID": POLICY_PARTIAL_ID,
                    "EFFECT": EFFECT
                });
            }
            for(var i=0; i<policyGroupsArray.length;i++){
                if(policyGroupsArray[i].policyGroupId == editedPolicyGroup){
                    policyGroupsArray[i].throttlingTier= throttlingTier;
                    policyGroupsArray[i].anonymousAccessToUrlPattern=anonymousAccessToUrlPattern;
                    policyGroupsArray[i].userRoles=userRoles;
                    policyGroupsArray[i].policyPartials= JSON.stringify(policyPartialsMapping);
                    policyGroupsArray[i].policyGroupDesc= policyGroupDesc;
                }
            }
            updatePolicyGroupPartial(policyGroupsArray);
            showPolicyGroupNotification("Policy Group - " + policyGroupName + " updated successfully", "alert-success");

            //close the modal if the call is from Save and close button
            if (isSaveAndClose) {
                $("#policy-group-editor").modal('hide');
            }
        },
        error: function () {
            showPolicyGroupNotification("Error occurred while saving the Policy Group data");
        }
    });
}

//save button click event
$(document).on("click", "#btn-policy-group-save", function () {
    savePolicyGroupData(false);
});

//save and close button click event
$(document).on("click", "#btn-policy-group-save-and-close", function () {
    savePolicyGroupData(true);
});


/**
 * save or update data
 * @param isSaveAndClose : check if the call is from the save and close button
 */
function savePolicyGroupData(isSaveAndClose) {
    //Policy Group Name
    var policyGroupName = $('#policy-group-editor #policyGroupName').val().trim();
    //Throttling Tier
    var throttlingTier = $('#policy-group-editor #throttlingTier').val();
    //if anonymous access allowed for the related url pattern/verb
    var anonymousAccessToUrlPattern = $('#policy-group-editor #anonymousAccessToUrlPattern').val();
    //User Roles
    var userRoles = $('#policy-group-editor #userRoles').val();

    var policyGroupDesc="";

    hidePolicyGroupNotification();

    //contains XACML policy partial details arrays
    var objPartialMappings = {policyGroupOptions: []};
    //check the selected XACML policy partial options and add to array
    $('.policy-opt-val').each(function (index, obj) {
        //get checked value from list
        if ($(this).context.checked) {
            var pgID = $(this).attr('data-policy-id'); //partial id
            if ($(this).hasClass('policy-allow-cb')) {
                objPartialMappings.policyGroupOptions.push({"entitlementPolicyPartialId": pgID, "effect": "Permit"});
            } else if ($(this).hasClass('policy-deny-cb')) {
                objPartialMappings.policyGroupOptions.push({"entitlementPolicyPartialId": pgID, "effect": "Deny"});
            }
        }

    });

    var result;
    if (validate(policyGroupName)) {
        // editedPolicyGroup : 0 > then insert else update
        if (editedPolicyGroup == 0) {
            insertPolicyGroup( policyGroupName, throttlingTier, anonymousAccessToUrlPattern, userRoles, JSON.stringify(objPartialMappings.policyGroupOptions), isSaveAndClose , policyGroupDesc);
        }
        else {
            updatePolicyGroup(policyGroupName, throttlingTier, anonymousAccessToUrlPattern, userRoles, JSON.stringify(objPartialMappings.policyGroupOptions), isSaveAndClose, policyGroupDesc);

            updatePolicyGroupPartialXACMLPolicies($("#uuid").val());
        }
    }
}

//policy group edit button click event
$(document).on("click", ".policy-group-edit-button", function () {
    var policyGroupId = $(this).attr('data-policy-id');
    editedPolicyGroup = policyGroupId;
    $('#policy-group-editor #policyGroupName').prop("readonly", true);
    hidePolicyGroupNotification();
    //handling edit view on partial
    $.each(policyGroupsArray, function (index, obj) {
        if (obj != null && obj.policyGroupId == policyGroupId) {
            $('#policy-group-editor #policyGroupName').val(obj.policyGroupName);
            $("#policy-group-editor #throttlingTier option[value=" + obj.throttlingTier +
            "]").attr("selected", "selected");
            $("#policy-group-editor #anonymousAccessToUrlPattern option[value=" + obj.anonymousAccessToUrlPattern +
            "]").attr("selected", "selected");
            $('#policy-group-editor #userRoles').val(obj.userRoles);
            //clear all checkbox
            $('.policy-opt-val').each(function () {
                $(this).prop('checked', false)
            });
            //generate token input method
            $('#userRoles').tokenInput("clear");
            if (obj.userRoles != '') {
                var roletoken = obj.userRoles.split(',');
            } else {
                var roletoken = [];
            }

            for (var i = 0; i < roletoken.length; i++) {
                $('#userRoles').tokenInput("add", {id: roletoken[i], name: roletoken[i]});
            }

            //handle XACML Policies:
            var getPolicyPartials = JSON.parse(obj.policyPartials);

            for (var j = 0; j < getPolicyPartials.length; j++) {
                if (getPolicyPartials[j].POLICY_GRP_ID == policyGroupId) {

                    $('.policy-opt-val').each(function () {
                        var checkeditem = $(this).attr('data-policy-id');
                        if (getPolicyPartials[j].POLICY_PARTIAL_ID == checkeditem && getPolicyPartials[j].EFFECT == 'Permit') {
                            if ($(this).hasClass('policy-allow-cb')) {
                                $(this).prop('checked', true);
                            }
                        }
                        if (getPolicyPartials[j].POLICY_PARTIAL_ID == checkeditem && getPolicyPartials[j].EFFECT == 'Deny') {
                            if ($(this).hasClass('policy-deny-cb')) {
                                $(this).prop('checked', true);
                            }
                        }
                    });


                }


            }

        }
    });
});

/**
 * Notification Alert
 * @param text : message text
 * @param alertType : alert type ('alert-success' or 'alert-danger')
 */
function showPolicyGroupNotification(text, alertType) {
    var alerttype = alertType,
        alerttext = $('#policyGroup-notification-text');

    if (alerttext.hasClass('alert-danger')) {
        alerttext.removeClass('alert-danger');
    } else {
        alerttext.removeClass('alert-success');
    }

    alerttext.addClass(alerttype);
    $('#policyGroup-notification-text').show();
    $('#policyGroup-notification-text-data').html(text);
}

/**
 * hide notification message
 */
function hidePolicyGroupNotification() {
    $('#policyGroup-notification-text').hide();
}

//policy group add button click event
$(document).on("click", "#btn-add-policy-group", function () {
    editedPolicyGroup = 0;
    $('#policy-group-editor #policyGroupName').val("");
    $('#policy-group-editor #policyGroupName').prop("readonly", false);
    $('#policy-group-editor #throttlingTier').prop('selectedIndex', 0);
    $('#policy-group-editor #anonymousAccessToUrlPattern').prop('selectedIndex', 0);
    $('#policy-group-editor #userRoles').tokenInput("clear");
    $('.policy-opt-val').each(function(){
        $(this).prop('checked', false)
    });
    hidePolicyGroupNotification();
});

/**
 * Policy Group partial update
 * This will update html after saving a policy group
 * @param policyGroupsArray
 */
function updatePolicyGroupPartial(policyGroupsArray) {
    $('#policyGroupsTable tbody').html('');
    var policyGroupIndexArray = [];

    $.each(policyGroupsArray, function (index, obj) {
        if (obj != null) {
            $('#policyGroupsTable tbody').append('<tr><td>' + obj.policyGroupName +
            '</td><td>'+ obj.description +'</td><td><a data-target="#policy-group-editor" data-toggle="modal" data-policy-id="'
            + obj.policyGroupId + '" class="policy-group-edit-button"><i class="icon-edit"></i></a> &nbsp;' +
            '<a  data-policy-name="' + obj.policyGroupName + '"  data-policy-id="' + obj.policyGroupId +
            '" class="policy-group-delete-button"><i class="icon-trash"></i></a></td></tr>');

            policyGroupIndexArray.push(obj.policyGroupId);
        }
    });

    //store the list of policy group id's (will be used in save operation to map the application wise created policy groups)
    $('#uritemplate_policyGroupIds').val(JSON.stringify(policyGroupIndexArray));

    //formatted policy group option list block
    policyGroupBlock = drawPolicyGroupsDynamically();

    //update the url pattern wise policy group drop downs
    $('.policy_groups').each(function () {
        $(this).html(policyGroupBlock);
    });

    setPolicyGroupValue();
}

//handle policy group delete event
$(document).on("click", ".policy-group-delete-button", function () {
    //Policy Group Id
    var policyGroupId = $(this).attr('data-policy-id');
    //Policy Group Name
    var policyGroupName = $(this).attr('data-policy-name');
    //Application UUID
    var uuid = $("#uuid").val();
    //Application Id
    var applicationId = getApplicationId(uuid);
    deletePolicyGroup(applicationId, policyGroupId, policyGroupName);
});

/**
 * Delete policy group by id
 * @param applicationId :Application Id
 * @param policyGroupId : PolicyGroup Id
 * @param policyGroupName :Policy Group Name
 */
function deletePolicyGroup(applicationId, policyGroupId, policyGroupName) {
    var arrayIndex; //deleted index of the array
    var groupPartial;
    var conf = confirm("Are you sure you want to delete the policy " + policyGroupName + "?");
    if (conf) {
        $.each(policyGroupsArray, function (index, obj) {
            if (obj != null && obj.policyGroupId == policyGroupId) {
                groupPartial = obj;
                arrayIndex = index;
                return false; // break
            }
        });

        $.ajax({
            url: '/publisher/api/entitlement/policy/partial/policyGroup/details/delete/' + applicationId + '/' + policyGroupId,
            type: 'DELETE',
            success: function (data) {
                //to remove index and value from policy array
                for (var i in policyGroupsArray) {
                    if (i == arrayIndex) {
                        policyGroupsArray.splice(i, 1);
                        break;
                    }
                }
                updatePolicyGroupPartial(policyGroupsArray);
            },
            error: function () {
                alert("Couldn't delete the Policy Group " + policyGroupName + ". This Policy Group is being used by web apps  ")
            }
        });
    }
}

/**
 * Get Application Id by passing Application UUID
 * @param uuid : Application UUID
 * @returns {string} : Application Id
 */
function getApplicationId(uuid) {
    var appid = "-1";
    $.ajax({
        url: '/publisher/api/entitlement/get/webapp/id/from/entitlements/uuid/' + uuid,
        type: 'GET',
        contentType: 'application/json',
        async: false,
        success: function (id) {
            appid = id;
        },
        error: function () {
        }
    });
    return appid;
}


/**
 * Create the html formatted block of throttling tier list
 * @returns {string} : throttling tier options list
 */
function drawThrottlingTiersDynamically() {
    var strContent = "";
    tiers.reverse();
    for (var i = 0; i < tiers.length; i++) {
        strContent += "<option title='" + tiers[i].tierDescription + "' value='" + tiers[i].tierName + "' id='" + tiers[i].tierName + "'>" + tiers[i].tierDisplayName + "</option>";
    }
    return strContent;
}

/**
 * Create the html formatted block for policy group list
 * @returns {string} : policy group options list
 */
function drawPolicyGroupsDynamically() {
    var strContent = "";
    for (var i = 0; i < policyGroupsArray.length; i++) {
        strContent += "<option title='" + policyGroupsArray[i].policyGroupName + "' value='" + policyGroupsArray[i].policyGroupId + "' id='" + policyGroupsArray[i].policyGroupId + "'>" + policyGroupsArray[i].policyGroupName + "</option>";
    }
    return strContent;
}

function updatePolicyGroupPartialXACMLPolicies(uuid){
    var policyGroupsArrayTemp = [];
    $.ajax({
        url: '/publisher/api/entitlement/get/webapp/id/from/entitlements/uuid/' + uuid,
        type: 'GET',
        async: false,
        contentType: 'application/json',
        success: function (id) {
            // get the entitlement policy groups
            $.ajax({
                url: '/publisher/api/entitlement/get/policy/Group/by/appId/' + id,
                type: 'GET',
                contentType: 'application/json',
                dataType: 'json',
                async: false,
                success: function (data) {
                    for (var i = 0; i < data.length; i++) {
                        policyGroupsArrayTemp.push({
                            policyGroupId: data[i].policyGroupId,
                            policyGroupName: data[i].policyGroupName,
                            throttlingTier: data[i].throttlingTier,
                            anonymousAccessToUrlPattern: data[i].allowAnonymous,
                            userRoles: data[i].userRoles,
                            policyPartials: data[i].policyPartials
                        })
                    }
                    policyGroupsArray = policyGroupsArray.concat(policyGroupsArrayTemp).unique();
                },
                error: function () {
                }
            });
        },
        error: function () {
        }
    });
}

/**
 * Use to merge array with unique
 * @returns {Array}
 */
Array.prototype.unique = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i].policyGroupId === a[j].policyGroupId)
                a.splice(j--, 1);
        }
    }

    return a;
};