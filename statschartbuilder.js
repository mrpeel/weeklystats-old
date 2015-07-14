/** Set up global types so JSHint doesn't trigger warnings that they are not defined */

/*global gapi */
/*global Chart */
/*global Promise */
/*global setTimeout */
/*global document */

//Constants for generating the legend for each type of chart
var LINE_CHART_LEGEND = "<% for (var i=0; i<datasets.length; i++) {%><li><i style=\"background:<%=datasets[i].fillColor%>; border-width: 1px; border-style: solid; border-color:<%=datasets[i].pointColor%>;\"></i><%if (datasets[i].label) {%><%=datasets[i].label%><%}%></li><%}%>";
var BAR_CHART_LEGEND = "<% for (var i=0; i<datasets.length; i++) {%><li><i style=\"background:<%=datasets[i].fillColor%>; border-width: 1px; border-style: solid; border-color:<%=datasets[i].strokeColor%>;\"></i><%if (datasets[i].label) {%><%=datasets[i].label%><%}%></li><%}%>";
var DOUGHNUT_CHART_LEGEND = "<% for (var i=0; i<segments.length; i++) {%><li><i style=\"background:<%=segments[i].fillColor%>; border-width: 1px; border-style: solid; border-color:<%=segments[i].highlightColor%>;\"></i><%if (segments[i].label) {%><%=segments[i].label%><%}%></li><%}%>";


var StatsChart = function (ids, startDate, endDate) {
    "use strict";
    this.fillColors = [     'rgba(115,115,115,0.33)', 'rgba(241,90,96,0.33)', 'rgba(122,195,106,0.33)', 'rgba(90,155,212,0.33)', 'rgba(250,167,91,0.33)', 'rgba(158,103,171,0.33)',
                            'rgba(193,254,227,0.33)', 'rgba(215,127,80,0.33)'];
    this.strokeColors = [   'rgba(115,115,115,1)', 'rgba(241,90,96,1)', 'rgba(122,195,106,1)', 'rgba(90,155,212,1)', 'rgba(250,167,91,1)', 'rgba(158,103,171,1)',
                            'rgba(193,254,227,1)', 'rgba(215,127,80,1)'];
    this.ids = ids;
    this.startDate = startDate;
    this.endDate = endDate;
    this.chartData = [];
    this.labels = [];
};

/**
 * Extend the Embed APIs `gapi.analytics.report.Data` component to
 * return a promise the is fulfilled with the value returned by the API.
 * @param {Object} queryParams The request parameters.
 * @return {Promise} A promise.
 */
StatsChart.prototype.queryGA = function (queryParams) {
    "use strict";
    return new Promise(function (resolve, reject) {
        var data = new gapi.analytics.report.Data({
            query: queryParams
        });

        data.once('success', function (response) {
            resolve(response);
        })
            .once('error', function (response) {
                reject(response);
            })
            .execute();
    });
};

/**
 * Return a promise after a delay.
 * When used with promise chaining, this allows the execution to be paused
 * for a priod of time.  This is used to control the rate of calls to the analytics API.
 * @param {None}
 * @return {Promise} an empty promise (as so many are)
 */
StatsChart.prototype.delayExecution = function () {
    "use strict";
    return new Promise(function (resolve) {
        setTimeout(resolve, 200);
    });
};

/**
 * Create a new canvas inside the specified element. Set it to be the width
 * and height of its container.
 * @param {string} chartElement The id attribute of the element to host the canvas.
 * @return {RenderingContext} The 2D canvas context.
 */
StatsChart.prototype.makeCanvas = function (chartElement) {
    "use strict";
    var container = document.getElementById(chartElement);
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    container.innerHTML = '';
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    container.appendChild(canvas);

    return ctx;
};

/**
 * Create a new a line chart using the chartjs library
 * @param {string} chartElement, legendElement The id attributes of the element to host the chart and 
 *                  the element to host the legend.
 * @return {None}
 */
StatsChart.prototype.createLineChart = function (chartElement, legendElement) {
    "use strict";
    //Make the canvas on the element
    var lineChart = new Chart(this.makeCanvas(chartElement)).Line(this.chartData, {
            legendTemplate: LINE_CHART_LEGEND
        });
    document.getElementById(legendElement).innerHTML = lineChart.generateLegend();
};

/**
 * Create a new a bar chart using the chartjs library
 * @param {string} chartElement, legendElement The id attributes of the element to host the chart and 
 *                  the element to host the legend.
 * @return {None}
 */

StatsChart.prototype.createBarChart = function (chartElement, legendElement) {
    "use strict";
    //Make the canvas on the element
    var barChart = new Chart(this.makeCanvas(chartElement)).Bar(this.chartData, {
            legendTemplate: BAR_CHART_LEGEND
        });
    document.getElementById(legendElement).innerHTML = barChart.generateLegend();
};

/**
 * Create a new a doughnut chart using the chartjs library
 * @param {string} chartElement, legendElement The id attributes of the element to host the chart and 
 *                  the element to host the legend.
 * @return {None}
 */

StatsChart.prototype.createDoughnutChart = function (chartElement, legendElement) {
    "use strict";
    //Make the canvas on the element
    var doughnutChart = new Chart(this.makeCanvas(chartElement)).Doughnut(this.chartData, {
            percentageInnerCutout: 33,
            animateScale: true,
            legendTemplate: DOUGHNUT_CHART_LEGEND
        });
    document.getElementById(legendElement).innerHTML = doughnutChart.generateLegend();
};



var WeekToPreviousWeekChart = function (ids, startDate, endDate) {
    "use strict";
    StatsChart.call(this, ids, startDate, endDate);
    this.currentWeekData = [];
    this.previousWeekData = [];
    this.lastYearData = [];

};

WeekToPreviousWeekChart.prototype = Object.create(StatsChart.prototype);
WeekToPreviousWeekChart.prototype.constructor = WeekToPreviousWeekChart;

/**
 * Process the data for the previous year to determine the median values
 * and populate the values into the lastYearData property.
 * @param {string} lastYearResults value from call to queryGA
 * @return {None}.
 */
WeekToPreviousWeekChart.prototype.transformLastYearDataToMedians = function (lastYearResults) {
    "use strict";
    // Object to hold year's data for each weekday
    var dayData = {}, dayLoop;

        //push yearvalues into dayData object
    lastYearResults.rows.forEach(function (row, i) {
        dayData['day' + row[0]].push(+row[3]);
    });

        /* Loop through day values and check whether there is a set of values for the week day.
        *  If present, retrieve median value.
        *  If not, add 0 in.
        *  Modulus is used to access data element so function can start with day 1 (Monday) and loop through day 6 then 0 (Sunday)
        */
    for (dayLoop = 1; dayLoop <= 7; dayLoop++) {
        if (dayData['day' + (dayLoop % 7)] === undefined) {
            this.lastYearData.push(0);
        } else {
            this.lastYearData.push(dayData['day' + (dayLoop % 7)][Math.round(dayData['day' + (dayLoop % 7)].length / 2)]);
        }   
    }
    
};



