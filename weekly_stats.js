/** Globally used colour pallete for chart fills
 */
var fillColors = ['rgba(115,115,115,0.33)', 'rgba(241,90,96,0.33)', 'rgba(122,195,106,0.33)', 'rgba(90,155,212,0.33)', 'rgba(250,167,91,0.33)', 'rgba(158,103,171,0.33)',
    'rgba(193,254,227,0.33)', 'rgba(215,127,80,0.33)'];
var strokeColors = ['rgba(115,115,115,1)', 'rgba(241,90,96,1)', 'rgba(122,195,106,1)', 'rgba(90,155,212,1)', 'rgba(250,167,91,1)', 'rgba(158,103,171,1)',
    'rgba(193,254,227,1)', 'rgba(215,127,80,1)'];

var lineChartLegend = "<% for (var i=0; i<datasets.length; i++) {%><li><i style=\"background:<%=datasets[i].fillColor%>; border-width: 1px; border-style: solid; border-color:<%=datasets[i].pointColor%>;\"></i><%if (datasets[i].label) {%><%=datasets[i].label%><%}%></li><%}%>";
var barChartLegend = "<% for (var i=0; i<datasets.length; i++) {%><li><i style=\"background:<%=datasets[i].fillColor%>; border-width: 1px; border-style: solid; border-color:<%=datasets[i].strokeColor%>;\"></i><%if (datasets[i].label) {%><%=datasets[i].label%><%}%></li><%}%>";
var dougnutChartLegend = "<% for (var i=0; i<segments.length; i++) {%><li><i style=\"background:<%=segments[i].fillColor%>; border-width: 1px; border-style: solid; border-color:<%=segments[i].highlightColor%>;\"></i><%if (segments[i].label) {%><%=segments[i].label%><%}%></li><%}%>";
var allTimeTopPageNames = [];
var allTimeTopBrowsers = [];
var allTimeTopIEVersions = [];
var allTimeTopFirefoxVersions = [];

/** Thees functions show and hide a loading bar
 * 
 */
function showLoadingBar() {
    document.getElementById("load-bar").className = "loader";
}

function hideLoadingBar() {
    document.getElementById("load-bar").className = "loader-hidden";
}

/** This function starts the execution chain for rendering the analytics charts.
 * It only calls the first function with the end of each function calling the
 * subsequent render function.  The chaining approach has been used to ensure the
 * rate of execution can be controlled.
 * 
 * Within each function promise chaining is used with a delay function which limits
 * the rate of calls to the analytics API
 */

function renderCharts(ids, startDate, endDate) {
    showLoadingBar();
    renderWeekOverWeekSessions(ids, startDate, endDate);

}

function renderWeekOverWeekSessions(ids, startDate, endDate) {

    //Retrieve historical data - per day of the week, per week for the last year
    // ordered by day of week, then the highest to lowest number of sessions returned.
    var currentWeekData, previousWeekData, lastYearData = [],
        labels;

    //Retrieve data for last year
    query({
        'ids': ids,
        'dimensions': 'ga:dayOfWeek,ga:year,ga:nthWeek',
        'metrics': 'ga:sessions',
        'filters': 'ga:sessions>0',
        'start-date': moment(endDate).subtract(1, 'years').format('YYYY-MM-DD'),
        'end-date': endDate,
        'sort': 'ga:dayOfWeek,-ga:sessions'
        })
            .then(function(result) {
                processLastYear(result);
                return rateLimitDelay();
            })
            .then(function(result) {
                //Retrieve current week data
                return query({
                    'ids': ids,
                    'dimensions': 'ga:date,ga:nthDay',
                    'metrics': 'ga:sessions',
                    'start-date': startDate,
                    'end-date': endDate
                });
            })
            .then(function(result) {
                currentWeekData = result.rows.map(function(row) {
                    return +row[2];
                });
                return rateLimitDelay();
            })
            .then(function(result) {
                return query({
                    'ids': ids,
                    'dimensions': 'ga:date,ga:nthDay',
                    'metrics': 'ga:sessions',
                    'start-date': moment(startDate).subtract(7, 'days').format('YYYY-MM-DD'),
                    'end-date': moment(endDate).subtract(7, 'days').format('YYYY-MM-DD')
                });
            })
            .then(function(result) {
                previousWeekData = result.rows.map(function(row) {
                    return +row[2];
                });
                labels = result.rows.map(function(row) {
                    return +row[0];
                });
                labels = labels.map(function(label) {
                    return moment(label, 'YYYYMMDD').format('ddd');
                });

                renderChart();
            })
            .catch(function(err) {
                console.error(err.error.message);
                hideLoadingBar();
            });


    function processLastYear(lastYearResults) {
        var monData = [],
            tueData = [],
            wedData = [],
            thuData = [],
            friData = [],
            satData = [],
            sunData = [];

        //push values in (the query returns in order by day of week from highest number to lowest number)
        lastYearResults.rows.forEach(function(row, i) {
            switch (+row[0]) {
                case 0:
                    sunData.push(+row[3]);
                    break;
                case 1:
                    monData.push(+row[3]);
                    break;
                case 2:
                    tueData.push(+row[3]);
                    break;
                case 3:
                    wedData.push(+row[3]);
                    break;
                case 4:
                    thuData.push(+row[3]);
                    break;
                case 5:
                    friData.push(+row[3]);
                    break;
                case 6:
                    satData.push(+row[3]);
                    break;
            }
        });

        //Retrieve the median (middle value) for each historical data set for each day and push the value into lastYearData
        if (monData.length > 0) {
            lastYearData.push(monData[Math.round(monData.length / 2)]);
        } else {
            lastYearData.push(0);
        }

        if (tueData.length > 0) {
            lastYearData.push(tueData[Math.round(tueData.length / 2)]);
        } else {
            lastYearData.push(0);
        }

        if (wedData.length > 0) {
            lastYearData.push(wedData[Math.round(wedData.length / 2)]);
        } else {
            lastYearData.push(0);
        }

        if (thuData.length > 0) {
            lastYearData.push(thuData[Math.round(thuData.length / 2)]);
        } else {
            lastYearData.push(0);
        }

        if (friData.length > 0) {
            lastYearData.push(friData[Math.round(friData.length / 2)]);
        } else {
            lastYearData.push(0);
        }

        if (satData.length > 0) {
            lastYearData.push(satData[Math.round(satData.length / 2)]);
        } else {
            lastYearData.push(0);
        }

        if (sunData.length > 0) {
            lastYearData.push(sunData[Math.round(sunData.length / 2)]);
        } else {
            lastYearData.push(0);
        }
    }


    function renderChart() {
        var data = {
            labels: labels,
            datasets: [{
                //Previous week
                label: 'Week Starting ' + moment(startDate).subtract(7, 'days').format('DD/MM/YYYY'),
                fillColor: fillColors[0],
                strokeColor: strokeColors[0],
                pointColor: strokeColors[0],
                pointStrokeColor: "#fff",
                data: previousWeekData
            }, {
                //Current week
                label: 'Week Starting ' + moment(startDate).format('DD/MM/YYYY'),
                fillColor: fillColors[1],
                strokeColor: strokeColors[1],
                pointColor: strokeColors[1],
                pointStrokeColor: "#fff",
                data: currentWeekData
            }, {
                //Previous year median
                label: 'Median for the Last Year',
                fillColor: fillColors[2],
                strokeColor: strokeColors[2],
                pointColor: strokeColors[2],
                pointStrokeColor: "#fff",
                data: lastYearData
            }]
        };

        //Create chart and render on canvas
        var lineChart = new Chart(makeCanvas('weekly-session-chart-container')).Line(data, {
            legendTemplate: lineChartLegend
        });
        document.getElementById('weekly-session-legend-container').innerHTML = lineChart.generateLegend();

        //Start the next render
        renderYearOverYearSessions(ids, startDate, endDate);
    }


}


