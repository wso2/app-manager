
var RESOURCES = [
    {"url_pattern":"/*", "http_verb":"GET" ,  "throttling_tier":"" },
    {"url_pattern":"/*", "http_verb":"POST"  , "throttling_tier":"" },
    {"url_pattern":"/*", "http_verb":"PUT" ,  "throttling_tier":"" },
    {"url_pattern":"/*", "http_verb":"DELETE" , "throttling_tier":"" },
    {"url_pattern":"/*", "http_verb":"OPTIONS" , "throttling_tier":"" },
];

$( document ).ready(function() {

    $("#add_resource").click(function(){

        $(".http_verb").each(function(){
            var resource = {};
            resource.url_pattern = $("#url_pattern").val();
            resource.http_verb = $(this).val();
            if($(this).is(':checked')){
                RESOURCES.push(resource);
            }
        })

        $("#resource_tbody").trigger("draw");
        console.log(RESOURCES);
    });

    $("#resource_tbody").delegate(".delete_resource","click", function(){
        var i = $(this).attr("data-index");
        RESOURCES.splice(i, 1);
        $("#resource_tbody").trigger("draw");
        console.log(RESOURCES);
    });

    $("#resource_tbody").on("draw", function(){
        $("#resource_tbody").html("");
        for(var i=0; i< RESOURCES.length; i++){
            $("#resource_tbody").prepend(
                "<tr> \
                  <td><span style='color:#999'>/{context}/{version}/</span>"+ RESOURCES[i].url_pattern +" <input type='hidden' value='"+RESOURCES[i].url_pattern+"' name='uritemplate_urlPattern"+i+"'/></td> \
                  <td><strong>"+ RESOURCES[i].http_verb +"</strong><input type='hidden' value='"+RESOURCES[i].http_verb+"' name='uritemplate_httpVerb"+i+"'/></td> \
                  <td style='padding:0px'><select name='uritemplate_tier"+i+"' class='selectpicker' id='getThrottlingTier' style='width:100%;border:none;'><option title='Allows unlimited requests' value='Unlimited'>Unlimited</option><option title='Allows 5 request(s) per minute.' value='Silver'>Silver</option><option title='Allows 20 request(s) per minute.' value='Gold'>Gold</option><option title='Allows 1 request(s) per minute.' value='Bronze'>Bronze</option></select></td> \
                  <td style='padding:0px'><select name='uritemplate_skipthrottle"+i+"' class='selectpicker' id='' style='width:100%;border:none;'><option value='False'>False</option><option value='True'>True</option></select></td> \
                  <td> \
                  	<a data-index='"+i+"' class='delete_resource'><i class='icon-trash icon-white'></i></a>&nbsp; \
                  	<a data-index='"+i+"' class='moveup_resource'><i class='icon-arrow-up icon-white'></i></a>&nbsp; \
                  	<a data-index='"+i+"' class='movedown_resource'><i class='icon-arrow-down icon-white'></i></a>&nbsp; \
                  </td> \
                </tr> \
				"
            );

        }
    });

    $("#resource_tbody").trigger("draw");
});
