/** Set up global types so JSHint doesn't trigger warnings that they are not defined */

/*global gapi, Chart */
/*global Promise, setTimeout, document, console */
/*global moment */
/*global statschartbuilder, StatsChart, WeekToPreviousWeekChart, YearToPreviousYearChart, WeekDoughnutChart, QuarterlyChart */



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
            return renderWeekOverWeekSessionDuration(ids, startDate, endDate);  
        })
        .then(function(result) {
            return renderYearOverYearSessionDuration(ids, startDate, endDate);  
        })
        .then(function(result) {
            return renderWeekContentUsage(ids, startDate, endDate);  
        })
        .then(function(result) {
            return renderQuarterlyContentUsage(ids, startDate, endDate, result);  
        })
        .then(function(result) {
            hideLoadingBar();
        })
        .catch(function(err) {
            console.log(err.message);
            hideLoadingBar();
        });
    

}

function renderWeekOverWeekSessions(ids, startDate, endDate) {

    var weekOverWeekSessions = new WeekToPreviousWeekChart(ids, startDate, endDate);
    
    weekOverWeekSessions.gaLastYearDimensions = 'ga:dayOfWeek,ga:year,ga:nthWeek';
    weekOverWeekSessions.gaDimensions = 'ga:date,ga:nthDay';
    weekOverWeekSessions.gaMetrics = 'ga:sessions';
    weekOverWeekSessions.gaFilters = 'ga:sessions>0';
    weekOverWeekSessions.gaSort = 'ga:dayOfWeek,-ga:sessions';

    
    
    //Retrieve GA Data
    return weekOverWeekSessions.retrieveGAData()
            .then(function(result) {
                //Set up data in chart format and render chart
                weekOverWeekSessions.setUpChartData();
                weekOverWeekSessions.createLineChart('weekly-session-chart-container', 'weekly-session-legend-container');
            
                return weekOverWeekSessions.delayExecution();
            })
        .then(function(){
            return true;
        })
        .catch(function(err) {
            console.log(err.message);
        });
}

function renderYearOverYearSessions(ids, startDate, endDate) {
    
    var yearOverYearSessions = new YearToPreviousYearChart(ids, startDate, endDate);
    
    yearOverYearSessions.gaDimensions = 'ga:month,ga:nthMonth';
    yearOverYearSessions.gaMetrics = 'ga:sessions';
    
    //Retrieve GA Data
    return yearOverYearSessions.retrieveGAData()
            .then(function(result) {
                //Set up data in chart format and render chart
                yearOverYearSessions.setUpChartData();
                yearOverYearSessions.createBarChart('monthly-session-chart-container', 'monthly-session-legend-container');

                return yearOverYearSessions.delayExecution();
            })
            .then(function(){
                return true;
            })
            .catch(function(err) {
                console.log(err.message);
            });
}

function renderWeekOverWeekSessionDuration(ids, startDate, endDate) {

    var weekOverWeekSessionDuration = new WeekToPreviousWeekChart(ids, startDate, endDate);
    
    weekOverWeekSessionDuration.gaDimensions = 'ga:date,ga:nthDay';
    weekOverWeekSessionDuration.gaLastYearDimensions = 'ga:dayOfWeek,ga:year,ga:nthWeek';
    weekOverWeekSessionDuration.gaMetrics = 'ga:avgSessionDuration';
    weekOverWeekSessionDuration.gaFilters = 'ga:avgSessionDuration>0';
    weekOverWeekSessionDuration.gaSort = 'ga:dayOfWeek,-ga:avgSessionDuration';
    
    //Retrieve GA Data
    return weekOverWeekSessionDuration.retrieveGAData()
        //Post process data to convert it from seconds to minutes
        .then(function(result) {  
            var dataConvertedToMinutes = [];
        
            //Convert last year data from seconds to minutes
            weekOverWeekSessionDuration.lastYearData.forEach(function(elementValue) {
                dataConvertedToMinutes.push((elementValue / 60).toFixed(2));
            });
            weekOverWeekSessionDuration.lastYearData = dataConvertedToMinutes;

            //Convert previous week data from seconds to minutes
            dataConvertedToMinutes = [];
            weekOverWeekSessionDuration.previousWeekData.forEach(function(elementValue) {
                dataConvertedToMinutes.push((elementValue / 60).toFixed(2));
            });
            weekOverWeekSessionDuration.previousWeekData = dataConvertedToMinutes;

            //Convert current week data from seconds to minutes
            dataConvertedToMinutes = [];
            weekOverWeekSessionDuration.currentWeekData.forEach(function(elementValue) {
                dataConvertedToMinutes.push((elementValue / 60).toFixed(2));
            });
            weekOverWeekSessionDuration.currentWeekData = dataConvertedToMinutes;

        
            return true;
        })
        .then(function(result) {
            //Set up data in chart format and render chart
            weekOverWeekSessionDuration.setUpChartData();
            weekOverWeekSessionDuration.createLineChart('weekly-session-duration-chart-container', 'weekly-session-duration-legend-container');
            
            return weekOverWeekSessionDuration.delayExecution();
        })
        .then(function(){
            return true;
        })
        .catch(function(err) {
            console.log(err.message);
        });
}