/**
 * Draw the a chart.js bar chart with data from the specified view that
 * overlays session data for the current year over session data for the
 * previous year, grouped by month.
 */
function renderYearOverYearSessions(ids, startDate, endDate) {
    var currentYearData;
    var previousYearData;
    var labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    var thisYear = query({
            'ids': ids,
            'dimensions': 'ga:month,ga:nthMonth',
            'metrics': 'ga:sessions',
            'start-date': moment(endDate).date(1).month(0).format('YYYY-MM-DD'),
            'end-date': moment(endDate).format('YYYY-MM-DD')
        })
        .then(function(result) {
            currentYearData = result.rows.map(function(row) {
                return +row[2];
            });
            return rateLimitDelay();
        })
        .then(function(result) {
            //Previous year data
            return query({
                'ids': ids,
                'dimensions': 'ga:month,ga:nthMonth',
                'metrics': 'ga:sessions',
                'start-date': moment(endDate).subtract(1, 'year').date(1).month(0)
                    .format('YYYY-MM-DD'),
                'end-date': moment(endDate).date(1).month(0).subtract(1, 'day')
                    .format('YYYY-MM-DD')
            });
        })
        .then(function(result) {
            previousYearData = result.rows.map(function(row) {
                return +row[2];
            });

            renderChart();
        })
        .catch(function(err) {
            console.error(err.error.message);
            hideLoadingBar();
        });


    function renderChart() {
        // Ensure the data arrays are at least as long as the labels array.
        // Chart.js bar charts don't (yet) accept sparse datasets.
        for (var i = 0, len = labels.length; i < len; i++) {
            if (currentYearData[i] === undefined) currentYearData[i] = null;
            if (previousYearData[i] === undefined) previousYearData[i] = null;
        }


        var data = {
            labels: labels,
            datasets: [{
                label: 'Last Year',
                fillColor: fillColors[0],
                strokeColor: strokeColors[0],
                data: previousYearData
            }, {
                label: 'This Year',
                fillColor: fillColors[1],
                strokeColor: strokeColors[1],
                data: currentYearData

            }]
        };

        var barChart = new Chart(makeCanvas('monthly-session-chart-container')).Bar(data, {
            legendTemplate: barChartLegend
        });
        document.getElementById('monthly-session-legend-container').innerHTML = barChart.generateLegend();

        //Start the next render
        renderWeekOverWeekSessionDuration(ids, startDate, endDate);
    }
}

/* Calculates the number of seconds avergae dution for a session for the current and previous week */

