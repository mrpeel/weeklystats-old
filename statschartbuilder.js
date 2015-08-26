/** Set up global types so JSHint doesn't trigger warnings that they are not defined */

/*global gapi */
/*global Chart */
/*global Promise */
/*global setTimeout */
/*global document */
/*global moment */
/*global console */


//Constants for generating the legend for each type of chart
var LINE_CHART_LEGEND = "<% for (var i=0; i<datasets.length; i++) {%><li><i style=\"background:<%=datasets[i].fillColor%>; border-width: 1px; border-style: solid; border-color:<%=datasets[i].pointColor%>;\"></i><%if (datasets[i].label) {%><%=datasets[i].label%><%}%></li><%}%>";

var BAR_CHART_LEGEND = "<% for (var i=0; i<datasets.length; i++) {%><li><i style=\"background:<%=datasets[i].fillColor%>; border-width: 1px; border-style: solid; border-color:<%=datasets[i].strokeColor%>;\"></i><%if (datasets[i].label) {%><%=datasets[i].label%><%}%></li><%}%>";

var DOUGHNUT_CHART_LEGEND = "<% for (var i=0; i<segments.length; i++) {%><li><i style=\"background:<%=segments[i].fillColor%>; border-width: 1px; border-style: solid; border-color:<%=segments[i].highlightColor%>;\"></i><%if (segments[i].label) {%><%=segments[i].label%><%}%></li><%}%>";



/** 
 * General chart class containing the common data and methods 
 * required to draw a bar, line or douhnut chart 
 */