function renderYearOverYearSessionDuration(ids, startDate, endDate) {
    
    var yearOverYearSessionDuration = new YearToPreviousYearChart(ids, startDate, endDate);
    
    yearOverYearSessionDuration.gaDimensions = 'ga:month,ga:nthMonth';
    yearOverYearSessionDuration.gaMetrics = 'ga:avgSessionDuration';
    
    
    return yearOverYearSessionDuration.retrieveGAData()
        //Post process data to convert it from seconds to minutes
        .then(function(result) {  
            var dataConvertedToMinutes = [];
        
            //Convert current year data from seconds to minutes
            yearOverYearSessionDuration.currentYearData.forEach(function(elementValue) {
                dataConvertedToMinutes.push((elementValue / 60).toFixed(2));
            });
            yearOverYearSessionDuration.currentYearData = dataConvertedToMinutes;

            //Convert previous year data from seconds to minutes
            dataConvertedToMinutes = [];
            yearOverYearSessionDuration.previousYearData.forEach(function(elementValue) {
                dataConvertedToMinutes.push((elementValue / 60).toFixed(2));
            });
            yearOverYearSessionDuration.previousYearData = dataConvertedToMinutes;
        
            return true;
        })
        .then(function(result) {
            //Set up data in chart format and render chart
            yearOverYearSessionDuration.setUpChartData();            
            yearOverYearSessionDuration.createBarChart('monthly-session-duration-chart-container', 'monthly-session-duration-legend-container');

            return yearOverYearSessionDuration.delayExecution();
        })
        .then(function(){
            return true;
        })
        .catch(function(err) {
            console.log(err.message);
        });
}

function renderWeekContentUsage(ids, startDate, endDate) {

    var weekContentUsage = new WeekDoughnutChart(ids, startDate, endDate);
    
    weekContentUsage.gaDimensions = 'ga:pageTitle';
    weekContentUsage.gaMetrics = 'ga:pageviews';
    weekContentUsage.gaFilters = 'ga:pageTitle!=Redirect;ga:pageviews>10';
    weekContentUsage.gaSort = '-ga:pageviews';
    
    //Retrieve data for week and set up data in doughnut chart format
    return weekContentUsage.retrieveAndSetUpGAData()
        .then(function(result) {  
            weekContentUsage.createDoughnutChart('weekly-content-chart-container','weekly-content-legend-container');
            return weekContentUsage.delayExecution();
        })
        .then(function(){
            return weekContentUsage.topFiveData;
        })
        .catch(function(err) {
            console.log(err.message);
        });
}

function renderQuarterlyContentUsage(ids, startDate, endDate, topFiveData) {
    //Create object and pass in the GA query term and top five data
    var quarterlyContentUsage = new QuarterlyChart(ids, startDate, endDate, 'pageTitle', topFiveData);
    
    quarterlyContentUsage.gaDimensions = 'ga:pageTitle';
    quarterlyContentUsage.gaMetrics = 'ga:pageviews';
    
    //Prepare serachTerms data for top five
    //return quarterlyContentUsage.retrieveTopFive()
    //Prepare query string and date periods
    //    .then(function(result) {
            return quarterlyContentUsage.setQueryTerms()//;
      //  })
        .then(function(result) {
            return quarterlyContentUsage.queryGA({
                    'ids': quarterlyContentUsage.gaIds,
                    'dimensions': quarterlyContentUsage.gaDimensions,
                    'metrics': quarterlyContentUsage.gaMetrics,
                    'filters': quarterlyContentUsage.pageQuery,
                    'start-date': quarterlyContentUsage.periodDates[0],
                    'end-date': quarterlyContentUsage.periodDates[1]
            });
        })
        .then(function(result) {
            quarterlyContentUsage.processQuarterlyResults(result);
            return quarterlyContentUsage.delayExecution();
        })
        .then(function(result) {
            return quarterlyContentUsage.queryGA({
                'ids': quarterlyContentUsage.gaIds,
                'dimensions': quarterlyContentUsage.gaDimensions,
                'metrics': quarterlyContentUsage.gaMetrics,
                'filters': quarterlyContentUsage.pageQuery,
                'start-date': quarterlyContentUsage.periodDates[2],
                'end-date': quarterlyContentUsage.periodDates[3]
            });
        })
        .then(function(result) {
            quarterlyContentUsage.processQuarterlyResults(result);
            return quarterlyContentUsage.delayExecution();
        })
        .then(function(result) {
            return quarterlyContentUsage.queryGA({
                'ids': quarterlyContentUsage.gaIds,
                'dimensions': quarterlyContentUsage.gaDimensions,
                'metrics': quarterlyContentUsage.gaMetrics,
                'filters': quarterlyContentUsage.pageQuery,
                'start-date': quarterlyContentUsage.periodDates[4],
                'end-date': quarterlyContentUsage.periodDates[5]
            });
        })
        .then(function(result) {
            quarterlyContentUsage.processQuarterlyResults(result);
            return quarterlyContentUsage.delayExecution();
        })
        .then(function(result) {
            return quarterlyContentUsage.queryGA({
                'ids': quarterlyContentUsage.gaIds,
                'dimensions': quarterlyContentUsage.gaDimensions,
                'metrics': quarterlyContentUsage.gaMetrics,
                'filters': quarterlyContentUsage.pageQuery,
                'start-date': quarterlyContentUsage.periodDates[6],
                'end-date': quarterlyContentUsage.periodDates[7]
            });
        })
        .then(function(result) {
            quarterlyContentUsage.processQuarterlyResults(result);
            quarterlyContentUsage.setUpChartData();
            quarterlyContentUsage.createLineChart('quarterly-content-chart-container','quarterly-content-legend-container');
            return true;
        })
        .catch(function(err) {
            console.log(err.message);
        });
}