function renderWeekOverWeekSessionDuration(ids, startDate, endDate) {
    var currentWeekData;
    var previousWeekData;
    var lastYearData = [];
    var labels;


    //Retrieve historical data - per day of the week, per week for the last year
    // ordered by day of week, then the highest to lowest number of sessions returned.

    var historicalData = query({
            'ids': ids,
            'dimensions': 'ga:dayOfWeek,ga:year,ga:nthWeek',
            'metrics': 'ga:avgSessionDuration',
            'filters': 'ga:avgSessionDuration>0',
            'start-date': moment(endDate).subtract(1, 'years').format('YYYY-MM-DD'),
            'end-date': endDate,
            'sort': 'ga:dayOfWeek,-ga:avgSessionDuration'
        })
        .then(function(result) {
            processLastYear(result);
            return rateLimitDelay();
        })
        .then(function(result) {
            return query({
                'ids': ids,
                'dimensions': 'ga:date,ga:nthDay',
                'metrics': 'ga:avgSessionDuration',
                'start-date': startDate,
                'end-date': endDate
            });
        })
        .then(function(result) {
            currentWeekData = result.rows.map(function(row) {
                return (+row[2] / 60).toFixed(2);
            });
            return rateLimitDelay();
        })
        .then(function(result) {
            return query({
                'ids': ids,
                'dimensions': 'ga:date,ga:nthDay',
                'metrics': 'ga:avgSessionDuration',
                'start-date': moment(startDate).subtract(7, 'days').format('YYYY-MM-DD'),
                'end-date': moment(endDate).subtract(7, 'days').format('YYYY-MM-DD')
            });
        })
        .then(function(result) {
            previousWeekData = result.rows.map(function(row) {
                return (+row[2] / 60).toFixed(2);
            });
            labels = result.rows.map(function(row) {
                return +row[0];
            });
            labels = labels.map(function(label) {
                return moment(label, 'YYYYMMDD').format('ddd');
            });

            renderChart();
        })
        .catch(function(err) {
            console.error(err.error.message);
            hideLoadingBar();
        });



    function processLastYear(result) {
        var monData = [];
        var tueData = [];
        var wedData = [];
        var thuData = [];
        var friData = [];
        var satData = [];
        var sunData = [];

        //push values in (query returns in day order from highest number to lowest number)
        result.rows.forEach(function(row, i) {
            switch (+row[0]) {
                case 0:
                    sunData.push((+row[3] / 60).toFixed(2));
                    break;
                case 1:
                    monData.push((+row[3] / 60).toFixed(2));
                    break;
                case 2:
                    tueData.push((+row[3] / 60).toFixed(2));
                    break;
                case 3:
                    wedData.push((+row[3] / 60).toFixed(2));
                    break;
                case 4:
                    thuData.push((+row[3] / 60).toFixed(2));
                    break;
                case 5:
                    friData.push((+row[3] / 60).toFixed(2));
                    break;
                case 6:
                    satData.push((+row[3] / 60).toFixed(2));
                    break;
            }
        });

        //Now retrieve the median (middle value) for each historical data set for each day and push the value into lastYearData
        if (monData.length > 0)
            lastYearData.push(monData[Math.round(monData.length / 2)]);
        else
            lastYearData.push(0);

        if (tueData.length > 0)
            lastYearData.push(tueData[Math.round(tueData.length / 2)]);
        else
            lastYearData.push(0);

        if (wedData.length > 0)
            lastYearData.push(wedData[Math.round(wedData.length / 2)]);
        else
            lastYearData.push(0);

        if (thuData.length > 0)
            lastYearData.push(thuData[Math.round(thuData.length / 2)]);
        else
            lastYearData.push(0);

        if (friData.length > 0)
            lastYearData.push(friData[Math.round(friData.length / 2)]);
        else
            lastYearData.push(0);

        if (satData.length > 0)
            lastYearData.push(satData[Math.round(satData.length / 2)]);
        else
            lastYearData.push(0);

        if (sunData.length > 0)
            lastYearData.push(sunData[Math.round(sunData.length / 2)]);
        else
            lastYearData.push(0);
    }


    function renderChart() {
        var data = {
            labels: labels,
            datasets: [{
                label: 'Week Starting ' + moment(startDate).format('DD/MM/YYYY'),
                fillColor: fillColors[0],
                strokeColor: strokeColors[0],
                pointColor: strokeColors[0],
                pointStrokeColor: "#fff",
                data: currentWeekData
            }, {
                label: 'Week Starting ' + moment(startDate).subtract(7, 'days').format('DD/MM/YYYY'),
                fillColor: fillColors[1],
                strokeColor: strokeColors[1],
                pointColor: strokeColors[1],
                pointStrokeColor: "#fff",
                data: previousWeekData
            }, {
                label: 'Median for the Last Year',
                fillColor: fillColors[2],
                strokeColor: strokeColors[2],
                pointColor: strokeColors[2],
                pointStrokeColor: "#fff",
                data: lastYearData
            }]
        };

        var lineChart = new Chart(makeCanvas('weekly-session-duration-chart-container')).Line(data, {
            legendTemplate: lineChartLegend
        });
        document.getElementById('weekly-session-duration-legend-container').innerHTML = lineChart.generateLegend();

        //Start the next render
        renderYearOverYearSessionDuration(ids, startDate, endDate);
    }


}

/*Calculates the average number of seconds duration of a session for this year to the previous
  year*/

function renderYearOverYearSessionDuration(ids, startDate, endDate) {

    var currentYearData;
    var previousYearData;
    var labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    var thisYear = query({
            'ids': ids,
            'dimensions': 'ga:month,ga:nthMonth',
            'metrics': 'ga:avgSessionDuration',
            'start-date': moment(endDate).date(1).month(0).format('YYYY-MM-DD'),
            'end-date': moment(endDate).format('YYYY-MM-DD')
        })
        .then(function(result) {
            currentYearData = result.rows.map(function(row) {
                return (+row[2] / 60).toFixed(2);
            });
            return rateLimitDelay();
        })
        .then(function(result) {
            //Previous year data
            return query({
                'ids': ids,
                'dimensions': 'ga:month,ga:nthMonth',
                'metrics': 'ga:avgSessionDuration',
                'start-date': moment(endDate).subtract(1, 'year').date(1).month(0)
                    .format('YYYY-MM-DD'),
                'end-date': moment(endDate).date(1).month(0).subtract(1, 'day')
                    .format('YYYY-MM-DD')
            });
        })
        .then(function(result) {
            previousYearData = result.rows.map(function(row) {
                return (+row[2] / 60).toFixed(2);
            });

            renderChart();
        })
        .catch(function(err) {
            console.error(err.error.message);
            hideLoadingBar();
        });


    function renderChart() {
        // Ensure the data arrays are at least as long as the labels array.
        // Chart.js bar charts don't (yet) accept sparse datasets.
        for (var i = 0, len = labels.length; i < len; i++) {
            if (currentYearData[i] === undefined) currentYearData[i] = null;
            if (previousYearData[i] === undefined) previousYearData[i] = null;
        }

        var data = {
            labels: labels,
            datasets: [{
                label: 'Last Year',
                fillColor: fillColors[0],
                strokeColor: strokeColors[0],
                data: previousYearData
            }, {
                label: 'This Year',
                fillColor: fillColors[1],
                strokeColor: strokeColors[1],
                data: currentYearData
            }]
        };

        var barChart = new Chart(makeCanvas('monthly-session-duration-chart-container')).Bar(data, {
            legendTemplate: barChartLegend
        });
        document.getElementById('monthly-session-duration-legend-container').innerHTML = barChart.generateLegend();

        //Start the next render
        renderWeekContentUsage(ids, startDate, endDate);
    }

}

/**
 * Draw the a chart.js doughnut chart with data from the specified view that
 * shows the content for the week*/

