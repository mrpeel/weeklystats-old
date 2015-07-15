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
    this.fillColors = [     'rgba(115,115,115,0.33)', 'rgba(241,90,96,0.33)', 'rgba(122,195,106,0.33)', 'rgba(90,155,212,0.33)', 'rgba(250,167,91,0.33)', 'rgba(158,103,171,0.33)',
                            'rgba(193,254,227,0.33)', 'rgba(215,127,80,0.33)'];
    this.strokeColors = [   'rgba(115,115,115,1)', 'rgba(241,90,96,1)', 'rgba(122,195,106,1)', 'rgba(90,155,212,1)', 'rgba(250,167,91,1)', 'rgba(158,103,171,1)',
                            'rgba(193,254,227,1)', 'rgba(215,127,80,1)'];
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
    this.lastWeekStarting =  moment(startDate).subtract(7, 'days').format('DD/MM/YYYY');
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
    var dayData = { day0: [],
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
            this.lastYearData.push(0);
        } else {
            this.lastYearData.push(dayData['day' + (dayLoop % 7)][Math.round(dayData['day' + (dayLoop % 7)].length / 2)]);
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
    
    //run GA queries and map data into properties
   return weekToPreviousWeekContext.queryGA({
        'ids': weekToPreviousWeekContext.gaIds,
        'dimensions': weekToPreviousWeekContext.gaLastYearDimensions,
        'metrics': weekToPreviousWeekContext.gaMetrics,
        'filters': weekToPreviousWeekContext.gaFilters,
        'start-date': weekToPreviousWeekContext.lastYearStartDate,
        'end-date': weekToPreviousWeekContext.lastYearEndDate,
        'sort': weekToPreviousWeekContext.gaSort
        })
            //process last year's data results
            .then(function(result) {
                weekToPreviousWeekContext.transformLastYearDataToMedians(result);
                
                return weekToPreviousWeekContext.delayExecution();
            })
            //Retrieve current week data
            .then(function(result) {  
                return weekToPreviousWeekContext.queryGA({
                    'ids': weekToPreviousWeekContext.gaIds,
                    'dimensions': weekToPreviousWeekContext.gaDimensions,
                    'metrics': weekToPreviousWeekContext.gaMetrics,
                    'start-date': weekToPreviousWeekContext.currentWeekStartDate,
                    'end-date': weekToPreviousWeekContext.currentWeekEndDate
                });
            })
            //Add results for current week data
            .then(function(result) {
                weekToPreviousWeekContext.currentWeekData = result.rows.map(function(row) {
                    return +row[2];
                });
        
                return weekToPreviousWeekContext.delayExecution();
            })
            //Retrieve previous week data
            .then(function(result) {
                return weekToPreviousWeekContext.queryGA({
                    'ids': weekToPreviousWeekContext.gaIds,
                    'dimensions': weekToPreviousWeekContext.gaDimensions,
                    'metrics': weekToPreviousWeekContext.gaMetrics,
                    'start-date': weekToPreviousWeekContext.lastWeekStartDate,
                    'end-date': weekToPreviousWeekContext.lastWeekEndDate
                });
            })
            //Add results for previous week data
            .then(function(result) {
                weekToPreviousWeekContext.previousWeekData = result.rows.map(function(row) {
                    return +row[2];
                });
        
                //map in labels information
                weekToPreviousWeekContext.labels = result.rows.map(function(row) {
                    return +row[0];
                });
        
                //transform labels to 3 letter name of day of the week 
                weekToPreviousWeekContext.labels = weekToPreviousWeekContext.labels.map(function(label) {
                    return moment(label, 'YYYYMMDD').format('ddd');
                });
            
                return true;
            })
            .catch(function(err) {
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
    
    //Set-up the chart data ready for rendering
    this.chartData = {  labels: this.labels,
                        datasets: [{
                                    //Previous week
                                    label: 'Week Starting ' + this.lastWeekStarting,
                                    fillColor: this.fillColors[0],
                                    strokeColor: this.strokeColors[0],
                                    pointColor: this.strokeColors[0],
                                    pointStrokeColor: "#fff",
                                    data: this.previousWeekData
                                    }, 
                                   {
                                    //Current week
                                    label: 'Week Starting ' + this.currentWeekStarting,
                                    fillColor: this.fillColors[1],
                                    strokeColor: this.strokeColors[1],
                                    pointColor: this.strokeColors[1],
                                    pointStrokeColor: "#fff",
                                    data: this.currentWeekData
                                    }, 
                                   {
                                    //Previous year median
                                    label: 'Median for the Last Year',
                                    fillColor: this.fillColors[2],
                                    strokeColor: this.strokeColors[2],
                                    pointColor: this.strokeColors[2],
                                    pointStrokeColor: "#fff",
                                    data: this.lastYearData
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
    this.labels = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
    
};

YearToPreviousYearChart.prototype = Object.create(StatsChart.prototype);
YearToPreviousYearChart.prototype.constructor = YearToPreviousYearChart;

YearToPreviousYearChart.prototype.retrieveGAData = function () {
    "use strict";

    //capture execution context to enable usage within functions
    var yearToPreviousYearContext = this;
    
    //run GA queries and map data into properties

    //Retrieve data for current year
    return yearToPreviousYearContext.queryGA({
            'ids': yearToPreviousYearContext.gaIds,
            'dimensions': yearToPreviousYearContext.gaDimensions ,
            'metrics': yearToPreviousYearContext.gaMetrics,
            'start-date': yearToPreviousYearContext.currentYearStartDate,
            'end-date': yearToPreviousYearContext.currentYearEndDate
        })
        .then(function(result) {
            yearToPreviousYearContext.currentYearData = result.rows.map(function(row) {
                return +row[2];
            });
            
            return yearToPreviousYearContext.delayExecution();
        })
        .then(function(result) {
            //Previous year data
            return yearToPreviousYearContext.queryGA({
                'ids': yearToPreviousYearContext.gaIds,
                'dimensions': yearToPreviousYearContext.gaDimensions,
                'metrics': yearToPreviousYearContext.gaMetrics,
                'start-date': yearToPreviousYearContext.previousYearStartDate,
                'end-date': yearToPreviousYearContext.previousYearEndDate
            });
        })
        .then(function(result) {
            yearToPreviousYearContext.previousYearData = result.rows.map(function(row) {
                return +row[2];
            });
            
            //Set-up data then render chart
            yearToPreviousYearContext.setUpChartData();
            yearToPreviousYearContext.createBarChart('monthly-session-chart-container', 'monthly-session-legend-container');

            return yearToPreviousYearContext.delayExecution();
        })
        .then(function(){
            return true;
        })
        .catch(function(err) {
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
    // Ensure the data arrays match the labels array.  If not, add in null values
    // Chart.js bar charts don't accept sparse datasets.

    for (var i = 0, len = this.labels.length; i < len; i++) {
        if (this.currentYearData[i] === undefined) {
            this.currentYearData[i] = null;
        }

        if (this.previousYearData[i] === undefined) {
            this.previousYearData[i] = null;  
        }
    }

    
    //Set-up the chart data ready for rendering
    this.chartData = {
        labels: this.labels,
        datasets: [{
                    label: 'Last Year',
                    fillColor: this.fillColors[0],
                    strokeColor: this.strokeColors[0],
                    data: this.previousYearData
                    }, 
                   {
                    label: 'This Year',
                    fillColor: this.fillColors[1],
                    strokeColor: this.strokeColors[1],
                    data: this.currentYearData
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
    
    //run GA queries and map data into properties
    return weekDoughnutChartContext.queryGA({
        'ids': weekDoughnutChartContext.gaIds,
        'dimensions': weekDoughnutChartContext.gaDimensions,
        'metrics': weekDoughnutChartContext.gaMetrics,
        'filters': weekDoughnutChartContext.gaFilters,
        'start-date': weekDoughnutChartContext.currentWeekStartDate,
        'end-date': weekDoughnutChartContext.currentWeekEndDate,
        'sort': weekDoughnutChartContext.gaSort,
        'max-results': 5
        })
        //process results
        .then(function(result) {
            var sumValues = 0;
            
            if (result.totalResults > 0) {
                //Calculate sum of all page views for percentages
                result.rows.forEach(function(row, i) {
                    sumValues = sumValues + (+row[1]);
                });


                result.rows.forEach(function(row, i) {
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
            .catch(function(err) {
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
QuarterlyChart.prototype.retrieveTopFive = function() {
    "use strict";
    
    //Check if there is data in the search values, if so return immediately
    if (this.searchValues.length > 0) {
        return new Promise(function (resolve) {});
    }
    
    /*run query for previous 2 years*/
    return this.queryGA({ 
        'ids': this.ids,
        'dimensions': 'ga:' + this.gaQueryElement,
        'metrics': 'ga:pageviews',
        'filters': 'ga:pageTitle!=Redirect;ga:pageviews>10',
        'start-date': moment().subtract(2, 'years').format('YYYY-MM-DD'),
        'end-date': moment().format('YYYY-MM-DD'),
        'sort': '-ga:pageviews',
        'max-results': 5
    })
        .then(function(result) {
            if (result.totalResults > 0) {
                result.rows.forEach(function(row, i) {
                    this.searchValues.push(row[0]);
                });
            }
            return true;
        })
        .catch(function(err) {
            console.log(err.message);
            return false;
        });

};

/**
 * Using the top 5 values for the GA dimension, build the GA query string, dates for each quarter,
 * and labels for each quarter.
 * @param {none} 
 * @return {boolean} returns true so that it can be used with promise chaining to wait for the result.
 */
QuarterlyChart.prototype.setQueryTerms = function() {
    "use strict";

    /* Use searchElement and searchValues to build query
     *  and initialise arrays for holding the data
     */

    for (var sCounter = 0; sCounter < this.searchValues.length; sCounter++) {
        //Add page to query string
        if (sCounter > 0) {
            this.pageQuery = this.pageQuery + ', ';
        }

        this.pageQuery = this.pageQuery + 'ga:' + this.gaQueryElement + '==' + this.searchValues[sCounter];

        //Initialise array to hold values for page
        this.pageData['val' + sCounter] = [];
        
    }


    /**Build month labels and time periods for 4 query periods
    * 1st day of 12 months ago - last day of 10 months ago
    * 1st day of 9 months ago - last day of 7 months ago
    * 1st day of 6 months ago - last day of 4 months ago
    * 1st day of 3 months ago - last day of last month
    */
    for (var qCalculator = 3, dataCounter = 0; qCalculator >= 0; qCalculator--, dataCounter++) {
        this.monthLabels.push(moment(this.endDate).subtract((qCalculator * 3) + 3, 'months').date(1).format('MMM') + '-' + 
                                  moment(this.endDate).subtract((qCalculator * 3) + 1,         'months').date(1).format('MMM'));

        this.periodDates.push(moment(this.endDate).subtract((qCalculator * 3) + 3, 'months').date(1).format('YYYY-MM-DD'));
        this.periodDates.push(moment(this.endDate).subtract((qCalculator * 3), 'months').date(1).subtract(1, 'days').format('YYYY-MM-DD'));
    }    
    
    return true;
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
    
    //Check that results have values
    if (results !== undefined) {

        //initially set all searchValues to not being found in results
        var valsFound = [];

        this.searchValues.forEach(function(element, index, array) {
            valsFound.push(false);
        });

        //Find the current length of array depending on which quarter is being processed, 0 = First quarter, 1 = Second quarter ...
        var quarterNum = this.pageData.val0.length;
        
        
        //iterate through results, map in values and set the value as being found
        if (results.totalResults > 0) {
            results.rows.forEach(function(row, r) {

                //Find the position of the returned value in the searchValues
                var referencePos = this.searchValues.indexOf(row[0]);

                if (referencePos > -1) {
                    //set value has been found
                    valsFound[referencePos] = true;
                    
                    //add in data to the value in array for this quarter
                    this.pageData['val' + referencePos][quarterNum] = (+row[1]);
                }
            });
        }

        /** check for any missing values.  If no value is present, then add in 0
         *  If values are present, sum them up for total across top 5 
         */
        var sumValues = 0;

        this.searchValues.forEach(function(element, index, array) {
            if (valsFound[index] === false)
                this.pageData['val' + index].push(0);
            else
                sumValues = sumValues + this.pageData['val' + index][quarterNum];
        });

        /** Adjust each value to make it a percentage of the total rather
         *  than the raw number.  This allows comparisons over time
         *  periods where there is a large variation in the raw numbers.
         */
        if (sumValues > 0) {
            this.searchValues.forEach(function(element, index, array) {
                this.pageData['val' + index][quarterNum] = (this.pageData['val' + index][quarterNum] / sumValues * 100).toFixed(2);
            });
        }
    }
    
    return true;
};

QuarterlyChart.prototype.setUpChartData = function () {
    "use strict";
    
    //Set-up the chart data ready for rendering
    this.chartData = {
        labels: this.monthLabels,
        datasets: []
    };

    this.searchValues.forEach(function(element, index, array) {
        //Build data set for each page
        this.chartData.datasets[index] = {
            label: element,
            fillColor: this.fillColors[index],
            strokeColor: this.strokeColors[index],
            pointColor: this.strokeColors[index],
            pointStrokeColor: "#fff",
            data: this.pageData['val' + index]
        };
    });    
};