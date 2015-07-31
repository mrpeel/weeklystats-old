/** Set up global types so JSHint doesn't trigger warnings that they are not defined */

/*global gapi, Chart */
/*global Promise, setTimeout, document, console */
/*global moment */
/*global statschartbuilder, StatsChart, WeekToPreviousWeekChart, YearToPreviousYearChart, WeekDoughnutChart, QuarterlyChart, ActivityData */



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
            return renderEventCharts(ids, startDate, endDate);  
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

/*
*  Rendering for GA event values
*/
function renderEventCharts(ids, startDate, endDate) {
        
    showLoadingBar();
    
    var activityData = new ActivityData(ids, startDate, endDate);
    
    activityData.gaDimensions = 'ga:eventCategory,ga:eventLabel';
    activityData.gaMetrics = 'ga:totalEvents';

    
    //Query and parse current week Activity Data
    return activityData.retrieveAndParseGAData()
        .then(function(result) {
            //Render overall activity & search charts
            activityData.prepareDoughnutChartData(activityData.overallActivityData.Current);
            activityData.createDoughnutChart('overall-activity-current-week-chart-container','overall-activity-current-week-legend-container');

            activityData.prepareDoughnutChartData(activityData.overallSearchBreakdownData.Current);
            activityData.createDoughnutChart('overall-search-current-week-chart-container','overall-search-current-week-legend-container');

            activityData.prepareBarChartData(activityData.overallActivityData.Current, activityData.overallActivityData.Previous, activityData.overallActivityData.Year);
            activityData.createBarChart('overall-activity-history-chart-container','overall-activity-history-legend-container');

            activityData.prepareBarChartData(activityData.overallSearchBreakdownData.Current, activityData.overallSearchBreakdownData.Previous,
                                             activityData.overallSearchBreakdownData.Year);
            activityData.createBarChart('overall-search-history-chart-container','overall-search-history-legend-container');

            //Render LASSI General Charts
            activityData.prepareDoughnutChartData(activityData.applicationActivityData.Current['LASSI General']);
            activityData.createDoughnutChart('lassi-activity-current-week-chart-container','lassi-activity-current-week-legend-container');

            activityData.prepareDoughnutChartData(activityData.applicationSearchBreakdownData.Current['LASSI General']);
            activityData.createDoughnutChart('lassi-search-current-week-chart-container','lassi-search-current-week-legend-container');

            activityData.prepareBarChartData(activityData.applicationActivityData.Current['LASSI General'], activityData.applicationActivityData.Previous['LASSI General'],
                                             activityData.applicationActivityData.Year['LASSI General']);
            activityData.createBarChart('lassi-activity-history-chart-container','lassi-activity-history-legend-container');

            activityData.prepareBarChartData(activityData.applicationSearchBreakdownData.Current['LASSI General'], activityData.applicationSearchBreakdownData.Previous['LASSI General'],
                                             activityData.applicationSearchBreakdownData.Year['LASSI General']);
            activityData.createBarChart('lassi-search-history-chart-container','lassi-search-history-legend-container');

            //Render LASSI SPEAR activity charts
            activityData.prepareDoughnutChartData(activityData.applicationActivityData.Current['LASSI SPEAR Including Map Based Search']);
            activityData.createDoughnutChart('spear-activity-current-week-chart-container','spear-activity-current-week-legend-container');

            activityData.prepareDoughnutChartData(activityData.applicationSearchBreakdownData.Current['LASSI SPEAR Including Map Based Search']);
            activityData.createDoughnutChart('spear-search-current-week-chart-container','spear-search-current-week-legend-container');

            activityData.prepareBarChartData(activityData.applicationActivityData.Current['LASSI SPEAR Including Map Based Search'], 
                                             activityData.applicationActivityData.Previous['LASSI SPEAR Including Map Based Search'], 
                                             activityData.applicationActivityData.Year['LASSI SPEAR Including Map Based Search']);
            activityData.createBarChart('spear-activity-history-chart-container','spear-activity-history-legend-container');

            activityData.prepareBarChartData(activityData.applicationSearchBreakdownData.Current['LASSI SPEAR Including Map Based Search'], 
                                            activityData.applicationSearchBreakdownData.Previous['LASSI SPEAR Including Map Based Search'],
                                            activityData.applicationSearchBreakdownData.Year['LASSI SPEAR Including Map Based Search']);
            activityData.createBarChart('spear-search-history-chart-container','spear-search-history-legend-container');

            //Render SMES activity charts
            activityData.prepareDoughnutChartData(activityData.applicationActivityData.Current.SMES);
            activityData.createDoughnutChart('smes-activity-current-week-chart-container','smes-activity-current-week-legend-container');

            activityData.prepareDoughnutChartData(activityData.applicationSearchBreakdownData.Current.SMES);
            activityData.createDoughnutChart('smes-search-current-week-chart-container','smes-search-current-week-legend-container');

            activityData.prepareBarChartData(activityData.applicationActivityData.Current.SMES, activityData.applicationActivityData.Previous.SMES,
                                             activityData.applicationActivityData.Year.SMES);
            activityData.createBarChart('smes-activity-history-chart-container','smes-activity-history-legend-container');

            activityData.prepareBarChartData(activityData.applicationSearchBreakdownData.Current.SMES, activityData.applicationSearchBreakdownData.Previous.SMES,
                                             activityData.applicationSearchBreakdownData.Year.SMES);
            activityData.createBarChart('smes-search-history-chart-container','smes-search-history-legend-container');

            //Render VICNAMES activity charts
            activityData.prepareDoughnutChartData(activityData.applicationActivityData.Current.VICNAMES);
            activityData.createDoughnutChart('vicnames-activity-current-week-chart-container','vicnames-activity-current-week-legend-container');

            activityData.prepareDoughnutChartData(activityData.applicationSearchBreakdownData.Current.VICNAMES);
            activityData.createDoughnutChart('vicnames-search-current-week-chart-container','vicnames-search-current-week-legend-container');

            activityData.prepareBarChartData(activityData.applicationActivityData.Current.VICNAMES, activityData.applicationActivityData.Previous.VICNAMES,
                                             activityData.applicationActivityData.Year.VICNAMES);
            activityData.createBarChart('vicnames-activity-history-chart-container','vicnames-activity-history-legend-container');

            activityData.prepareBarChartData(activityData.applicationSearchBreakdownData.Current.VICNAMES, activityData.applicationSearchBreakdownData.Previous.VICNAMES, 
                                            activityData.applicationSearchBreakdownData.Year.VICNAMES);
            activityData.createBarChart('vicnames-search-history-chart-container','vicnames-search-history-legend-container');


            //Render View My Titles activity charts
            activityData.prepareDoughnutChartData(activityData.applicationActivityData.Current['View My Titles']);
            activityData.createDoughnutChart('vmt-activity-current-week-chart-container','vmt-activity-current-week-legend-container');

            activityData.prepareDoughnutChartData(activityData.applicationSearchBreakdownData.Current['View My Titles']);
            activityData.createDoughnutChart('vmt-search-current-week-chart-container','vmt-search-current-week-legend-container');

            activityData.prepareBarChartData(activityData.applicationActivityData.Current['View My Titles'], activityData.applicationActivityData.Previous['View My Titles'], 
                                            activityData.applicationActivityData.Year['View My Titles']);
            activityData.createBarChart('vmt-activity-history-chart-container','vmt-activity-history-legend-container');

            activityData.prepareBarChartData(activityData.applicationSearchBreakdownData.Current['View My Titles'], activityData.applicationSearchBreakdownData.Previous['View My Titles'],
                                            activityData.applicationSearchBreakdownData.Year['View My Titles']);
            activityData.createBarChart('vmt-search-history-chart-container','vmt-search-history-legend-container');

            //Render Historical Aerial Photographs activity chart
            activityData.prepareDoughnutChartData(activityData.applicationActivityData.Current['Historical Aerial Photographs']);
            activityData.createDoughnutChart('hap-activity-current-week-chart-container','hap-activity-current-week-legend-container');

            activityData.prepareDoughnutChartData(activityData.applicationSearchBreakdownData.Current['Historical Aerial Photographs']);
            activityData.createDoughnutChart('hap-search-current-week-chart-container','hap-search-current-week-legend-container');

            activityData.prepareBarChartData(activityData.applicationActivityData.Current['Historical Aerial Photographs'], 
                                             activityData.applicationActivityData.Previous['Historical Aerial Photographs'],
                                             activityData.applicationActivityData.Year['Historical Aerial Photographs']);
            activityData.createBarChart('hap-activity-history-chart-container','hap-activity-history-legend-container');

            activityData.prepareBarChartData(activityData.applicationSearchBreakdownData.Current['Historical Aerial Photographs'], 
                                            activityData.applicationSearchBreakdownData.Previous['Historical Aerial Photographs'], 
                                            activityData.applicationSearchBreakdownData.Year['Historical Aerial Photographs']);
            activityData.createBarChart('hap-search-history-chart-container','hap-search-history-legend-container');

            //Render TPI Confirm on Map activity chart
            activityData.prepareDoughnutChartData(activityData.applicationActivityData.Current['TPI Confirm on Map']);
            activityData.createDoughnutChart('tcom-activity-current-week-chart-container','tcom-activity-current-week-legend-container');

            activityData.prepareBarChartData(activityData.applicationActivityData.Current['TPI Confirm on Map'], activityData.applicationActivityData.Previous['TPI Confirm on Map'], 
                                            activityData.applicationActivityData.Year['TPI Confirm on Map']);
            activityData.createBarChart('tcom-activity-history-chart-container','tcom-activity-history-legend-container');

        })
        .then(function(result) {
            hideLoadingBar();
        })
        .catch(function(err) {
            console.log(err.message);
            hideLoadingBar();
        });
    

}