function renderWeekContentUsage(ids, startDate, endDate) {

    var topPageNames = [];
    var data = [];


    var currentWeekData = query({
            'ids': ids,
            'dimensions': 'ga:pageTitle',
            'metrics': 'ga:pageviews',
            'filters': 'ga:pageTitle!=Redirect;ga:pageviews>10',
            'start-date': startDate,
            'end-date': endDate,
            'sort': '-ga:pageviews',
            'max-results': 5
        })
        .then(function(result) {
            return processWeekResults(result);
        })
        .then(function(result) {
            renderChart();
        })
        .catch(function(err) {
            console.error(err.error.message);
            hideLoadingBar();
        });


    function processWeekResults(result) {

        var sumValues = 0;

        if (result.totalResults > 0) {

            //Calculate sum of all page views for percentages
            result.rows.forEach(function(row, i) {
                sumValues = sumValues + (+row[1]);
            });


            result.rows.forEach(function(row, i) {
                data.push({
                    value: +row[1],
                    color: fillColors[i],
                    highlight: strokeColors[i],
                    label: row[0] + ': ' + row[1] + ' (' + Math.round(row[1] / sumValues * 100) + '%)'
                });
                topPageNames.push(row[0]);
            });

            return true;

        } else {
            data.push({
                value: 1,
                color: fillColors[0],
                highlight: strokeColors[0],
                label: 'No data for selected period'
            });

            /** Check whether all time data is available 
             * if available use it
             * If not available, run a query to retrieve it
             */
            if (allTimeTopPageNames.length > 0) {
                topPageNames = allTimeTopPageNames.slice();
                return true;
            } else {
                //wait for delay
                return rateLimitDelay()
                    .then(function(result) {
                        return query({ /*run query for previous 2 years*/
                            'ids': ids,
                            'dimensions': 'ga:pageTitle',
                            'metrics': 'ga:pageviews',
                            'filters': 'ga:pageTitle!=Redirect;ga:pageviews>10',
                            'start-date': moment().subtract(2, 'years').format('YYYY-MM-DD'),
                            'end-date': moment().format('YYYY-MM-DD'),
                            'sort': '-ga:pageviews',
                            'max-results': 5
                        });
                    })
                    .then(function(result) {
                        if (result.totalResults > 0) {
                            result.rows.forEach(function(row, i) {
                                allTimeTopPageNames.push(row[0]);
                                topPageNames.push(row[0]);
                            });
                        }
                        return true;
                    })
                    .catch(function(err) {
                        console.error(err.error.message);
                        return false;
                    });
            }

        }

    }


    function renderChart() {
        var doughnutChart = new Chart(makeCanvas('weekly-content-chart-container')).Doughnut(data, {
            percentageInnerCutout: 33,
            animateScale: true,
            legendTemplate: dougnutChartLegend
        });
        document.getElementById('weekly-content-legend-container').innerHTML = doughnutChart.generateLegend();

        //Start next render
        renderQuarterlyContentUsage(ids, startDate, endDate, topPageNames);
    }

}




/**
 * Draw the a line chart with data from the specified view that
 * shows the top content over the last year.
 */
function renderQuarterlyContentUsage(ids, startDate, endDate, topPages) {

    /* Use top 4 pages for last week and run queries for
     * 1st day of 12 months ago - last day of 10 months ago
     * 1st day of 9 months ago - last day of 7 months ago
     * 1st day of 6 months ago - last day of 4 months ago
     * 1st day of 3 months ago - last day of last month
     */

    //Build page query string and initialise arrays for holding the data
    var pageQuery = '';
    var pageData = {};

    topPages.forEach(function(element, index, array) {
        //Add page to query string
        if (index > 0)
            pageQuery = pageQuery + ', ';
        pageQuery = pageQuery + 'ga:pageTitle==' + element;

        //Initialise array to hold values for page
        pageData['val' + index] = [];
    });



    /**Build month labels and time periods for 4 query periods
     * then run the query for the defined period and collate the results
     */
    var monthLabels = [];
    var periodDates = [];


    for (var qCalculator = 3, dataCounter = 0; qCalculator >= 0; qCalculator--, dataCounter++) {
        monthLabels.push(moment(endDate).subtract((qCalculator * 3) + 3, 'months').date(1).format('MMM') + '-' + moment(endDate).subtract((qCalculator * 3) + 1, 'months').date(1).format('MMM'));

        periodDates.push(moment(endDate).subtract((qCalculator * 3) + 3, 'months').date(1).format('YYYY-MM-DD'));
        periodDates.push(moment(endDate).subtract((qCalculator * 3), 'months').date(1).subtract(1, 'days').format('YYYY-MM-DD'));
    }


    //Retrieve results for each quarter

    var yearAgoQuarterData = query({
            'ids': ids,
            'dimensions': 'ga:pageTitle',
            'metrics': 'ga:pageviews',
            'filters': pageQuery,
            'start-date': periodDates[0],
            'end-date': periodDates[1]
        })
        .then(function(result) {
            pageData = processResults(result, pageData, topPages);
            return rateLimitDelay();
        })
        .then(function(result) {
            return query({
                'ids': ids,
                'dimensions': 'ga:pageTitle',
                'metrics': 'ga:pageviews',
                'filters': pageQuery,
                'start-date': periodDates[2],
                'end-date': periodDates[3]
            });
        })
        .then(function(result) {
            pageData = processResults(result, pageData, topPages);
            return rateLimitDelay();
        })
        .then(function(result) {
            return query({
                'ids': ids,
                'dimensions': 'ga:pageTitle',
                'metrics': 'ga:pageviews',
                'filters': pageQuery,
                'start-date': periodDates[4],
                'end-date': periodDates[5]
            });
        })
        .then(function(result) {
            pageData = processResults(result, pageData, topPages);
            return rateLimitDelay();
        })
        .then(function(result) {
            return query({
                'ids': ids,
                'dimensions': 'ga:pageTitle',
                'metrics': 'ga:pageviews',
                'filters': pageQuery,
                'start-date': periodDates[6],
                'end-date': periodDates[7]
            });
        })
        .then(function(result) {
            pageData = processResults(result, pageData, topPages);
            renderChart();
        })
        .catch(function(err) {
            console.error(err.error.message);
            hideLoadingBar();
        });


    function renderChart() {
        var data = {
            labels: monthLabels,
            datasets: []
        };

        topPages.forEach(function(element, index, array) {
            //Build data set for each page
            data.datasets[index] = {
                label: element,
                fillColor: fillColors[index],
                strokeColor: strokeColors[index],
                pointColor: strokeColors[index],
                pointStrokeColor: "#fff",
                data: pageData['val' + index]
            };
        });

        var lineChart = new Chart(makeCanvas('quarterly-content-chart-container')).Line(data, {
            legendTemplate: lineChartLegend
        });
        document.getElementById('quarterly-content-legend-container').innerHTML = lineChart.generateLegend();

        //Start next render
        renderWeekBrowsers(ids, startDate, endDate);
    }

}


