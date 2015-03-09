$(function () {
    drawGraphs();

});


function drawGraphs() {

    var url = window.location.pathname;
    var comps = url.split('/');
    var type = comps[comps.length - 2];
    var operation = comps[comps.length - 3];
    var action = 'getSubscriberCountByAPIs';
    var dateRange = $('#date-range').val();
    var from = dateRange.split('to')[0].trim() + ":00";
    var to = dateRange.split('to')[1].trim() + ":00";
    ;
    var userParsedResponse;

    $.ajax({
        async: false,
        url: '/publisher/api/assets/' + operation + '/' + type
            + '/getAPIResponseTime/',
        type: 'POST',
        data: {
            'startDate': from,
            'endDate': to
        },
        success: function (response) {

            drawAPIResponseTime(response);
            $('#spinner').hide();
        },
        error: function (response) {
            alert('Error occured at statistics graph rendering');
        }
    });

}

var drawAPIResponseTime = function (response) {
    var parsedResponse = JSON.parse(response);
    var length = parsedResponse.webapps.length;

    $('#placeholder41').empty();
    if (parsedResponse.webapps.length == 0) {
        $('#placeholder41').html($('<h1 class="no-data-heading">No data available</h1>'));
    } else {

        var $dataTable = $('<table class="display" width="100%" cellspacing="0" id="apiSelectTable"></table>');
        $dataTable.append($('<thead class="tableHead"><tr>' +
            '<th width="10%"></th>' +
            '<th>API</th>' +
            '<th style="text-align:right;">Response Time(ms)</th>' +

            '</tr></thead>'));

        var filterValues = [];
        var filterData = [];
        var defaultFilterValues = [];
        var defaultChartData = [];

        $('#checkboxContainer').append($dataTable);
        $('#checkboxContainer').show();

        var state_array = [];


        responsetimeCount = 0;
        var timedatastructure = [];
        var webappdatasructure = [];

        for (var i = 0; i < parsedResponse.webapps.length; i++) {
            var count = 0;
            for (var j = 0; j < parsedResponse.webapps[i][1].length; j++) {
                responsetimeCount = Number(responsetimeCount) + Number(parsedResponse.webapps[i][1][j][1]);
            }
            timedatastructure.push([responsetimeCount, i]);
            webappdatasructure.push([i, parsedResponse.webapps[i][0]]);
            responsetimeCount = 0;
        }

        timedatastructure.sort(function(obj1, obj2) {
            return obj2[0] - obj1[0];
        });

        //sorting response time data according to descending order
        var chartData=[];
        var chartTicks=[];
        for(var i=0;i<timedatastructure.length;i++){
            chartData.push([timedatastructure[i][0],i]);
            chartTicks.push([i, webappdatasructure[timedatastructure[i][1]][1]]);
        }

        for (var n = 0; n < chartTicks.length; n++) {

            if (n < 15) {
                $dataTable.append($('<tr><td >'
                    + '<input name="item_checkbox"  checked   id=' + n + '  type="checkbox"  data-item=' +
                    chartTicks[n][1] + ' class="inputCheckbox" />'
                    + '</td>'
                    + '<td style="text-align:left;"><label for=' + n + '>' + chartTicks[n][1] + '</label></td>'
                    + '<td style="text-align:right;"><label for=' + n + '>' + chartData[n][0] +
                    '</label></td></tr>'));

                filterValues.push(chartTicks[n][1]);
                filterData.push(chartData[n][0]);
                state_array.push(true);
                defaultFilterValues.push([n, chartTicks[n][1]]);
                defaultChartData.push([chartData[n][0], n]);

            } else {

                $dataTable.append($('<tr><td >'
                    + '<input name="item_checkbox" id=' + n + '  type="checkbox"  data-item=' + chartTicks[n][1]
                    + ' class="inputCheckbox" />'
                    + '</td>'
                    + '<td style="text-align:left;"><label for=' + n + '>' + chartTicks[n][1] + '</label></td>'
                    + '<td style="text-align:right;"><label for=' + n + '>' + chartData[n][0]
                    + '</label></td></tr>'));

                filterValues.push(chartTicks[n][1]);
                filterData.push(chartData[n][0]);
                state_array.push(false);
            }
        }
        $('#checkboxContainer').append($dataTable);
        $('#checkboxContainer').show();
        $('#apiSelectTable').DataTable({

            "order": [
                [ 2, "desc" ]
            ],
            "aoColumns": [
                { "bSortable": false },
                null,
                null
            ],
        });

        // BAR CHART

        var dataset=[];
        for(var i=0;i<defaultChartData.length;i++){
        var randomColor = getRandomColor();
            dataset.push({data: [defaultChartData[i]], color: randomColor});
        }

        $.plot($("#placeholder41"), dataset, {
            series: {
                bars: {
                    show: true,
                    clickable: true
                }
            },
            bars: {
                align: "center",
                barWidth: 0.5,
                horizontal: true,
            },
            xaxis: {
                axisLabel: "<b>Response Time (ms)</b>",
                axisLabelUseCanvas: false,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20
            },
            yaxis: {
                axisLabel: "Web App",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelPadding: 3,
                ticks: defaultFilterValues
            },
            grid: {
                clickable: true,
                hoverable: true,
                borderWidth: 0.5,
                borderColor: {left: "#bdbdbd", left: "#bdbdbd"},
                backgroundColor: { colors: ["#ffffff", "#EDF5FF"] }
            }
        });

        // tooltip
        var previousPoint = null,
            previousLabel = null;

        function showTooltip(x, y, contents) {
            $('<div id="tooltip">' + contents + '</div>').css({
                position: 'absolute',
                display: 'none',
                top: y - 40,
                left: x - 120,
                border: '1px solid #bdbdbd',
                color: 'black',
                backgroundColor: 'white',
                font: '12px sans-serif',
                padding: 5,
                opacity: 1
            }).appendTo("body").fadeIn(200);
        }

        $("body #placeholder41").bind("plothover", function (event, pos, item) {
            $("#tooltip").remove();
            if (item != null) {

                var tableStatement = '';
                tableStatement = '<table class="table graphTable"><thead><tr><th>page</th><th>response time(ms)' +
                    '</th></tr></thead><tbody id="tbody"></tbody></table>';
                var x = item.datapoint[0];
                var y = item.datapoint[1];


                var label = item.series.yaxis.ticks[y].label;

                var webappPage = [];
                var webappPageCount = [];

                for (var i = 0; i < parsedResponse.webapps.length; i++) {
                    arr = [];
                    if (label == parsedResponse.webapps[i][0]) {
                        for (var j = 0; j < parsedResponse.webapps[i][1].length; j++) {
                            for (var l = 0; l < parsedResponse.webapps[i][1][j].length; l++) {
                                webappPage = parsedResponse.webapps[i][1][j][0]
                                webappPageCount = parsedResponse.webapps[i][1][j][1]
                            }
                            arr.push({version: webappPage, count: webappPageCount});
                        }
                        showTooltip(item.pageX,
                            item.pageY,
                            tableStatement);

                        for (var l = 0; l < arr.length; l++) {
                            var arrStr = JSON.stringify(arr);
                            var versionName = arr[l].version;
                            var versionCount = arr[l].count;
                            $('#tbody').append('<tr><td>' + versionName + '</td><td style="text-align:right">'
                                + versionCount + '</td></tr>');
                        }
                    }
                }
            }


        });

        var count=15;
        //on checkbox check and uncheck event
        $('#apiSelectTable').on('change', 'input.inputCheckbox', function () {

            var id = $(this).attr('id');
            var check = $(this).is(':checked');
            var tickValue = $(this).attr('data-item');
            var draw_y_axis = []
            var draw_x_axis = []

            if (check) {
               $('#displayMsg').html('');
               count++;
               //limiting to show 15 entries at a time
               if(count>15){
                   $('#displayMsg').html('<h5 style="color:#555">Please Note that the graph will be showing only 15 entries</h5>');
                   state_array[id] = false;
                   $(this).prop("checked", "");
                   count--;
               }else{
               state_array[id] = true;
               }
            } else {
               $('#displayMsg').html('');
               state_array[id] = false;
               count--;
            }

            var y_iter = 0
            $.each(filterData, function (index, value) {
                if (state_array[index]) {
                    draw_y_axis.push([value, y_iter]);
                    y_iter++
                }
            });

            var x_iter = 0
            $.each(filterValues, function (index, value) {
                if (state_array[index]) {
                    draw_x_axis.push([x_iter, value]);
                    x_iter++
                }
            });


            //color bar chart
            var onCheckDataset=[];
            for(var i=0;i<draw_y_axis.length;i++){
                var randomColor = getRandomColor();
                onCheckDataset.push({data: [draw_y_axis[i]], color: randomColor});
            }

            $.plot($("#placeholder41"), onCheckDataset, {
                series: {
                    bars: {
                        show: true,
                        clickable: true
                    }
                },
                bars: {
                    align: "center",
                    barWidth: 0.5,
                    horizontal: true,
                },
                xaxis: {
                    axisLabel: "<b>Response Time (ms)</b>",
                    axisLabelUseCanvas: false,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                yaxis: {
                    axisLabel: "Web App",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 3,
                    ticks: draw_x_axis
                },
                grid: {
                    clickable: true,
                    hoverable: true,
                    borderWidth: 0.5,
                    borderColor: {left: "#bdbdbd", left: "#bdbdbd"},
                    backgroundColor: { colors: ["#ffffff", "#EDF5FF"] }
                }
            });
        });
    }
}

var onDateSelected = function () {
    clearTables();
    drawGraphs();
}

function clearTables() {
    $('#webAppTable').remove();
    $('#webAppTable2').remove();
    $('#webAppTable3').remove();
    $('#webAppTable4').remove();
    $('#webAppTable5').remove();

}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';

    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
}

