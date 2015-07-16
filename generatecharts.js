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
            return renderWeekBrowserUsage(ids, startDate, endDate);  
        })
        .then(function(result) {
            return renderQuarterlyBrowserUsage(ids, startDate, endDate, result);  
        })
        .then(function(result) {
            return renderWeekIEUsage(ids, startDate, endDate);  
        })
        .then(function(result) {
            return renderQuarterlyIEUsage(ids, startDate, endDate, result);  
        })
        .then(function(result) {
            return renderWeekFirefoxUsage(ids, startDate, endDate);  
        })
        .then(function(result) {
            return renderQuarterlyFirefoxUsage(ids, startDate, endDate, result);  
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
    quarterlyContentUsage.gaFilters = 'ga:pageTitle!=Redirect;ga:pageviews>10';
        
    //Prepare topFiveData data for top five    
    return quarterlyContentUsage.retrieveTopFive()
        .then(function(result) {
            //Build query and label strings
            quarterlyContentUsage.buildQueryAndLabels();
            return quarterlyContentUsage.delayExecution();
        })
        //Retrieve Data
        .then(function(result) {
            //Build query and label strings
            return quarterlyContentUsage.retrieveGAData();
        })
        .then(function(result) {
            //Set up data in chart format and render chart
            quarterlyContentUsage.setUpChartData();
            quarterlyContentUsage.createLineChart('quarterly-content-chart-container','quarterly-content-legend-container');

            return quarterlyContentUsage.delayExecution();
        })
        .then(function(){
            return true;
        })
        .catch(function(err) {
            console.log(err.message);
        });
}

function renderWeekBrowserUsage(ids, startDate, endDate) {

    var weekBrowserUsage = new WeekDoughnutChart(ids, startDate, endDate);
    
    weekBrowserUsage.gaDimensions = 'ga:browser';
    weekBrowserUsage.gaMetrics = 'ga:pageviews';
    weekBrowserUsage.gaSort = '-ga:pageviews';
    
    //Retrieve data for week and set up data in doughnut chart format
    return weekBrowserUsage.retrieveAndSetUpGAData()
        .then(function(result) {  
            weekBrowserUsage.createDoughnutChart('weekly-browser-chart-container','weekly-browser-legend-container');
            return weekBrowserUsage.delayExecution();
        })
        .then(function(){
            return weekBrowserUsage.topFiveData;
        })
        .catch(function(err) {
            console.log(err.message);
        });
}

function renderQuarterlyBrowserUsage(ids, startDate, endDate, topFiveData) {
    //Create object and pass in the GA query term and top five data
    var quarterlyBrowserUsage = new QuarterlyChart(ids, startDate, endDate, 'browser', topFiveData);
    
    quarterlyBrowserUsage.gaDimensions = 'ga:browser';
    quarterlyBrowserUsage.gaMetrics = 'ga:pageviews';
        
    //Prepare topFiveData data for top five    
    return quarterlyBrowserUsage.retrieveTopFive()
        .then(function(result) {
            //Build query and label strings
            quarterlyBrowserUsage.buildQueryAndLabels();
            return quarterlyBrowserUsage.delayExecution();
        })
        //Retrieve Data
        .then(function(result) {
            //Build query and label strings
            return quarterlyBrowserUsage.retrieveGAData();
        })
        .then(function(result) {
            //Set up data in chart format and render chart
            quarterlyBrowserUsage.setUpChartData();
            quarterlyBrowserUsage.createLineChart('quarterly-browser-chart-container','quarterly-browser-legend-container');

            return quarterlyBrowserUsage.delayExecution();
        })
        .then(function(){
            return true;
        })
        .catch(function(err) {
            console.log(err.message);
        });
}

function renderWeekIEUsage(ids, startDate, endDate) {

    var weekIEUsage = new WeekDoughnutChart(ids, startDate, endDate);

    
    weekIEUsage.gaDimensions = 'ga:browserVersion';
    weekIEUsage.gaMetrics = 'ga:pageviews';
    weekIEUsage.gaFilters = 'ga:browser==Internet Explorer';
    weekIEUsage.gaSort = '-ga:pageviews';
    
    //Retrieve data for week and set up data in doughnut chart format
    return weekIEUsage.retrieveAndSetUpGAData()
        .then(function(result) {  
            weekIEUsage.createDoughnutChart('weekly-ieversion-chart-container','weekly-ieversion-legend-container');
            return weekIEUsage.delayExecution();
        })
        .then(function(){
            return weekIEUsage.topFiveData;
        })
        .catch(function(err) {
            console.log(err.message);
        });
}

function renderQuarterlyIEUsage(ids, startDate, endDate, topFiveData) {
    //Create object and pass in the GA query term and top five data
    var quarterlyIEUsage = new QuarterlyChart(ids, startDate, endDate, 'browserVersion', topFiveData);
    
    quarterlyIEUsage.gaDimensions = 'ga:browserVersion';
    quarterlyIEUsage.gaMetrics = 'ga:pageviews';
    quarterlyIEUsage.gaFilters = 'ga:browser==Internet Explorer';    
    quarterlyIEUsage.queryPrefix = 'ga:browser==Internet Explorer;';
        
    //Prepare topFiveData data for top five    
    return quarterlyIEUsage.retrieveTopFive()
        .then(function(result) {
            //Build query and label strings
            quarterlyIEUsage.buildQueryAndLabels();
            return quarterlyIEUsage.delayExecution();
        })
        //Retrieve Data
        .then(function(result) {
            //Build query and label strings
            return quarterlyIEUsage.retrieveGAData();
        })
        .then(function(result) {
            //Set up data in chart format and render chart
            quarterlyIEUsage.setUpChartData();
            quarterlyIEUsage.createLineChart('quarterly-ieversion-chart-container','quarterly-ieversion-legend-container');

            return quarterlyIEUsage.delayExecution();
        })
        .then(function(){
            return true;
        })
        .catch(function(err) {
            console.log(err.message);
        });
}

function renderWeekFirefoxUsage(ids, startDate, endDate) {

    var weekFirefoxUsage = new WeekDoughnutChart(ids, startDate, endDate);

    
    weekFirefoxUsage.gaDimensions = 'ga:browserVersion';
    weekFirefoxUsage.gaMetrics = 'ga:pageviews';
    weekFirefoxUsage.gaFilters = 'ga:browser==Firefox';
    weekFirefoxUsage.gaSort = '-ga:pageviews';
    
    //Retrieve data for week and set up data in doughnut chart format
    return weekFirefoxUsage.retrieveAndSetUpGAData()
        .then(function(result) {  
            weekFirefoxUsage.createDoughnutChart('weekly-firefoxversion-chart-container','weekly-firefoxversion-legend-container');
            return weekFirefoxUsage.delayExecution();
        })
        .then(function(){
            return weekFirefoxUsage.topFiveData;
        })
        .catch(function(err) {
            console.log(err.message);
        });
}

function renderQuarterlyFirefoxUsage(ids, startDate, endDate, topFiveData) {
    //Create object and pass in the GA query term and top five data
    var quarterlyFirefoxUsage = new QuarterlyChart(ids, startDate, endDate, 'browserVersion', topFiveData);
    
    quarterlyFirefoxUsage.gaDimensions = 'ga:browserVersion';
    quarterlyFirefoxUsage.gaMetrics = 'ga:pageviews';
    quarterlyFirefoxUsage.gaFilters = 'ga:browser==Firefox';
    quarterlyFirefoxUsage.queryPrefix = 'ga:browser==Firefox;';
        
    //Prepare topFiveData data for top five    
    return quarterlyFirefoxUsage.retrieveTopFive()
        .then(function(result) {
            //Build query and label strings
            quarterlyFirefoxUsage.buildQueryAndLabels();
            return quarterlyFirefoxUsage.delayExecution();
        })
        //Retrieve Data
        .then(function(result) {
            //Build query and label strings
            return quarterlyFirefoxUsage.retrieveGAData();
        })
        .then(function(result) {
            //Set up data in chart format and render chart
            quarterlyFirefoxUsage.setUpChartData();
            quarterlyFirefoxUsage.createLineChart('quarterly-firefoxversion-chart-container','quarterly-firefoxversion-legend-container');

            return quarterlyFirefoxUsage.delayExecution();
        })
        .then(function(){
            return true;
        })
        .catch(function(err) {
            console.log(err.message);
        });
}