/**
 * Draw the a chart.js doughnut chart with data from the specified view that
 * show the top 5 browsers.*/

function renderWeekBrowsers(ids, startDate, endDate) {

    var topBrowsers = [];
    var data = [];

    var browserData = query({
            'ids': ids,
            'dimensions': 'ga:browser',
            'metrics': 'ga:pageviews',
            'start-date': startDate,
            'end-date': endDate,
            'sort': '-ga:pageviews',
            'max-results': 5
        })
        .then(function(result) {
            return processWeekResults(result);
        })
        .then(function(result) {
            renderChart();
        })
        .catch(function(err) {
            console.error(err.error.message);
            hideLoadingBar();
        });


    function processWeekResults(result) {
        var sumValues = 0;

        if (result.totalResults > 0) {

            //Calculate sum of all page views for percentages
            result.rows.forEach(function(row, i) {
                sumValues = sumValues + (+row[1]);
            });


            result.rows.forEach(function(row, i) {
                data.push({
                    value: +row[1],
                    color: fillColors[i],
                    highlight: strokeColors[i],
                    label: row[0] + ': ' + row[1] + ' (' + Math.round(row[1] / sumValues * 100) + '%)'
                });
                topBrowsers.push(row[0]);
            });

            return true;
        } else {
            data.push({
                value: 1,
                color: fillColors[0],
                highlight: strokeColors[0],
                label: 'No data for selected period'
            });
            /** Check whether all time data is available 
             * if available use it
             * If not available, run a query to retrieve it
             */
            if (allTimeTopBrowsers.length > 0) {
                topBrowsers = allTimeTopBrowsers.slice();
                return true;
            } else {
                //wait for delay
                return rateLimitDelay()
                    .then(function(result) {
                        return query({ /*run query for previous 2 years*/
                            'ids': ids,
                            'dimensions': 'ga:browser',
                            'metrics': 'ga:pageviews',
                            'start-date': moment().subtract(2, 'years').format('YYYY-MM-DD'),
                            'end-date': moment().format('YYYY-MM-DD'),
                            'sort': '-ga:pageviews',
                            'max-results': 5
                        });
                    })
                    .then(function(result) {
                        if (result.totalResults > 0) {
                            result.rows.forEach(function(row, i) {
                                allTimeTopBrowsers.push(row[0]);
                                topBrowsers.push(row[0]);
                            });
                        }
                        return true;
                    })
                    .catch(function(err) {
                        console.error(err.error.message);
                        return false;
                    });
            }

        }
    }

    function renderChart() {
        var doughnutChart = new Chart(makeCanvas('weekly-browser-chart-container')).Doughnut(data, {
            percentageInnerCutout: 33,
            animateScale: true,
            legendTemplate: dougnutChartLegend
        });
        document.getElementById('weekly-browser-legend-container').innerHTML = doughnutChart.generateLegend();

        //Start next render
        renderQuarterlyBrowserUsage(ids, startDate, endDate, topBrowsers);
    }


}


/**
 * Draw the line chart with data from the specified view that
 * show the top 5 browsers over the last year.
 */
function renderQuarterlyBrowserUsage(ids, startDate, endDate, topBrowsers) {

    /* Use top 4 pages for last week and run queries for
     * 1st day of 12 months ago - last day of 10 months ago
     * 1st day of 9 months ago - last day of 7 months ago
     * 1st day of 6 months ago - last day of 4 months ago
     * 1st day of 3 months ago - last day of last month
     */

    //Build browser query string and initialise arrays for holding the data
    var browserQuery = '';
    var pageData = {};

    topBrowsers.forEach(function(element, index, array) {
        //Add page to query string
        if (index > 0)
            browserQuery = browserQuery + ', ';
        browserQuery = browserQuery + 'ga:browser==' + element;

        //Initialise array to hold values for page
        pageData['val' + index] = [];
    });



    /**Build month labels and time periods for 4 query periods
     * then run the query for the defined period and collate the results
     */
    var monthLabels = [];
    var periodDates = [];


    for (var qCalculator = 3, dataCounter = 0; qCalculator >= 0; qCalculator--, dataCounter++) {
        monthLabels.push(moment(endDate).subtract((qCalculator * 3) + 3, 'months').date(1).format('MMM') + '-' + moment(endDate).subtract((qCalculator * 3) + 1, 'months').date(1).format('MMM'));

        periodDates.push(moment(endDate).subtract((qCalculator * 3) + 3, 'months').date(1).format('YYYY-MM-DD'));
        periodDates.push(moment(endDate).subtract((qCalculator * 3), 'months').date(1).subtract(1, 'days').format('YYYY-MM-DD'));
    }


    //Retrieve results for each quarter
    var yearAgoQuarterData = query({
            'ids': ids,
            'dimensions': 'ga:browser',
            'metrics': 'ga:pageviews',
            'filters': browserQuery,
            'start-date': periodDates[0],
            'end-date': periodDates[1]
        })
        .then(function(result) {
            pageData = processResults(result, pageData, topBrowsers);
            return rateLimitDelay();
        })
        .then(function(result) {
            return query({
                'ids': ids,
                'dimensions': 'ga:browser',
                'metrics': 'ga:pageviews',
                'filters': browserQuery,
                'start-date': periodDates[2],
                'end-date': periodDates[3]
            });
        })
        .then(function(result) {
            pageData = processResults(result, pageData, topBrowsers);
            return rateLimitDelay();
        })
        .then(function(result) {
            return query({
                'ids': ids,
                'dimensions': 'ga:browser',
                'metrics': 'ga:pageviews',
                'filters': browserQuery,
                'start-date': periodDates[4],
                'end-date': periodDates[5]
            });
        })
        .then(function(result) {
            pageData = processResults(result, pageData, topBrowsers);
            return rateLimitDelay();
        })
        .then(function(result) {
            return query({
                'ids': ids,
                'dimensions': 'ga:browser',
                'metrics': 'ga:pageviews',
                'filters': browserQuery,
                'start-date': periodDates[6],
                'end-date': periodDates[7]
            });
        })
        .then(function(result) {
            pageData = processResults(result, pageData, topBrowsers);

            renderChart();
        })
        .catch(function(err) {
            console.error(err.error.message);
            hideLoadingBar();
        });


    function renderChart() {
        var data = {
            labels: monthLabels,
            datasets: []
        };

        topBrowsers.forEach(function(element, index, array) {
            //Build data set for each page
            data.datasets[index] = {
                label: element,
                fillColor: fillColors[index],
                strokeColor: strokeColors[index],
                pointColor: strokeColors[index],
                pointStrokeColor: "#fff",
                data: pageData['val' + index]
            };
        });


        var lineChart = new Chart(makeCanvas('quarterly-browser-chart-container')).Line(data, {
            legendTemplate: lineChartLegend
        });
        document.getElementById('quarterly-browser-legend-container').innerHTML = lineChart.generateLegend();

        //Start next render
        renderWeekIEVersion(ids, startDate, endDate);
    }

}