function renderEventBarCharts(ids, startDate, endDate) {
        
    showLoadingBar();
    
    //Create object and pass in the GA query term and top five data
    var activityData = new ActivityData(ids, startDate, endDate, 'Current');
    
    activityData.gaDimensions = 'ga:eventCategory,ga:eventLabel';
    activityData.gaMetrics = 'ga:totalEvents';


    
    //Query and parse current week Activity Data
    return activityData.retrieveAndParseGAData()
        .then(function(result) {
            //Render overall activity chart
/*        activityData.prepareBarChartData(activityData.overallActivityData);
        activityData.createBarChart('overall-activity-current-week-chart-container','overall-activity-current-week-legend-container');

            return activityData.delayExecution();
        })
        .then(function() {
            //Render overall search chart
        activityData.prepareBarChartData(activityData.overallSearchBreakdownData);
        activityData.createBarChart('overall-search-current-week-chart-container','overall-search-current-week-legend-container');

            return activityData.delayExecution();
        })
        .then(function(result) {
            //Attempt to render LASSI General activity chart
        activityData.prepareBarChartData(activityData.applicationActivityData['LASSI General'] || []);
        activityData.createBarChart('lassi-activity-current-week-chart-container','lassi-activity-current-week-legend-container');

            return activityData.delayExecution();
        })
        .then(function() {
            //Attempt to render LASSI General search chart
        activityData.prepareBarChartData(activityData.applicationSearchBreakdownData['LASSI General'] || []);
        activityData.createBarChart('lassi-search-current-week-chart-container','lassi-search-current-week-legend-container');

            return activityData.delayExecution();
        })
        .then(function(result) {
            //Attempt to render LASSI SPEAR activity chart
        activityData.prepareBarChartData(activityData.applicationActivityData['LASSI SPEAR Including Map Based Search'] || []);
        activityData.createBarChart('spear-activity-current-week-chart-container','spear-activity-current-week-legend-container');

            return activityData.delayExecution();
        })
        .then(function() {
            //Attempt to render LASSI SPEAR search chart
        activityData.prepareBarChartData(activityData.applicationSearchBreakdownData['LASSI SPEAR Including Map Based Search'] || []);
        activityData.createBarChart('spear-search-current-week-chart-container','spear-search-current-week-legend-container');

            return activityData.delayExecution();
        })
        .then(function(result) {
            //Attempt to render SMES activity chart
        activityData.prepareBarChartData(activityData.applicationActivityData.SMES || []);
        activityData.createBarChart('smes-activity-current-week-chart-container','smes-activity-current-week-legend-container');

            return activityData.delayExecution();
        })
        .then(function() {
            //Attempt to render SMES search chart
        activityData.prepareBarChartData(activityData.applicationSearchBreakdownData.SMES || []);
        activityData.createBarChart('smes-search-current-week-chart-container','smes-search-current-week-legend-container');

            return activityData.delayExecution();
        })
        .then(function(result) {
            //Attempt to render VICNAMES activity chart
        activityData.prepareBarChartData(activityData.applicationActivityData.VICNAMES || []);
        activityData.createBarChart('vicnames-activity-current-week-chart-container','vicnames-activity-current-week-legend-container');

            return activityData.delayExecution();
        })
        .then(function() {
            //Attempt to render VICNAMES search chart
        activityData.prepareBarChartData(activityData.applicationSearchBreakdownData.VICNAMES || []);
        activityData.createBarChart('vicnames-search-current-week-chart-container','vicnames-search-current-week-legend-container');

            return activityData.delayExecution();
        })
        .then(function(result) {
            //Attempt to render View My Titles activity chart
        activityData.prepareBarChartData(activityData.applicationActivityData['View My Titles'] || []);
        activityData.createBarChart('vmt-activity-current-week-chart-container','vmt-activity-current-week-legend-container');

            return activityData.delayExecution();
        })
        .then(function() {
            //Attempt to render View My Titles search chart
        activityData.prepareBarChartData(activityData.applicationSearchBreakdownData['View My Titles'] || []);
        activityData.createBarChart('vmt-search-current-week-chart-container','vmt-search-current-week-legend-container');

            return activityData.delayExecution();
        })
        .then(function(result) {
            //Attempt to render Historical Aerial Photographs activity chart
        activityData.prepareBarChartData(activityData.applicationActivityData['Historical Aerial Photographs'] || []);
        activityData.createBarChart('hap-activity-current-week-chart-container','hap-activity-current-week-legend-container');

            return activityData.delayExecution();
        })
        .then(function() {
            //Attempt to render Historical Aerial Photographs search chart
        activityData.prepareBarChartData(activityData.applicationSearchBreakdownData['Historical Aerial Photographs'] || []);
        activityData.createBarChart('hap-search-current-week-chart-container','hap-search-current-week-legend-container');

            return activityData.delayExecution();
        })
        .then(function(result) {
            //Attempt to render TPI Confirm on Map activity chart
        activityData.prepareBarChartData(activityData.applicationActivityData['TPI Confirm on Map'] || []);
        activityData.createBarChart('tcom-activity-current-week-chart-container','tcom-activity-current-week-legend-container');

            return activityData.delayExecution();
        })
        //Query and parse previous week Activity Data
        .then(function(result) {        
            return activityData.retrieveAndParseGAData();
        })
        .then(function(){*/
            //Render overall activity chart
            activityData.prepareBarChartData(activityData.overallActivityData.Current, activityData.overallActivityData.Previous, activityData.overallActivityData.Year);
            activityData.createBarChart('overall-activity-previous-week-chart-container','overall-activity-previous-week-legend-container');

            return activityData.delayExecution();
        })
        .then(function() {
            //Render overall search chart
            activityData.prepareBarChartData(activityData.overallSearchBreakdownData.Current, activityData.overallSearchBreakdownData.Previous,    
                                                activityData.overallSearchBreakdownData.Year);
            activityData.createBarChart('overall-search-previous-week-chart-container','overall-search-previous-week-legend-container');

            return activityData.delayExecution();
        })
        .then(function(){
            //Render overall activity chart
            activityData.prepareBarChartData(activityData.overallActivityData.Current, activityData.overallActivityData.Previous, activityData.overallActivityData.Year);
            activityData.createBarChart('overall-activity-last-year-chart-container','overall-activity-last-year-legend-container');

            return activityData.delayExecution();
        })
        .then(function() {
            //Render overall search chart
            activityData.prepareBarChartData(activityData.overallSearchBreakdownData.Current, activityData.overallSearchBreakdownData.Previous,
                                             activityData.overallSearchBreakdownData.Year);
            activityData.createBarChart('overall-search-last-year-chart-container','overall-search-last-year-legend-container');

            return activityData.delayExecution();
        })
        .then(function(result) {
            hideLoadingBar();
        })
        .catch(function(err) {
            console.log(err.message);
            hideLoadingBar();
        });
    

}