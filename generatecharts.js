/** Set up global types so JSHint doesn't trigger warnings that they are not defined */

/*global gapi, Chart */
/*global Promise, setTimeout, document, console */
/*global moment */
/*global statschartbuilder, StatsChart, WeekToPreviousWeekChart, YearToPreviousYearChart, QuarterlyChart */



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
    
    //Run each rendering function through a promise chain
    return renderWeekOverWeekSessions(ids, startDate, endDate)
        .then(function(result) {
            return renderYearOverYearSessions(ids, startDate, endDate);  
        })
        .then(function(result) {
            hideLoadingBar();
        })
        .catch(function(err) {
            console.error(err.message);
            hideLoadingBar();
        });
    

}

function renderWeekOverWeekSessions(ids, startDate, endDate) {

    var weekOverWeekSessions = new WeekToPreviousWeekChart(ids, startDate, endDate);
    
    //Retrieve data for last year
    return weekOverWeekSessions.queryGA({
        'ids': weekOverWeekSessions.ids,
        'dimensions': 'ga:dayOfWeek,ga:year,ga:nthWeek',
        'metrics': 'ga:sessions',
        'filters': 'ga:sessions>0',
        'start-date': weekOverWeekSessions.lastYearStartDate,
        'end-date': weekOverWeekSessions.lastYearEndDate,
        'sort': 'ga:dayOfWeek,-ga:sessions'
        })
            //process last year's data results
            .then(function(result) {
                weekOverWeekSessions.transformLastYearDataToMedians(result);
                
                return weekOverWeekSessions.delayExecution();
            })
            //Retrieve current week data
            .then(function(result) {  
                return weekOverWeekSessions.queryGA({
                    'ids': ids,
                    'dimensions': 'ga:date,ga:nthDay',
                    'metrics': 'ga:sessions',
                    'start-date': weekOverWeekSessions.currentWeekStartDate,
                    'end-date': weekOverWeekSessions.currentWeekEndDate
                });
            })
            //Add results for current week data
            .then(function(result) {
                weekOverWeekSessions.currentWeekData = result.rows.map(function(row) {
                    return +row[2];
                });
        
                return weekOverWeekSessions.delayExecution();
            })
            //Retrieve previous week data
            .then(function(result) {
                return weekOverWeekSessions.queryGA({
                    'ids': ids,
                    'dimensions': 'ga:date,ga:nthDay',
                    'metrics': 'ga:sessions',
                    'start-date': weekOverWeekSessions.lastWeekStartDate,
                    'end-date': weekOverWeekSessions.lastWeekEndDate
                });
            })
            //Add results for previous week data
            .then(function(result) {
                weekOverWeekSessions.previousWeekData = result.rows.map(function(row) {
                    return +row[2];
                });
        
                weekOverWeekSessions.labels = result.rows.map(function(row) {
                    return +row[0];
                });
        
                weekOverWeekSessions.labels = weekOverWeekSessions.labels.map(function(label) {
                    return moment(label, 'YYYYMMDD').format('ddd');
                });

                //Set up data and redner chart
                weekOverWeekSessions.chartData = {
                    labels: weekOverWeekSessions.labels,
                    datasets: [{
                        //Previous week
                        label: 'Week Starting ' + weekOverWeekSessions.lastWeekStarting,
                        fillColor: weekOverWeekSessions.fillColors[0],
                        strokeColor: weekOverWeekSessions.strokeColors[0],
                        pointColor: weekOverWeekSessions.strokeColors[0],
                        pointStrokeColor: "#fff",
                        data: weekOverWeekSessions.previousWeekData
                    }, {
                        //Current week
                        label: 'Week Starting ' + weekOverWeekSessions.currentWeekStarting,
                        fillColor: weekOverWeekSessions.fillColors[1],
                        strokeColor: weekOverWeekSessions.strokeColors[1],
                        pointColor: weekOverWeekSessions.strokeColors[1],
                        pointStrokeColor: "#fff",
                        data: weekOverWeekSessions.currentWeekData
                    }, {
                        //Previous year median
                        label: 'Median for the Last Year',
                        fillColor: weekOverWeekSessions.fillColors[2],
                        strokeColor: weekOverWeekSessions.strokeColors[2],
                        pointColor: weekOverWeekSessions.strokeColors[2],
                        pointStrokeColor: "#fff",
                        data: weekOverWeekSessions.lastYearData
                    }]
                };
        
            weekOverWeekSessions.createLineChart('weekly-session-chart-container', 'weekly-session-legend-container');
            
            return weekOverWeekSessions.delayExecution();
            })
        .then(function(){
            return true;
        })
        .catch(function(err) {
            console.error(err.message);
        });
}

function renderYearOverYearSessions(ids, startDate, endDate) {
    
    var yearOverYearSessions = new YearToPreviousYearChart(ids, startDate, endDate);
    
    yearOverYearSessions.labels = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                                  ];
    //Retrieve data for current year
    return yearOverYearSessions.queryGA({
            'ids': ids,
            'dimensions': 'ga:month,ga:nthMonth',
            'metrics': 'ga:sessions',
            'start-date': yearOverYearSessions.currentYearStartDate,
            'end-date': yearOverYearSessions.currentYearEndDate
        })
        .then(function(result) {
            yearOverYearSessions.currentYearData = result.rows.map(function(row) {
                return +row[2];
            });
            
            return yearOverYearSessions.delayExecution();
        })
        .then(function(result) {
            //Previous year data
            return yearOverYearSessions.queryGA({
                'ids': ids,
                'dimensions': 'ga:month,ga:nthMonth',
                'metrics': 'ga:sessions',
                'start-date': yearOverYearSessions.previousYearStartDate,
                'end-date': yearOverYearSessions.previousYearEndDate
            });
        })
        .then(function(result) {
            yearOverYearSessions.previousYearData = result.rows.map(function(row) {
                return +row[2];
            });

            // Ensure the data arrays are at least as long as the labels array.
            // Chart.js bar charts don't accept sparse datasets.
            for (var i = 0, len = yearOverYearSessions.labels.length; i < len; i++) {
                if (yearOverYearSessions.currentYearData[i] === undefined) {
                    yearOverYearSessions.currentYearData[i] = null;
                }

                if (yearOverYearSessions.previousYearData[i] === undefined) {
                    yearOverYearSessions.previousYearData[i] = null;  
                } 
            }
            
            //Set-up the chart data
            yearOverYearSessions.chartData = {
                labels: yearOverYearSessions.labels,
                datasets: [{
                    label: 'Last Year',
                    fillColor: yearOverYearSessions.fillColors[0],
                    strokeColor: yearOverYearSessions.strokeColors[0],
                    data: yearOverYearSessions.previousYearData
                }, {
                    label: 'This Year',
                    fillColor: yearOverYearSessions.fillColors[1],
                    strokeColor: yearOverYearSessions.strokeColors[1],
                    data: yearOverYearSessions.currentYearData

                }]
            };
        
            
            yearOverYearSessions.createBarChart('monthly-session-chart-container', 'monthly-session-legend-container');

            return yearOverYearSessions.delayExecution();
        })
        .then(function(){
            return true;
        })
        .catch(function(err) {
            console.error(err.message);
        });

}