/**
 * Draw the a chart.js doughnut chart with data from the specified view that
 * show the top 5 IE Browser versions.
 */
function renderWeekIEVersion(ids, startDate, endDate) {

    var topVersions = [];
    var data = [];


    var browserData = query({
            'ids': ids,
            'dimensions': 'ga:browserVersion',
            'metrics': 'ga:pageviews',
            'filters': 'ga:browser==Internet Explorer',
            'start-date': startDate,
            'end-date': endDate,
            'sort': '-ga:pageviews',
            'max-results': 5
        })
        .then(function(result) {
            return processWeekResults(result);
        })
        .then(function(result) {
            renderChart();
        })
        .catch(function(err) {
            console.error(err.error.message);
            hideLoadingBar();
        });

    function processWeekResults(result) {
        var sumValues = 0;

        if (result.totalResults > 0) {
            //Calculate sum of all page views for percentages
            result.rows.forEach(function(row, i) {
                sumValues = sumValues + (+row[1]);
            });

            result.rows.forEach(function(row, i) {
                data.push({
                    value: +row[1],
                    color: fillColors[i],
                    highlight: strokeColors[i],
                    label: 'IE ' + row[0] + ': ' + row[1] + ' (' + Math.round(row[1] / sumValues * 100) + '%)'
                });
                topVersions.push(row[0]);
            });

            return true;
        } else {
            data.push({
                value: 1,
                color: fillColors[0],
                highlight: strokeColors[0],
                label: 'No data for selected period'
            });
            /** Check whether all time data is available 
             * if available use it
             * If not available, run a query to retrieve it
             */
            if (allTimeTopIEVersions.length > 0) {
                topVersions = allTimeTopIEVersions.slice();
                return true;
            } else {
                //wait for delay
                return rateLimitDelay()
                    .then(function(result) {
                        return query({ /*run query for previous 2 years*/
                            'ids': ids,
                            'dimensions': 'ga:browserVersion',
                            'metrics': 'ga:pageviews',
                            'filters': 'ga:browser==Internet Explorer',
                            'start-date': moment().subtract(2, 'years').format('YYYY-MM-DD'),
                            'end-date': moment().format('YYYY-MM-DD'),
                            'sort': '-ga:pageviews',
                            'max-results': 5
                        });
                    })
                    .then(function(result) {
                        if (result.totalResults > 0) {
                            result.rows.forEach(function(row, i) {
                                allTimeTopIEVersions.push(row[0]);
                                topVersions.push(row[0]);
                            });
                        }
                        return true;
                    })
                    .catch(function(err) {
                        console.error(err.error.message);
                        return false;
                    });
            }
        }
    }


    function renderChart() {
        var doughnutChart = new Chart(makeCanvas('weekly-ieversion-chart-container')).Doughnut(data, {
            percentageInnerCutout: 33,
            animateScale: true,
            legendTemplate: dougnutChartLegend
        });
        document.getElementById('weekly-ieversion-legend-container').innerHTML = doughnutChart.generateLegend();

        //Start next render
        renderQuarterlyIEVersionUsage(ids, startDate, endDate, topVersions);
    }

}


/**
 * Draw the line chart with data from the specified view that
 * show the top 5 IE Browser versions over the last year.
 */
function renderQuarterlyIEVersionUsage(ids, startDate, endDate, topVersions) {

    /* Use top 4 pages for last week and run queries for
     * 1st day of 12 months ago - last day of 10 months ago
     * 1st day of 9 months ago - last day of 7 months ago
     * 1st day of 6 months ago - last day of 4 months ago
     * 1st day of 3 months ago - last day of last month
     */

    //Build browser query string and initialise arrays for holding the data
    var browserQuery = 'ga:browser==Internet Explorer;';
    var pageData = {};

    topVersions.forEach(function(element, index, array) {
        //Add page to query string
        if (index > 0)
            browserQuery = browserQuery + ', ';
        browserQuery = browserQuery + 'ga:browserVersion==' + element;

        //Initialise array to hold values for page
        pageData['val' + index] = [];
    });



    /**Build month labels and time periods for 4 query periods
     * then run the query for the defined period and collate the results
     */
    var monthLabels = [];
    var periodDates = [];


    for (var qCalculator = 3, dataCounter = 0; qCalculator >= 0; qCalculator--, dataCounter++) {
        monthLabels.push(moment(endDate).subtract((qCalculator * 3) + 3, 'months').date(1).format('MMM') + '-' + moment(endDate).subtract((qCalculator * 3) + 1, 'months').date(1).format('MMM'));

        periodDates.push(moment(endDate).subtract((qCalculator * 3) + 3, 'months').date(1).format('YYYY-MM-DD'));
        periodDates.push(moment(endDate).subtract((qCalculator * 3), 'months').date(1).subtract(1, 'days').format('YYYY-MM-DD'));
    }


    //Retrieve results for each quarter
    var yearAgoQuarterData = query({
            'ids': ids,
            'dimensions': 'ga:browserVersion',
            'metrics': 'ga:pageviews',
            'filters': browserQuery,
            'start-date': periodDates[0],
            'end-date': periodDates[1]
        })
        .then(function(result) {
            pageData = processResults(result, pageData, topVersions);
            return rateLimitDelay();
        })
        .then(function(result) {
            return query({
                'ids': ids,
                'dimensions': 'ga:browserVersion',
                'metrics': 'ga:pageviews',
                'filters': browserQuery,
                'start-date': periodDates[2],
                'end-date': periodDates[3]
            });
        })
        .then(function(result) {
            pageData = processResults(result, pageData, topVersions);
            return rateLimitDelay();
        })
        .then(function(result) {
            return query({
                'ids': ids,
                'dimensions': 'ga:browserVersion',
                'metrics': 'ga:pageviews',
                'filters': browserQuery,
                'start-date': periodDates[4],
                'end-date': periodDates[5]
            });
        })
        .then(function(result) {
            pageData = processResults(result, pageData, topVersions);
            return rateLimitDelay();
        })
        .then(function(result) {
            return query({
                'ids': ids,
                'dimensions': 'ga:browserVersion',
                'metrics': 'ga:pageviews',
                'filters': browserQuery,
                'start-date': periodDates[6],
                'end-date': periodDates[7]
            });
        })
        .then(function(result) {
            pageData = processResults(result, pageData, topVersions);

            renderChart();
        })
        .catch(function(err) {
            console.error(err.error.message);
            hideLoadingBar();
        });

    function renderChart() {
        var data = {
            labels: monthLabels,
            datasets: []
        };

        topVersions.forEach(function(element, index, array) {
            //Build data set for each page
            data.datasets[index] = {
                label: 'IE ' + element,
                fillColor: fillColors[index],
                strokeColor: strokeColors[index],
                pointColor: strokeColors[index],
                pointStrokeColor: "#fff",
                data: pageData['val' + index]
            };
        });


        var lineChart = new Chart(makeCanvas('quarterly-ieversion-chart-container')).Line(data, {
            legendTemplate: lineChartLegend
        });
        document.getElementById('quarterly-ieversion-legend-container').innerHTML = lineChart.generateLegend();

        //Start next render
        renderWeekFirefoxVersion(ids, startDate, endDate);
    }
}