var StatsChart = function (ids, startDate, endDate) {
    "use strict";
    this.fillColors = ['rgba(244,67,54,0.33)', 'rgba(76,175,80,0.33)', 'rgba(96,125,139,0.33)', 'rgba(103,58,183,0.33)', 'rgba(3,169,244,0.33)', 'rgba(255,87,34,0.33)',
                            'rgba(233,30,99,0.33)', 'rgba(139,195,74,0.33)', 'rgba(121,85,72,0.33)', 'rgba(63,81,181,0.33)', 'rgba(0,188,212,0.33)', 'rgba(255,193,7,0.33)',
                            'rgba(156,39,176,0.33)', 'rgba(205,220,57,0.33)', 'rgba(158,158,158,0.33)', 'rgba(33,150,243,0.33)', 'rgba(0,150,136,0.33)', 'rgba(255,235,59,0.33)'
                        ];

    this.strokeColors = ['rgba(244,67,54,1)', 'rgba(76,175,80,1)', 'rgba(96,125,139,1)', 'rgba(103,58,183,1)', 'rgba(3,169,244,1)', 'rgba(255,87,34,1)',
                            'rgba(233,30,99,1)', 'rgba(139,195,74,1)', 'rgba(121,85,72,1)', 'rgba(63,81,181,1)', 'rgba(0,188,212,1)', 'rgba(255,193,7,1)',
                            'rgba(156,39,176,1)', 'rgba(205,220,57,1)', 'rgba(158,158,158,1)', 'rgba(33,150,243,1)', 'rgba(0,150,136,1)', 'rgba(255,235,59,1)'
                        ];

    this.gaIds = ids;
    this.gaDimensions = '';
    this.gaMetrics = '';
    this.gaFilters = '';
    this.gaSort = '';
    this.currentWeekStartDate = moment(startDate).format('YYYY-MM-DD');
    this.currentWeekStarting = moment(startDate).format('DD/MM/YYYY');
    this.currentWeekEndDate = moment(endDate).format('YYYY-MM-DD');
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

    //capture execution context to enable usage within functions
    var statsChartContext = this;

    //Make the canvas on the element
    var lineChart = new Chart(statsChartContext.makeCanvas(chartElement)).Line(statsChartContext.chartData, {
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

    //capture execution context to enable usage within functions
    var statsChartContext = this;

    //Make the canvas on the element
    var barChart = new Chart(statsChartContext.makeCanvas(chartElement)).Bar(statsChartContext.chartData, {
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

    //capture execution context to enable usage within functions
    var statsChartContext = this;

    //Make the canvas on the element
    var doughnutChart = new Chart(statsChartContext.makeCanvas(chartElement)).Doughnut(statsChartContext.chartData, {
        percentageInnerCutout: 33,
        animateScale: true,
        legendTemplate: DOUGHNUT_CHART_LEGEND
    });
    document.getElementById(legendElement).innerHTML = doughnutChart.generateLegend();
};


/** 
 *  Class to create a line chart which compares daily values for the specified week
 *  with the week before, and the median values for the previous year 
 */
var WeekToPreviousWeekChart = function (ids, startDate, endDate) {
    "use strict";
    StatsChart.call(this, ids, startDate, endDate);
    this.gaLastYearDimensions = '';
    this.currentWeekData = [];
    this.previousWeekData = [];
    this.lastYearData = [];
    this.lastYearStartDate = moment(endDate).subtract(1, 'years').format('YYYY-MM-DD');
    this.lastYearEndDate = moment(endDate).format('YYYY-MM-DD');
    this.lastWeekStartDate = moment(startDate).subtract(7, 'days').format('YYYY-MM-DD');
    this.lastWeekEndDate = moment(endDate).subtract(7, 'days').format('YYYY-MM-DD');
    this.lastWeekStarting = moment(startDate).subtract(7, 'days').format('DD/MM/YYYY');
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

    //capture execution context to enable usage within functions
    var weekToPreviousWeekContext = this;

    // Object to hold year's data for each weekday
    var dayData = {
            day0: [],
            day1: [],
            day2: [],
            day3: [],
            day4: [],
            day5: [],
            day6: []
        },
        dayLoop;

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
            weekToPreviousWeekContext.lastYearData.push(0);
        } else {
            weekToPreviousWeekContext.lastYearData.push(dayData['day' + (dayLoop % 7)][Math.round(dayData['day' + (dayLoop % 7)].length / 2)]);
        }
    }

};

/**
 * Retrieve the data required from Google Analytics and populate data sets
 * @param {None} 
 * @return {None}.
 */
WeekToPreviousWeekChart.prototype.retrieveGAData = function () {
    "use strict";

    //capture execution context to enable usage within functions
    var weekToPreviousWeekContext = this;

    //Create gaParams object and populate with first query
    var gaParams = {
        'ids': weekToPreviousWeekContext.gaIds,
        'dimensions': weekToPreviousWeekContext.gaLastYearDimensions,
        'metrics': weekToPreviousWeekContext.gaMetrics,
        'start-date': weekToPreviousWeekContext.lastYearStartDate,
        'end-date': weekToPreviousWeekContext.lastYearEndDate,
        'sort': weekToPreviousWeekContext.gaSort
    };

    //Add in filters if present
    if (weekToPreviousWeekContext.gaFilters.length > 0) {
        gaParams.filters = weekToPreviousWeekContext.gaFilters;
    }



    //run GA queries and map data into properties
    return weekToPreviousWeekContext.queryGA(gaParams)
        //process last year's data results
        .then(function (result) {
            weekToPreviousWeekContext.transformLastYearDataToMedians(result);

            return weekToPreviousWeekContext.delayExecution();
        })
        //Retrieve current week data
        .then(function (result) {
            //Redefine gaParams for weekly data
            gaParams = {
                'ids': weekToPreviousWeekContext.gaIds,
                'dimensions': weekToPreviousWeekContext.gaDimensions,
                'metrics': weekToPreviousWeekContext.gaMetrics,
                'start-date': weekToPreviousWeekContext.currentWeekStartDate,
                'end-date': weekToPreviousWeekContext.currentWeekEndDate
            };

            return weekToPreviousWeekContext.queryGA(gaParams);
        })
        //Add results for current week data
        .then(function (result) {
            weekToPreviousWeekContext.currentWeekData = result.rows.map(function (row) {
                return +row[2];
            });

            return weekToPreviousWeekContext.delayExecution();
        })
        //Retrieve previous week data
        .then(function (result) {
            gaParams["start-date"] = weekToPreviousWeekContext.lastWeekStartDate;
            gaParams["end-date"] = weekToPreviousWeekContext.lastWeekEndDate;

            return weekToPreviousWeekContext.queryGA(gaParams);
        })
        //Add results for previous week data
        .then(function (result) {
            weekToPreviousWeekContext.previousWeekData = result.rows.map(function (row) {
                return +row[2];
            });

            //map in labels information
            weekToPreviousWeekContext.labels = result.rows.map(function (row) {
                return +row[0];
            });

            //transform labels to 3 letter name of day of the week 
            weekToPreviousWeekContext.labels = weekToPreviousWeekContext.labels.map(function (label) {
                return moment(label, 'YYYYMMDD').format('ddd');
            });

            return true;
        })
        .catch(function (err) {
            console.log(err.message);
        });

};

/**
 * Set-up the collated data into the format required by chartjs for a line chart - specifcy labels, current and previous year data, and colours
 * @param {None} 
 * @return {None}.
 */
WeekToPreviousWeekChart.prototype.setUpChartData = function () {
    "use strict";

    //capture execution context to enable usage within functions
    var weekToPreviousWeekContext = this;


    //Set-up the chart data ready for rendering
    weekToPreviousWeekContext.chartData = {
        labels: weekToPreviousWeekContext.labels,
        datasets: [{
                //Previous week
                label: 'Week Starting ' + weekToPreviousWeekContext.lastWeekStarting,
                fillColor: weekToPreviousWeekContext.fillColors[0],
                strokeColor: weekToPreviousWeekContext.strokeColors[0],
                pointColor: weekToPreviousWeekContext.strokeColors[0],
                pointStrokeColor: "#fff",
                data: weekToPreviousWeekContext.previousWeekData
                                    },
            {
                //Current week
                label: 'Week Starting ' + weekToPreviousWeekContext.currentWeekStarting,
                fillColor: weekToPreviousWeekContext.fillColors[1],
                strokeColor: weekToPreviousWeekContext.strokeColors[1],
                pointColor: weekToPreviousWeekContext.strokeColors[1],
                pointStrokeColor: "#fff",
                data: weekToPreviousWeekContext.currentWeekData
                                    },
            {
                //Previous year median
                label: 'Median for the Last Year',
                fillColor: weekToPreviousWeekContext.fillColors[2],
                strokeColor: weekToPreviousWeekContext.strokeColors[2],
                pointColor: weekToPreviousWeekContext.strokeColors[2],
                pointStrokeColor: "#fff",
                data: weekToPreviousWeekContext.lastYearData
                                    }]
    };
};

/** 
 *  Class to create a bar chart which compares monthly values for the specified year
 *  to the previous year 
 */
var YearToPreviousYearChart = function (ids, startDate, endDate) {
    "use strict";
    StatsChart.call(this, ids, startDate, endDate);
    this.currentYearData = [];
    this.previousYearData = [];
    this.currentYearStartDate = moment(endDate).date(1).month(0).format('YYYY-MM-DD');
    this.currentYearEndDate = moment(endDate).format('YYYY-MM-DD');
    this.previousYearStartDate = moment(endDate).subtract(1, 'year').date(1).month(0).format('YYYY-MM-DD');
    this.previousYearEndDate = moment(endDate).date(1).month(0).subtract(1, 'day').format('YYYY-MM-DD');
    this.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

};

YearToPreviousYearChart.prototype = Object.create(StatsChart.prototype);
YearToPreviousYearChart.prototype.constructor = YearToPreviousYearChart;

YearToPreviousYearChart.prototype.retrieveGAData = function () {
    "use strict";

    //capture execution context to enable usage within functions
    var yearToPreviousYearContext = this;

    //Create gaParams object and populate with first query
    var gaParams = {
        'ids': yearToPreviousYearContext.gaIds,
        'dimensions': yearToPreviousYearContext.gaDimensions,
        'metrics': yearToPreviousYearContext.gaMetrics,
        'start-date': yearToPreviousYearContext.currentYearStartDate,
        'end-date': yearToPreviousYearContext.currentYearEndDate
    };


    //run GA queries and map data into properties

    //Retrieve data for current year
    return yearToPreviousYearContext.queryGA(gaParams)
        .then(function (result) {
            yearToPreviousYearContext.currentYearData = result.rows.map(function (row) {
                return +row[2];
            });

            return yearToPreviousYearContext.delayExecution();
        })
        .then(function (result) {
            //Previous year data
            gaParams["start-date"] = yearToPreviousYearContext.previousYearStartDate;
            gaParams["end-date"] = yearToPreviousYearContext.previousYearEndDate;

            return yearToPreviousYearContext.queryGA(gaParams);
        })
        .then(function (result) {
            yearToPreviousYearContext.previousYearData = result.rows.map(function (row) {
                return +row[2];
            });

            return true;
        })
        .then(function () {
            return true;
        })
        .catch(function (err) {
            console.log(err.message);
        });
};

/**
 * Set-up the collated data into the format required by chartjs for a bar chart - specifcy labels, current and previous year data, and colours
 * @param {None} 
 * @return {None}.
 */
YearToPreviousYearChart.prototype.setUpChartData = function () {
    "use strict";

    //capture execution context to enable usage within functions
    var yearToPreviousYearContext = this;


    // Ensure the data arrays match the labels array.  If not, add in null values
    // Chart.js bar charts don't accept sparse datasets.

    for (var i = 0, len = yearToPreviousYearContext.labels.length; i < len; i++) {
        if (yearToPreviousYearContext.currentYearData[i] === undefined) {
            yearToPreviousYearContext.currentYearData[i] = null;
        }

        if (yearToPreviousYearContext.previousYearData[i] === undefined) {
            yearToPreviousYearContext.previousYearData[i] = null;
        }
    }


    //Set-up the chart data ready for rendering
    yearToPreviousYearContext.chartData = {
        labels: yearToPreviousYearContext.labels,
        datasets: [{
                label: 'Last Year',
                fillColor: yearToPreviousYearContext.fillColors[0],
                strokeColor: yearToPreviousYearContext.strokeColors[0],
                data: yearToPreviousYearContext.previousYearData
                    },
            {
                label: 'This Year',
                fillColor: yearToPreviousYearContext.fillColors[1],
                strokeColor: yearToPreviousYearContext.strokeColors[1],
                data: yearToPreviousYearContext.currentYearData
                    }]
    };
};

/** 
 *  Class to create a dougnut chart which compares percentages 
 *  for top five values for the week
 */
var WeekDoughnutChart = function (ids, startDate, endDate) {
    "use strict";
    StatsChart.call(this, ids, startDate, endDate);
    this.topFiveData = [];
};

WeekDoughnutChart.prototype = Object.create(StatsChart.prototype);
WeekDoughnutChart.prototype.constructor = WeekDoughnutChart;


/**
 * Retrieve the data required from Google Analytics and populate data sets
 * @param {None} 
 * @return {None}.
 */
WeekDoughnutChart.prototype.retrieveAndSetUpGAData = function () {
    "use strict";

    //capture execution context to enable usage within functions
    var weekDoughnutChartContext = this;

    //Create gaParams object
    var gaParams = {
        'ids': weekDoughnutChartContext.gaIds,
        'dimensions': weekDoughnutChartContext.gaDimensions,
        'metrics': weekDoughnutChartContext.gaMetrics,
        'start-date': weekDoughnutChartContext.currentWeekStartDate,
        'end-date': weekDoughnutChartContext.currentWeekEndDate,
        'sort': weekDoughnutChartContext.gaSort,
        'max-results': 5
    };

    //Add in the filters property if required
    if (weekDoughnutChartContext.gaFilters !== '') {
        gaParams.filters = weekDoughnutChartContext.gaFilters;
    }


    //run GA queries and map data into properties
    return weekDoughnutChartContext.queryGA(gaParams)
        //process results
        .then(function (result) {
            var sumValues = 0;

            if (result.totalResults > 0) {
                //Calculate sum of all page views for percentages
                result.rows.forEach(function (row, i) {
                    sumValues = sumValues + (+row[1]);
                });


                result.rows.forEach(function (row, i) {
                    //Store the value for the top five data
                    weekDoughnutChartContext.topFiveData.push(row[0]);
                    //Add the value into the chart results for rendering

                    weekDoughnutChartContext.chartData.push({
                        value: +row[1],
                        color: weekDoughnutChartContext.fillColors[i],
                        highlight: weekDoughnutChartContext.strokeColors[i],
                        label: row[0] + ': ' + row[1] + ' (' + Math.round(row[1] / sumValues * 100) + '%)'
                    });
                });

            } else {
                weekDoughnutChartContext.chartData.push({
                    value: 1,
                    color: weekDoughnutChartContext.fillColors[0],
                    highlight: weekDoughnutChartContext.strokeColors[0],
                    label: 'No data for selected period'
                });
            }

            return true;
        })
        .catch(function (err) {
            console.log(err.message);
        });

};


/** 
 *  Class to create a dougnut chart which compares percentages 
 *  for the past year
 */
var MonthDoughnutChart = function (ids, startDate, endDate) {
    "use strict";
    StatsChart.call(this, ids, startDate, endDate);
    this.lastMonthStartDate = moment(endDate).subtract(1, 'months').format('YYYY-MM-DD');
    this.lastMonthEndDate = moment(endDate).format('YYYY-MM-DD');
};

MonthDoughnutChart.prototype = Object.create(StatsChart.prototype);
MonthDoughnutChart.prototype.constructor = MonthDoughnutChart;


/**
 * Retrieve the data required from Google Analytics and populate data sets
 * @param {None} 
 * @return {None}.
 */
MonthDoughnutChart.prototype.retrieveAndSetUpGAData = function () {
    "use strict";

    //capture execution context to enable usage within functions
    var MonthDoughnutChartContext = this;

    //Create gaParams object
    var gaParams = {
        'ids': MonthDoughnutChartContext.gaIds,
        'dimensions': MonthDoughnutChartContext.gaDimensions,
        'metrics': MonthDoughnutChartContext.gaMetrics,
        'start-date': MonthDoughnutChartContext.lastMonthStartDate,
        'end-date': MonthDoughnutChartContext.lastMonthEndDate,
        'sort': MonthDoughnutChartContext.gaSort,
        'max-results': 5
    };

    //Add in the filters property if required
    if (MonthDoughnutChartContext.gaFilters !== '') {
        gaParams.filters = MonthDoughnutChartContext.gaFilters;
    }


    //run GA queries and map data into properties
    return MonthDoughnutChartContext.queryGA(gaParams)
        //process results
        .then(function (result) {
            var sumValues = 0;

            if (result.totalResults > 0) {
                //Calculate sum of all page views for percentages
                result.rows.forEach(function (row, i) {
                    sumValues = sumValues + (+row[1]);
                });


                result.rows.forEach(function (row, i) {
                    //Add the value into the chart results for rendering
                    MonthDoughnutChartContext.chartData.push({
                        value: +row[1],
                        color: MonthDoughnutChartContext.fillColors[i],
                        highlight: MonthDoughnutChartContext.strokeColors[i],
                        label: row[0] + ': ' + row[1] + ' (' + Math.round(row[1] / sumValues * 100) + '%)'
                    });
                });

            } else {
                MonthDoughnutChartContext.chartData.push({
                    value: 1,
                    color: MonthDoughnutChartContext.fillColors[0],
                    highlight: MonthDoughnutChartContext.strokeColors[0],
                    label: 'No data for selected period'
                });
            }

            return true;
        })
        .catch(function (err) {
            console.log(err.message);
        });

};


/** 
 *  Class to create a dougnut chart which divides results into 
 *  Within a day, within a week, within a month, within a year, more than a year
 */
var ElapsedTimeDoughnutChart = function (ids, startDate, endDate) {
    "use strict";
    StatsChart.call(this, ids, startDate, endDate);
    this.elapsedTimeStartDate = moment(endDate).subtract(2, 'years').format('YYYY-MM-DD');
    this.elapsedTimeEndDate = moment(endDate).format('YYYY-MM-DD');
    this.withinDay = 0;
    this.withinWeek = 0;
    this.withinMonth = 0;
    this.withinYear = 0;
    this.moreThanYear = 0;
};

ElapsedTimeDoughnutChart.prototype = Object.create(StatsChart.prototype);
ElapsedTimeDoughnutChart.prototype.constructor = MonthDoughnutChart;


/**
 * Retrieve the data required from Google Analytics and populate data sets
 * @param {None} 
 * @return {None}.
 */
ElapsedTimeDoughnutChart.prototype.retrieveAndSetUpGAData = function () {
    "use strict";

    //capture execution context to enable usage within functions
    var MonthDoughnutChartContext = this;

    //Create gaParams object
    var gaParams = {
        'ids': MonthDoughnutChartContext.gaIds,
        'dimensions': MonthDoughnutChartContext.gaDimensions,
        'metrics': MonthDoughnutChartContext.gaMetrics,
        'start-date': MonthDoughnutChartContext.elapsedTimeStartDate,
        'end-date': MonthDoughnutChartContext.elapsedTimeEndDate,
        'sort': MonthDoughnutChartContext.gaSort
    };

    //Add in the filters property if required
    if (MonthDoughnutChartContext.gaFilters !== '') {
        gaParams.filters = MonthDoughnutChartContext.gaFilters;
    }


    //run GA queries and map data into properties
    return MonthDoughnutChartContext.queryGA(gaParams)
        //process results
        .then(function (result) {
            var sumValues = 0;

            if (result.totalResults > 0) {
                result.rows.forEach(function (row, i) {
                    //Check which category the value falls into
                    if ((+row[0]) <= 1) {
                        MonthDoughnutChartContext.withinDay = MonthDoughnutChartContext.withinDay + (+row[1]);
                    } else if ((+row[0]) <= 7) {
                        MonthDoughnutChartContext.withinWeek = MonthDoughnutChartContext.withinWeek + (+row[1]);
                    } else if ((+row[0]) <= 31) {
                        MonthDoughnutChartContext.withinMonth = MonthDoughnutChartContext.withinMonth + (+row[1]);
                    } else if ((+row[0]) <= 365) {
                        MonthDoughnutChartContext.withinYear = MonthDoughnutChartContext.withinYear + (+row[1]);
                    } else {
                        MonthDoughnutChartContext.moreThanYear = MonthDoughnutChartContext.moreThanYear + (+row[1]);
                    }

                    //Add value to the sum of all values to calculate percentages
                    sumValues = sumValues + (+row[1]);
                });

                //Push data values into chart for each type
                MonthDoughnutChartContext.chartData.push({
                    value: MonthDoughnutChartContext.withinDay,
                    color: MonthDoughnutChartContext.fillColors[0],
                    highlight: MonthDoughnutChartContext.strokeColors[0],
                    label: 'Within a day: ' + MonthDoughnutChartContext.withinDay + ' (' + Math.round(MonthDoughnutChartContext.withinDay / sumValues * 100) + '%)'
                });

                MonthDoughnutChartContext.chartData.push({
                    value: MonthDoughnutChartContext.withinWeek,
                    color: MonthDoughnutChartContext.fillColors[1],
                    highlight: MonthDoughnutChartContext.strokeColors[1],
                    label: 'Within a week: ' + MonthDoughnutChartContext.withinWeek + ' (' + Math.round(MonthDoughnutChartContext.withinWeek / sumValues * 100) + '%)'
                });

                MonthDoughnutChartContext.chartData.push({
                    value: MonthDoughnutChartContext.withinMonth,
                    color: MonthDoughnutChartContext.fillColors[2],
                    highlight: MonthDoughnutChartContext.strokeColors[2],
                    label: 'Within a month: ' + MonthDoughnutChartContext.withinMonth + ' (' + Math.round(MonthDoughnutChartContext.withinMonth / sumValues * 100) + '%)'
                });

                MonthDoughnutChartContext.chartData.push({
                    value: MonthDoughnutChartContext.withinYear,
                    color: MonthDoughnutChartContext.fillColors[3],
                    highlight: MonthDoughnutChartContext.strokeColors[3],
                    label: 'Within a year: ' + MonthDoughnutChartContext.withinYear + ' (' + Math.round(MonthDoughnutChartContext.withinYear / sumValues * 100) + '%)'
                });

                MonthDoughnutChartContext.chartData.push({
                    value: MonthDoughnutChartContext.moreThanYear,
                    color: MonthDoughnutChartContext.fillColors[4],
                    highlight: MonthDoughnutChartContext.strokeColors[4],
                    label: 'More than a year: ' + MonthDoughnutChartContext.moreThanYear + ' (' + Math.round(MonthDoughnutChartContext.moreThanYear / sumValues * 100) + '%)'
                });



            } else {
                MonthDoughnutChartContext.chartData.push({
                    value: 1,
                    color: MonthDoughnutChartContext.fillColors[0],
                    highlight: MonthDoughnutChartContext.strokeColors[0],
                    label: 'No data for selected period'
                });
            }

            return true;
        })
        .catch(function (err) {
            console.log(err.message);
        });

};


/** 
 *  Class to create a quarterly line chart which compares aggregate values
 *  for each quarter for a one year period
 */
var QuarterlyChart = function (ids, startDate, endDate, queryElement, topFiveData) {
    "use strict";

    StatsChart.call(this, ids, startDate, endDate);
    this.queryPrefix = '';
    this.pageQuery = '';
    this.pageData = {};
    this.monthLabels = [];
    this.periodDates = [];
    this.searchValues = [];
    this.gaQueryElement = queryElement;

    if (topFiveData.length > 0) {
        this.searchValues = topFiveData;
    }

};

QuarterlyChart.prototype = Object.create(StatsChart.prototype);
QuarterlyChart.prototype.constructor = YearToPreviousYearChart;

/**
 * Retrieve the top 5 values for the data element for the last 2 years
 * of data.
 * @param {string} queryElement the GA name of the field to search
 * @return {boolean} returns true so that it can be used with promise chaining to wait for the result.
 */
QuarterlyChart.prototype.retrieveTopFive = function () {
    "use strict";

    //capture execution context to enable usage within functions
    var quarterlyChartContext = this;

    //Create gaParams object with query vals
    var gaParams = {
        'ids': quarterlyChartContext.gaIds,
        'dimensions': quarterlyChartContext.gaDimensions,
        'metrics': quarterlyChartContext.gaMetrics,
        'start-date': moment().subtract(2, 'years').format('YYYY-MM-DD'),
        'end-date': moment().format('YYYY-MM-DD'),
        'sort': '-ga:pageviews',
        'max-results': 5
    };

    //Add in the filters if required
    if (quarterlyChartContext.gaFilters !== '') {
        gaParams.filters = quarterlyChartContext.gaFilters;
    }

    //Check if there is data in the search values, if so return immediately
    if (quarterlyChartContext.searchValues.length === 0) {
        /*run query for previous 2 years*/
        return quarterlyChartContext.queryGA(gaParams)
            .then(function (result) {
                if (result.totalResults > 0) {
                    result.rows.forEach(function (row, i) {
                        quarterlyChartContext.searchValues.push(row[0]);
                    });
                }
            })
            .catch(function (err) {
                console.log(err.message);
                return false;
            });
    }

    return quarterlyChartContext.delayExecution();

};

/**
 * Using the top 5 values for the GA dimension, build the GA query string, dates for each quarter,
 * and labels for each quarter.
 * @param {none} 
 * @return {boolean} returns true so that it can be used with promise chaining to wait for the result.
 */
QuarterlyChart.prototype.buildQueryAndLabels = function () {
    "use strict";

    //capture execution context to enable usage within functions
    var quarterlyChartContext = this;

    /* Use searchElement and searchValues to build query
     *  and initialise arrays for holding the data
     */

    //If a special prefix is required, add it to the start of the query
    if (quarterlyChartContext.queryPrefix !== '') {
        quarterlyChartContext.pageQuery = quarterlyChartContext.queryPrefix;
    }

    quarterlyChartContext.searchValues.forEach(function (element, index, array) {
        //Add page to query string
        if (index > 0) {
            quarterlyChartContext.pageQuery = quarterlyChartContext.pageQuery + ',';
        }

        quarterlyChartContext.pageQuery = quarterlyChartContext.pageQuery + 'ga:' + quarterlyChartContext.gaQueryElement + '==' + element;

        //Initialise array to hold values for page
        quarterlyChartContext.pageData['val' + index] = [];
    });

    /**Build month labels and time periods for 4 query periods
     * 1st day of 12 months ago - last day of 10 months ago
     * 1st day of 9 months ago - last day of 7 months ago
     * 1st day of 6 months ago - last day of 4 months ago
     * 1st day of 3 months ago - last day of last month
     */
    for (var qCalculator = 3, dataCounter = 0; qCalculator >= 0; qCalculator--, dataCounter++) {
        quarterlyChartContext.monthLabels.push(moment(quarterlyChartContext.endDate).subtract((qCalculator * 3) + 3, 'months').date(1).format('MMM') + '-' +
            moment(quarterlyChartContext.endDate).subtract((qCalculator * 3) + 1, 'months').date(1).format('MMM'));

        quarterlyChartContext.periodDates.push(moment(quarterlyChartContext.endDate).subtract((qCalculator * 3) + 3, 'months').date(1).format('YYYY-MM-DD'));
        quarterlyChartContext.periodDates.push(moment(quarterlyChartContext.endDate).subtract((qCalculator * 3), 'months').date(1).subtract(1, 'days').format('YYYY-MM-DD'));
    }

    return true;
};

QuarterlyChart.prototype.retrieveGAData = function () {
    "use strict";

    //capture execution context to enable usage within functions
    var quarterlyChartContext = this;

    //Create gaParams object with first query vals
    var gaParams = {
        'ids': quarterlyChartContext.gaIds,
        'dimensions': quarterlyChartContext.gaDimensions,
        'metrics': quarterlyChartContext.gaMetrics,
        'filters': quarterlyChartContext.pageQuery,
        'start-date': quarterlyChartContext.periodDates[0],
        'end-date': quarterlyChartContext.periodDates[1]
    };

    //run GA queries and map data into properties
    return quarterlyChartContext.queryGA(gaParams)
        .then(function (result) {
            quarterlyChartContext.processQuarterlyResults(result);
            return quarterlyChartContext.delayExecution();
        })
        .then(function (result) {
            gaParams["start-date"] = quarterlyChartContext.periodDates[2];
            gaParams["end-date"] = quarterlyChartContext.periodDates[3];
            return quarterlyChartContext.queryGA(gaParams);
        })
        .then(function (result) {
            quarterlyChartContext.processQuarterlyResults(result);
            return quarterlyChartContext.delayExecution();
        })
        .then(function (result) {
            gaParams["start-date"] = quarterlyChartContext.periodDates[4];
            gaParams["end-date"] = quarterlyChartContext.periodDates[5];
            return quarterlyChartContext.queryGA(gaParams);
        })
        .then(function (result) {
            quarterlyChartContext.processQuarterlyResults(result);
            return quarterlyChartContext.delayExecution();
        })
        .then(function (result) {
            gaParams["start-date"] = quarterlyChartContext.periodDates[6];
            gaParams["end-date"] = quarterlyChartContext.periodDates[7];
            return quarterlyChartContext.queryGA(gaParams);
        })
        .then(function (result) {
            quarterlyChartContext.processQuarterlyResults(result);
            return true;
        })
        .catch(function (err) {
            console.log(err.message);
        });
};

/** 
 * Processes results for quarterly query.  Takes each result and finds its position in the searchValues
 * array, then maps in the value to the pageData set.  It then sums all the values, enters 0s
 * for missing values and converts each value to a percentage.
 * @param {object} results The results return by the GA query 
 * @return {boolean} returns true so that it can be used with promise chaining to wait for the result.
 */

QuarterlyChart.prototype.processQuarterlyResults = function (results) {
    "use strict";

    //capture execution context to enable usage within functions
    var quarterlyChartContext = this;

    //Check that results have values
    if (results !== undefined) {

        //initially set all searchValues to not being found in results
        var valsFound = [];

        quarterlyChartContext.searchValues.forEach(function (element, index, array) {
            valsFound.push(false);
        });

        //Find the current length of array depending on which quarter is being processed, 0 = First quarter, 1 = Second quarter ...
        var quarterNum = quarterlyChartContext.pageData.val0.length;


        //iterate through results, map in values and set the value as being found
        if (results.totalResults > 0) {
            results.rows.forEach(function (row, r) {

                //Find the position of the returned value in the searchValues
                var referencePos = quarterlyChartContext.searchValues.indexOf(row[0]);

                if (referencePos > -1) {
                    //set value has been found
                    valsFound[referencePos] = true;

                    //add in data to the value in array for this quarter
                    quarterlyChartContext.pageData['val' + referencePos][quarterNum] = (+row[1]);
                }
            });
        }

        /** check for any missing values.  If no value is present, then add in 0
         *  If values are present, sum them up for total across top 5 
         */
        var sumValues = 0;

        quarterlyChartContext.searchValues.forEach(function (element, index, array) {
            if (valsFound[index] === false)
                quarterlyChartContext.pageData['val' + index].push(0);
            else
                sumValues = sumValues + quarterlyChartContext.pageData['val' + index][quarterNum];
        });

        /** Adjust each value to make it a percentage of the total rather
         *  than the raw number.  This allows comparisons over time
         *  periods where there is a large variation in the raw numbers.
         */
        if (sumValues > 0) {
            quarterlyChartContext.searchValues.forEach(function (element, index, array) {
                quarterlyChartContext.pageData['val' + index][quarterNum] = (quarterlyChartContext.pageData['val' + index][quarterNum] / sumValues * 100).toFixed(2);
            });
        }
    }

    return true;
};

QuarterlyChart.prototype.setUpChartData = function () {
    "use strict";

    //capture execution context to enable usage within functions
    var quarterlyChartContext = this;

    //Set-up the chart data ready for rendering
    quarterlyChartContext.chartData = {
        labels: quarterlyChartContext.monthLabels,
        datasets: []
    };

    quarterlyChartContext.searchValues.forEach(function (element, index, array) {
        //Build data set for each page
        quarterlyChartContext.chartData.datasets[index] = {
            label: element,
            fillColor: quarterlyChartContext.fillColors[index],
            strokeColor: quarterlyChartContext.strokeColors[index],
            pointColor: quarterlyChartContext.strokeColors[index],
            pointStrokeColor: "#fff",
            data: quarterlyChartContext.pageData['val' + index]
        };
    });
};

/** 
 *  Class to retrieve and parse GA activity data 
 *  
 */
var ActivityData = function (ids, startDate, endDate) {
    "use strict";

    StatsChart.call(this, ids, startDate, endDate);

    this.previousWeekStartDate = moment(startDate).subtract(7, 'days').format('YYYY-MM-DD');
    this.previousWeekEndDate = moment(endDate).subtract(7, 'days').format('YYYY-MM-DD');
    this.previousWeekStarting = moment(this.previousWeekStartDate).format('DD/MM/YYYY');

    this.lastYearStartDate = moment(endDate).subtract(1, 'years').format('YYYY-MM-DD');
    this.lastYearEndDate = moment(endDate).format('YYYY-MM-DD');


    //Values for determining which applicaion triggered a GA event
    this.applicationCategories = {
        lassi: ['LASSI-Search', 'LASSI-tool-bar-button'],
        historicalAerialPhotographs: ['OHAP-Search', 'OHAP-tool-bar-button'],
        smes: ['SMES-Search', 'SMES-tool-bar-button'],
        lassiSpear: ['SPEAR-Search', 'SPEAR-tool-bar-button'],
        vicnames: ['VICNAMES-Search', 'VICNAMES-tool-bar-button'],
        viewMyTitles: ['VMT-Search', 'VMT-tool-bar-button'],
        tpi: ['TPC-tool-bar-button']
    };

    //Values for classifying GA events into specific categories
    this.applicationActivities = {
        searchCategories: ['LASSI-Search', 'OHAP-Search', 'SMES-Search', 'SPEAR-Search', 'VICNAMES-Search', 'VMT-Search'],
        panAndZoomLabels: ['Pan: Drag cursor or hold shift key and drag cursor to zoom', 'Zoom In', 'Zoom Out', 'Zoom to Full Extent',
                                                        'Zoom to Greater Melbourne', 'Zoom to Scale'],
        retrieveInformationLabels: ['Add Mark to selection', 'Clear Selection List', 'Display Mark Selection List Window', 'Historical Information',
                                                                'Identify Aerial Photograph', 'Identify Property', 'Identify Survey Labels', 'Identify Survey Marks',
                                                                'Parcel information: click on map'],
        mapBasedSelectLabels: ['Select Parcel', 'Unselect Parcel', 'Complete Selection'],
        mapToolsLabels: ['Markup tools', 'Measure Area', 'Measure Distance', 'Clear Highlight', 'Street View: click on map'],
        saveLabels: ['Save Geo-Referenced Image', 'Save Image'],
        printLabels: ['Print Map'],
        downloadLabels: ['Activate Document Download Tab', 'Draw Polygon to Export Survey Information to LandXML'],
        administerLabels: ['Add Labels', 'Administration', 'Administrator functions', 'Broadcast Message', 'Delete Labels', 'Edit Labels',
                                                        'Export property information', 'Mark Maintenance']
    };

    //Create specific data elements to hold data for each chart
    this.overallActivityData = {
        Current: {},
        Previous: {},
        Year: {}
    };

    this.overallSearchBreakdownData = {
        Current: {},
        Previous: {},
        Year: {}
    };

    this.applicationActivityData = {
        Current: {
            'LASSI General': {},
            'Historical Aerial Photographs': {},
            'SMES': {},
            'LASSI SPEAR Including Map Based Search': {},
            'VICNAMES': {},
            'View My Titles': {},
            'TPI Confirm on Map': {}
        },
        Previous: {
            'LASSI General': {},
            'Historical Aerial Photographs': {},
            'SMES': {},
            'LASSI SPEAR Including Map Based Search': {},
            'VICNAMES': {},
            'View My Titles': {},
            'TPI Confirm on Map': {}
        },
        Year: {
            'LASSI General': {},
            'Historical Aerial Photographs': {},
            'SMES': {},
            'LASSI SPEAR Including Map Based Search': {},
            'VICNAMES': {},
            'View My Titles': {},
            'TPI Confirm on Map': {}
        }
    };

    this.applicationSearchBreakdownData = {
        Current: {
            'LASSI General': {},
            'Historical Aerial Photographs': {},
            'SMES': {},
            'LASSI SPEAR Including Map Based Search': {},
            'VICNAMES': {},
            'View My Titles': {},
            'TPI Confirm on Map': {}
        },
        Previous: {
            'LASSI General': {},
            'Historical Aerial Photographs': {},
            'SMES': {},
            'LASSI SPEAR Including Map Based Search': {},
            'VICNAMES': {},
            'View My Titles': {},
            'TPI Confirm on Map': {}
        },
        Year: {
            'LASSI General': {},
            'Historical Aerial Photographs': {},
            'SMES': {},
            'LASSI SPEAR Including Map Based Search': {},
            'VICNAMES': {},
            'View My Titles': {},
            'TPI Confirm on Map': {}
        }
    };



};

ActivityData.prototype = Object.create(StatsChart.prototype);
ActivityData.prototype.constructor = ActivityData;

/**
 * Determine which application this value is for
 * @param {String} categoryValue - the look-up value
 * @return {String} the string value for the application name
 */

ActivityData.prototype.determineApplication = function (categoryValue) {
    "use strict";

    //capture execution context to enable usage within functions
    var activityDataContext = this;

    if (activityDataContext.applicationCategories.lassi.indexOf(categoryValue) >= 0) {
        return 'LASSI General';
    } else if (activityDataContext.applicationCategories.historicalAerialPhotographs.indexOf(categoryValue) >= 0) {
        return 'Historical Aerial Photographs';
    } else if (activityDataContext.applicationCategories.smes.indexOf(categoryValue) >= 0) {
        return 'SMES';
    } else if (activityDataContext.applicationCategories.lassiSpear.indexOf(categoryValue) >= 0) {
        return 'LASSI SPEAR Including Map Based Search';
    } else if (activityDataContext.applicationCategories.vicnames.indexOf(categoryValue) >= 0) {
        return 'VICNAMES';
    } else if (activityDataContext.applicationCategories.viewMyTitles.indexOf(categoryValue) >= 0) {
        return 'View My Titles';
    } else if (activityDataContext.applicationCategories.tpi.indexOf(categoryValue) >= 0) {
        return 'TPI Confirm on Map';
    }

};

/**
 * Determine which type of event has occurred
 * @params {String} categoryValue, eventLabelValue - the look-up values to determine the activity type
 * @return {String} the string value for the activity type
 */

ActivityData.prototype.determineActivity = function (categoryValue, eventLabelValue) {
    "use strict";

    //capture execution context to enable usage within functions
    var activityDataContext = this;

    //Search predefined values to determine which class of activity was performed and return readable string
    if (activityDataContext.applicationActivities.searchCategories.indexOf(categoryValue) >= 0) {
        return 'Search';
    } else if (activityDataContext.applicationActivities.panAndZoomLabels.indexOf(eventLabelValue) >= 0) {
        return 'Pan and Zoom';
    } else if (activityDataContext.applicationActivities.retrieveInformationLabels.indexOf(eventLabelValue) >= 0) {
        return 'Retrieve Information';
    } else if (activityDataContext.applicationActivities.mapBasedSelectLabels.indexOf(eventLabelValue) >= 0) {
        return 'Map Based Parcel Select';
    } else if (activityDataContext.applicationActivities.mapToolsLabels.indexOf(eventLabelValue) >= 0) {
        return 'Map Tools';
    } else if (activityDataContext.applicationActivities.saveLabels.indexOf(eventLabelValue) >= 0) {
        return 'Save Image';
    } else if (activityDataContext.applicationActivities.printLabels.indexOf(eventLabelValue) >= 0) {
        return 'Print Map';
    } else if (activityDataContext.applicationActivities.downloadLabels.indexOf(eventLabelValue) >= 0) {
        return 'Download Data';
    } else if (activityDataContext.applicationActivities.administerLabels.indexOf(eventLabelValue) >= 0) {
        return 'Administer Data';
    }

};

/**
 * Retrieve the data required from Google Analytics and populate data sets
 * @param {None} 
 * @return {None}.
 */
ActivityData.prototype.retrieveAndParseGAData = function () {
    "use strict";

    //capture execution context to enable usage within functions
    var activityDataContext = this;

    //Create gaParams object
    var gaParams = {
        'ids': activityDataContext.gaIds,
        'dimensions': activityDataContext.gaDimensions,
        'metrics': activityDataContext.gaMetrics,
        'start-date': activityDataContext.currentWeekStartDate,
        'end-date': activityDataContext.currentWeekEndDate
    };



    //run GA queries and map data into properties
    return activityDataContext.queryGA(gaParams)
        //process results
        .then(function (result) {
            var sumValues = 0;
            //Check for results and a specific return which GA gives for no data on a query of events
            if (result.totalResults > 0 && result.rows[0][0] !== 'to use this feature visit: EVENT-TRACKING.COM') {
                activityDataContext.parseActivityData(result, 'Current');
            }

            return activityDataContext.delayExecution();
        })
        .then(function (result) {
            var gaParams = {
                'ids': activityDataContext.gaIds,
                'dimensions': activityDataContext.gaDimensions,
                'metrics': activityDataContext.gaMetrics,
                'start-date': activityDataContext.lastWeekStartDate,
                'end-date': activityDataContext.lastWeekEndDate
            };

            return activityDataContext.queryGA(gaParams);
        })
        .then(function (result) {
            var sumValues = 0;
            //Check for results and a specific return which GA gives for no data on a query of events
            if (result.totalResults > 0 && result.rows[0][0] !== 'to use this feature visit: EVENT-TRACKING.COM') {
                activityDataContext.parseActivityData(result, 'Previous');
            }

            return activityDataContext.delayExecution();
        })
        .then(function (result) {
            var gaParams = {
                'ids': activityDataContext.gaIds,
                'dimensions': activityDataContext.gaDimensions,
                'metrics': activityDataContext.gaMetrics,
                'start-date': activityDataContext.lastYearStartDate,
                'end-date': activityDataContext.lastYearEndDate
            };

            return activityDataContext.queryGA(gaParams);
        })
        .then(function (result) {
            var sumValues = 0;
            //Check for results and a specific return which GA gives for no data on a query of events
            if (result.totalResults > 0 && result.rows[0][0] !== 'to use this feature visit: EVENT-TRACKING.COM') {
                activityDataContext.parseActivityData(result, 'Year');
            }

            return true;
        })
        .catch(function (err) {
            console.log(err.message);
        });

};


ActivityData.prototype.parseActivityData = function (results, dataType) {
    "use strict";

    //capture execution context to enable usage within functions
    var activityDataContext = this;


    //Work through each result and add value to appropriate         
    results.rows.forEach(function (row, r) {

        //Rows have the following elements, 0 - Event Category, 1 - event Label, 2 - Number of Events
        var application = activityDataContext.determineApplication(row[0]);
        var activity = activityDataContext.determineActivity(row[0], row[1]);


        //Make sure the data returned is for an activity within our data set
        if (application !== undefined && activity !== undefined) {

            //If this is the current week, that will be the basis for all three data sets, set the types and required properties now
            if (dataType === "Current" && activityDataContext.overallActivityData.Current[activity] === undefined) {
                activityDataContext.overallActivityData.Current[activity] = 0;
                activityDataContext.overallActivityData.Previous[activity] = 0;
                activityDataContext.overallActivityData.Year[activity] = 0;
            }

            if (dataType === "Current" && activityDataContext.applicationActivityData.Current[application] === undefined) {
                activityDataContext.applicationActivityData.Current[application] = {};
                activityDataContext.applicationActivityData.Previous[application] = {};
                activityDataContext.applicationActivityData.Year[application] = {};
            }


            if (dataType === "Current" && activityDataContext.applicationActivityData.Current[application][activity] === undefined) {
                activityDataContext.applicationActivityData.Current[application][activity] = 0;
                activityDataContext.applicationActivityData.Previous[application][activity] = 0;
                activityDataContext.applicationActivityData.Year[application][activity] = 0;
            }



            //Check property exists, then add overall activity value
            if (activityDataContext.overallActivityData[dataType][activity] !== undefined) {
                activityDataContext.overallActivityData[dataType][activity] += (+row[2]);
            }

            //Check property exists, then Add value to specific application activity values
            if (activityDataContext.applicationActivityData[dataType][application][activity] !== undefined) {
                activityDataContext.applicationActivityData[dataType][application][activity] += (+row[2]);
            }



            //Check if this is a search activity - add search breakdown figures as well
            if (activity === 'Search') {
                //Ensure all required properties exist with a value of at least 0
                if (dataType === "Current" && activityDataContext.overallSearchBreakdownData.Current[row[1]] === undefined) {
                    activityDataContext.overallSearchBreakdownData.Current[row[1]] = 0;
                    activityDataContext.overallSearchBreakdownData.Previous[row[1]] = 0;
                    activityDataContext.overallSearchBreakdownData.Year[row[1]] = 0;
                }

                if (dataType === "Current" && activityDataContext.applicationSearchBreakdownData.Current[application] === undefined) {
                    activityDataContext.applicationSearchBreakdownData.Current[application] = {};
                    activityDataContext.applicationSearchBreakdownData.Previous[application] = {};
                    activityDataContext.applicationSearchBreakdownData.Year[application] = {};
                }

                if (dataType === "Current" && activityDataContext.applicationSearchBreakdownData.Current[application][row[1]] === undefined) {
                    activityDataContext.applicationSearchBreakdownData.Current[application][row[1]] = 0;
                    activityDataContext.applicationSearchBreakdownData.Previous[application][row[1]] = 0;
                    activityDataContext.applicationSearchBreakdownData.Year[application][row[1]] = 0;
                }

                //Check property exists, then add value to overall search type numbers
                if (activityDataContext.overallSearchBreakdownData[dataType][row[1]] !== undefined) {
                    activityDataContext.overallSearchBreakdownData[dataType][row[1]] += (+row[2]);
                }


                //Check property exists, then add value to specific application search type numbers
                if (activityDataContext.applicationSearchBreakdownData[dataType][application][row[1]] !== undefined) {
                    activityDataContext.applicationSearchBreakdownData[dataType][application][row[1]] += (+row[2]);
                }
            }
        }

    });


};

/**
 * Prepare Doughnut chart data for a data set for information 
 * @param {object} the chart data to render
 * @return {None}.
 */

ActivityData.prototype.prepareDoughnutChartData = function (renderChartData) {
    "use strict";

    var objProp, sumValues = 0,
        valueCounter = 0;

    //capture execution context to enable usage within functions
    var activityDataContext = this;

    //The same data set can be used for multiple charts so reset the chartData array to empty
    activityDataContext.chartData = [];

    //Calculate sum of all activity numbers for percentages
    for (objProp in renderChartData) {
        sumValues = sumValues + renderChartData[objProp];
    }

    //Check if the sum of values is greater than 0
    if (sumValues > 0) {
        //Loop through again to provide the actual values 
        for (objProp in renderChartData) {
            activityDataContext.chartData.push({
                value: renderChartData[objProp],
                color: activityDataContext.fillColors[valueCounter],
                highlight: activityDataContext.strokeColors[valueCounter],
                label: objProp + ': ' + renderChartData[objProp] + ' (' + Math.round(renderChartData[objProp] / sumValues * 100) + '%)'
            });

            valueCounter++;
        }
    } else {
        //No data present fill with dummy values
        activityDataContext.chartData.push({
            value: 1,
            color: activityDataContext.fillColors[0],
            highlight: activityDataContext.strokeColors[0],
            label: 'No data for selected period'
        });
    }


    return true;

};

/**
 * Prepare bar chart data for a data set for current week, previous week and previous year
 * @param {object} the overall chart data to render
 * @return {None}.
 */

ActivityData.prototype.prepareBarChartData = function (renderChartDataCurrent, renderChartDataPrevious, renderChartDataYear) {
    "use strict";

    var objProp, sumValues = 0;

    //capture execution context to enable usage within functions
    var activityDataContext = this;

    //The same data set can be used for multiple charts so reset the chartData array to empty
    activityDataContext.chartData = {};
    activityDataContext.chartData.labels = [];
    activityDataContext.chartData.datasets = [];

    //Calculate sum of all activity numbers for percentages
    for (objProp in renderChartDataCurrent) {
        sumValues = sumValues + renderChartDataCurrent[objProp];
        activityDataContext.chartData.labels.push(objProp);
    }

    for (objProp in renderChartDataPrevious) {
        sumValues = sumValues + renderChartDataPrevious[objProp];
    }

    for (objProp in renderChartDataYear) {
        sumValues = sumValues + renderChartDataYear[objProp];
    }


    //Check if the sum of values is greater than 0
    if (sumValues > 0) {
        //Loop through again to convert actual values to percentages
        for (objProp in renderChartDataCurrent) {
            renderChartDataCurrent[objProp] = Math.round(renderChartDataCurrent[objProp] / sumValues * 100);
        }

        for (objProp in renderChartDataPrevious) {
            renderChartDataPrevious[objProp] = Math.round(renderChartDataPrevious[objProp] / sumValues * 100);
        }

        for (objProp in renderChartDataYear) {
            renderChartDataYear[objProp] = Math.round(renderChartDataYear[objProp] / sumValues * 100);
        }


        activityDataContext.chartData.datasets.push({
            label: 'Week Starting ' + activityDataContext.currentWeekStarting,
            fillColor: activityDataContext.fillColors[0],
            strokeColor: activityDataContext.strokeColors[0],
            pointColor: activityDataContext.strokeColors[0],
            pointStrokeColor: "#fff",
            data: renderChartDataCurrent
        }, {
            label: 'Week Starting ' + activityDataContext.previousWeekStarting,
            fillColor: activityDataContext.fillColors[1],
            strokeColor: activityDataContext.strokeColors[1],
            pointColor: activityDataContext.strokeColors[1],
            pointStrokeColor: "#fff",
            data: renderChartDataPrevious
        }, {
            label: 'The Last Year',
            fillColor: activityDataContext.fillColors[2],
            strokeColor: activityDataContext.strokeColors[2],
            pointColor: activityDataContext.strokeColors[2],
            pointStrokeColor: "#fff",
            data: renderChartDataYear
        });
    } else {
        //No data present fill with dummy values
        activityDataContext.chartData.datasets.push({
            data: 1,
            color: activityDataContext.fillColors[0],
            highlight: activityDataContext.strokeColors[0],
            label: 'No data for selected period'
        });
    }


    return true;

};