/**
 * Draw the a chart.js doughnut chart with data from the specified view that
 * show the top 5 Firefox Browser versions.
 */
function renderWeekFirefoxVersion(ids, startDate, endDate) {

    var topVersions = [];
    var data = [];
    var browserData = query({
            'ids': ids,
            'dimensions': 'ga:browserVersion',
            'metrics': 'ga:pageviews',
            'filters': 'ga:browser==Firefox',
            'start-date': startDate,
            'end-date': endDate,
            'sort': '-ga:pageviews',
            'max-results': 5
        })
        .then(function(result) {
            return processWeekResults(result);
        })
        .then(function(result) {
            renderChart();
        })
        .catch(function(err) {
            console.error(err.error.message);
            hideLoadingBar();
        });

    function processWeekResults(result) {
        var sumValues = 0;

        if (result.totalResults > 0) {
            //Calculate sum of all page views for percentages
            result.rows.forEach(function(row, i) {
                sumValues = sumValues + (+row[1]);
            });


            result.rows.forEach(function(row, i) {
                data.push({
                    value: +row[1],
                    color: fillColors[i],
                    highlight: strokeColors[i],
                    label: 'Firefox ' + row[0] + ': ' + row[1] + ' (' + Math.round(row[1] / sumValues * 100) + '%)'
                });
                topVersions.push(row[0]);
            });

            return true;
        } else {
            data.push({
                value: 1,
                color: fillColors[0],
                highlight: strokeColors[0],
                label: 'No data for selected period'
            });
            /** Check whether all time data is available 
             * if available use it
             * If not available, run a query to retrieve it
             */
            if (allTimeTopFirefoxVersions.length > 0) {
                topVersions = allTimeTopFirefoxVersions.slice();
                return true;
            } else {
                //wait for delay
                return rateLimitDelay()
                    .then(function(result) {
                        return query({ /*run query for previous 2 years*/
                            'ids': ids,
                            'dimensions': 'ga:browserVersion',
                            'metrics': 'ga:pageviews',
                            'filters': 'ga:browser==Firefox',
                            'start-date': moment().subtract(2, 'years').format('YYYY-MM-DD'),
                            'end-date': moment().format('YYYY-MM-DD'),
                            'sort': '-ga:pageviews',
                            'max-results': 5
                        });
                    })
                    .then(function(result) {
                        if (result.totalResults > 0) {
                            result.rows.forEach(function(row, i) {
                                allTimeTopFirefoxVersions.push(row[0]);
                                topVersions.push(row[0]);
                            });
                        }
                        return true;
                    })
                    .catch(function(err) {
                        console.error(err.error.message);
                        return false;
                    });
            }
        }
    }

    function renderChart() {
        var doughnutChart = new Chart(makeCanvas('weekly-firefoxversion-chart-container')).Doughnut(data, {
            percentageInnerCutout: 33,
            animateScale: true,
            legendTemplate: dougnutChartLegend
        });
        document.getElementById('weekly-firefoxversion-legend-container').innerHTML = doughnutChart.generateLegend();

        //Start next render
        renderQuarterlyFirefoxVersionUsage(ids, startDate, endDate, topVersions);
    }

}


/**
 * Draw the line chart with data from the specified view that
 * show the top 5 Firefox Browser versions over the last year.
 */
function renderQuarterlyFirefoxVersionUsage(ids, startDate, endDate, topVersions) {

    /* Use top 4 pages for last week and run queries for
     * 1st day of 12 months ago - last day of 10 months ago
     * 1st day of 9 months ago - last day of 7 months ago
     * 1st day of 6 months ago - last day of 4 months ago
     * 1st day of 3 months ago - last day of last month
     */

    //Build browser query string and initialise arrays for holding the data
    var browserQuery = 'ga:browser==Firefox;';
    var pageData = {};

    topVersions.forEach(function(element, index, array) {
        //Add page to query string
        if (index > 0)
            browserQuery = browserQuery + ', ';
        browserQuery = browserQuery + 'ga:browserVersion==' + element;

        //Initialise array to hold values for page
        pageData['val' + index] = [];
    });



    /**Build month labels and time periods for 4 query periods
     * then run the query for the defined period and collate the results
     */
    var monthLabels = [];
    var periodDates = [];


    for (var qCalculator = 3, dataCounter = 0; qCalculator >= 0; qCalculator--, dataCounter++) {
        monthLabels.push(moment(endDate).subtract((qCalculator * 3) + 3, 'months').date(1).format('MMM') + '-' + moment(endDate).subtract((qCalculator * 3) + 1, 'months').date(1).format('MMM'));

        periodDates.push(moment(endDate).subtract((qCalculator * 3) + 3, 'months').date(1).format('YYYY-MM-DD'));
        periodDates.push(moment(endDate).subtract((qCalculator * 3), 'months').date(1).subtract(1, 'days').format('YYYY-MM-DD'));
    }


    //Retrieve results for each quarter
    var yearAgoQuarterData = query({
            'ids': ids,
            'dimensions': 'ga:browserVersion',
            'metrics': 'ga:pageviews',
            'filters': browserQuery,
            'start-date': periodDates[0],
            'end-date': periodDates[1]
        })
        .then(function(result) {
            pageData = processResults(result, pageData, topVersions);
            return rateLimitDelay();
        })
        .then(function(result) {
            return query({
                'ids': ids,
                'dimensions': 'ga:browserVersion',
                'metrics': 'ga:pageviews',
                'filters': browserQuery,
                'start-date': periodDates[2],
                'end-date': periodDates[3]
            });
        })
        .then(function(result) {
            pageData = processResults(result, pageData, topVersions);
            return rateLimitDelay();
        })
        .then(function(result) {
            return query({
                'ids': ids,
                'dimensions': 'ga:browserVersion',
                'metrics': 'ga:pageviews',
                'filters': browserQuery,
                'start-date': periodDates[4],
                'end-date': periodDates[5]
            });
        })
        .then(function(result) {
            pageData = processResults(result, pageData, topVersions);
            return rateLimitDelay();
        })
        .then(function(result) {
            return query({
                'ids': ids,
                'dimensions': 'ga:browserVersion',
                'metrics': 'ga:pageviews',
                'filters': browserQuery,
                'start-date': periodDates[6],
                'end-date': periodDates[7]
            });
        })
        .then(function(result) {
            pageData = processResults(result, pageData, topVersions);

            renderChart();
        })
        .catch(function(err) {
            console.error(err.error.message);
            hideLoadingBar();
        });


    function renderChart() {
        var data = {
            labels: monthLabels,
            datasets: []
        };

        topVersions.forEach(function(element, index, array) {
            //Build data set for each page
            data.datasets[index] = {
                label: 'Firefox ' + element,
                fillColor: fillColors[index],
                strokeColor: strokeColors[index],
                pointColor: strokeColors[index],
                pointStrokeColor: "#fff",
                data: pageData['val' + index]
            };
        });

        var lineChart = new Chart(makeCanvas('quarterly-firefoxversion-chart-container')).Line(data, {
            legendTemplate: lineChartLegend
        });
        document.getElementById('quarterly-firefoxversion-legend-container').innerHTML = lineChart.generateLegend();

        //Hide the loading bar
        hideLoadingBar();
    }
}



/** Function to process page results.  Takes each result and finds its position in the referenceData
 * array, then maps in the value to the dataStore set.  It then sums all the values, enters 0s
 * for missing values and converts each value to a percentage.
 */

function processResults(results, dataStore, referenceData) {

    if (results !== undefined) {

        //initially set all referenceData to not being found in results
        var valsFound = [];

        referenceData.forEach(function(element, index, array) {
            valsFound.push(false);
        });

        //Find the current position in the array (0-3) depending on which quarter is being processed 
        var dataPosition = dataStore.val0.length;

        
        //iterate through results, map in values and set the value as being found
        if (results.totalResults > 0) {
            results.rows.forEach(function(row, r) {

                //Find the position of the returned value in the referenceData array
                var referencePos = referenceData.indexOf(row[0]);

                if (referencePos > -1) {
                    //set value has been found
                    valsFound[referencePos] = true;
                    dataStore['val' + referencePos][dataPosition] = (+row[1]);
                }
            });
        }

        /** Sum values and check for any missing values.
         *  If value is missing from result set, map a 0 value in
         */
        var sumValues = 0;

        referenceData.forEach(function(element, index, array) {
            if (valsFound[index] === false)
                dataStore['val' + index].push(0);
            else
                sumValues = sumValues + dataStore['val' + index][dataPosition];
        });

        /** Adjust each value to make it a percentage of the total rather
         *  than the raw number.  This will allow comparisons over time
         *  periods where there is a large variation in the raw numbers.
         */
        if (sumValues > 0) {
            referenceData.forEach(function(element, index, array) {
                dataStore['val' + index][dataPosition] = (dataStore['val' + index][dataPosition] / sumValues * 100).toFixed(2);
            });
        }
    }
    return dataStore;

}


/** This function returns a promise after a delay.
 * When used with promise chaining, this allows the execution to be paused
 * for a priod of time.  This is used to controlr the rate 
 * of calls to the analytics API.
 */
function rateLimitDelay() {
    return new Promise(function(resolve) {
        setTimeout(resolve, 200);
    });
}


/**
 * Extend the Embed APIs `gapi.analytics.report.Data` component to
 * return a promise the is fulfilled with the value returned by the API.
 * @param {Object} params The request parameters.
 * @return {Promise} A promise.
 */

function query(params) {
    return new Promise(function(resolve, reject) {
        var data = new gapi.analytics.report.Data({
            query: params
        });

        data.once('success', function(response) {
                resolve(response);
            })
            .once('error', function(response) {
                reject(response);
            })
            .execute();
    });
}


/**
 * Create a new canvas inside the specified element. Set it to be the width
 * and height of its container.
 * @param {string} id The id attribute of the element to host the canvas.
 * @return {RenderingContext} The 2D canvas context.
 */
function makeCanvas(id) {
    var container = document.getElementById(id);
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    container.innerHTML = '';
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    container.appendChild(canvas);

    return ctx;
}


/**
 * Create a visual legend inside the specified element based off of a
 * Chart.js dataset.
 * @param {string} id The id attribute of the element to host the legend.
 * @param {Array.<Object>} items A list of labels and colors for the legend.
 */
function generateLegend(id, items) {
    var legend = document.getElementById(id);
    legend.innerHTML = items.map(function(item) {
        var color = item.color || item.fillColor;
        var label = item.label;
        return '<li><i style="background:' + color + '"></i>' + label + '</li>';
    }).join('');
}