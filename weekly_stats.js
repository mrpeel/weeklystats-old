
/** Globally used colour pallete for chart fills
 */
  var fillColors = ['rgba(115,115,115,0.33)','rgba(241,90,96,0.33)','rgba(122,195,106,0.33)','rgba(90,155,212,0.33)','rgba(250,167,91,0.33)','rgba(158,103,171,0.33)',
                    'rgba(193,254,227,0.33)', 'rgba(215,127,80,0.33)'];
  var strokeColors = ['rgba(115,115,115,0.9)','rgba(241,90,96,0.9)','rgba(122,195,106,0.9)','rgba(90,155,212,0.9)','rgba(250,167,91,0.9)','rgba(158,103,171,0.9)',
                    'rgba(193,254,227,0.9)', 'rgba(215,127,80,0.9)'];


  function renderWeekOverWeekChart(ids, startDate, endDate) {



    var currentWeek = query({
      'ids': ids,
      'dimensions': 'ga:date,ga:nthDay',
      'metrics': 'ga:sessions',
      'start-date': startDate,
      'end-date': endDate
      });

    var previousWeek = query({
      'ids': ids,
      'dimensions': 'ga:date,ga:nthDay',
      'metrics': 'ga:sessions',
      'start-date': moment(startDate).subtract(7, 'days').format('YYYY-MM-DD'),
      'end-date':  moment(endDate).subtract(7, 'days').format('YYYY-MM-DD')
      });


    Promise.all([currentWeek, previousWeek]).then(function(results) {

      var data1 = results[0].rows.map(function(row) { return +row[2]; });
      var data2 = results[1].rows.map(function(row) { return +row[2]; });
      var labels = results[1].rows.map(function(row) { return +row[0]; });

      labels = labels.map(function(label) {
        return moment(label, 'YYYYMMDD').format('ddd');
      });

      var data = {
        labels : labels,
        datasets : [
          {
            //Set week ending date
            //label: 'Last Week',
            label: 'Week Starting ' + moment(startDate).subtract(7, 'days').format('DD/MM/YYYY'),
            fillColor : fillColors[0],
            strokeColor : strokeColors[0],
            pointColor : strokeColors[0],
            pointStrokeColor : "#fff",
            data : data2
          },
          {
            label: 'Week Starting ' + moment(startDate).format('DD/MM/YYYY'),
            fillColor : fillColors[1],
            strokeColor : strokeColors[1],
            pointColor : strokeColors[1],
            pointStrokeColor : "#fff",
            data : data1
          }
        ]
      };

      new Chart(makeCanvas('weekly-session-chart-container')).Line(data);
      generateLegend('weekly-session-legend-container', data.datasets);

      delay(renderYearOverYearChart, 500+ Math.random()*500, ids, endDate);
    });
  }


  /**
     * Draw the a chart.js bar chart with data from the specified view that
     * overlays session data for the current year over session data for the
     * previous year, grouped by month.
     */
    function renderYearOverYearChart(ids, endDate) {

      var thisYear = query({
        'ids': ids,
        'dimensions': 'ga:month,ga:nthMonth',
        'metrics': 'ga:sessions',
        'start-date': moment(endDate).date(1).month(0).format('YYYY-MM-DD'),
        'end-date': moment(endDate).format('YYYY-MM-DD')
      });

      var lastYear = query({
        'ids': ids,
        'dimensions': 'ga:month,ga:nthMonth',
        'metrics': 'ga:sessions',
        'start-date': moment(endDate).subtract(1, 'year').date(1).month(0)
            .format('YYYY-MM-DD'),
        'end-date': moment(endDate).date(1).month(0).subtract(1, 'day')
            .format('YYYY-MM-DD')
      });

      Promise.all([thisYear, lastYear]).then(function(results) {
        var data1 = results[0].rows.map(function(row) { return +row[2]; });
        var data2 = results[1].rows.map(function(row) { return +row[2]; });
        var labels = ['Jan','Feb','Mar','Apr','May','Jun',
                      'Jul','Aug','Sep','Oct','Nov','Dec'];

        // Ensure the data arrays are at least as long as the labels array.
        // Chart.js bar charts don't (yet) accept sparse datasets.
        for (var i = 0, len = labels.length; i < len; i++) {
          if (data1[i] === undefined) data1[i] = null;
          if (data2[i] === undefined) data2[i] = null;
        }

        var data = {
          labels : labels,
          datasets : [
            {
              label: 'Last Year',
              fillColor : fillColors[0],
              strokeColor : strokeColors[0],
              data : data2
            },
            {
              label: 'This Year',
              fillColor : fillColors[1],
              strokeColor : strokeColors[1],
              data : data1
            }
          ]
        };

        new Chart(makeCanvas('monthly-session-chart-container')).Bar(data);
        generateLegend('monthly-session-legend-container', data.datasets);
      })
      .catch(function(err) {
        console.error(err.error.message);
      })
    }

  /* Calculates the number of seconds avergae dution for a session for the current and previous week */

  function renderWeekOverWeekSessionDurationChart(ids, startDate, endDate) {


    var currentWeek = query({
      'ids': ids,
      'dimensions': 'ga:date,ga:nthDay',
      'metrics': 'ga:avgSessionDuration',
      'start-date': startDate,
      'end-date': endDate
    });

    var previousWeek = query({
      'ids': ids,
      'dimensions': 'ga:date,ga:nthDay',
      'metrics': 'ga:avgSessionDuration',
      'start-date': moment(startDate).subtract(7, 'days').format('YYYY-MM-DD'),
      'end-date':  moment(endDate).subtract(7, 'days').format('YYYY-MM-DD')
    });

    Promise.all([currentWeek, previousWeek]).then(function(results) {

      var data1 = results[0].rows.map(function(row) { return +row[2]; });
      var data2 = results[1].rows.map(function(row) { return +row[2]; });
      var labels = results[1].rows.map(function(row) { return +row[0]; });

      labels = labels.map(function(label) {
        return moment(label, 'YYYYMMDD').format('ddd');
      });

      var data = {
        labels : labels,
        datasets : [
          {
            //Set week ending date
            //label: 'Last Week',
            label: 'Week Starting ' + moment(startDate).format('DD/MM/YYYY'),
            fillColor : fillColors[0],
            strokeColor : strokeColors[0],
            pointColor : strokeColors[0],
            pointStrokeColor : "#fff",
            data : data2
          },
          {
            label: 'Week Starting ' + moment(startDate).subtract(7, 'days').format('DD/MM/YYYY'),
            fillColor : fillColors[1],
            strokeColor : strokeColors[1],
            pointColor : strokeColors[1],
            pointStrokeColor : "#fff",
            data : data1
          }
        ]
      };

      new Chart(makeCanvas('weekly-session-duration-chart-container')).Line(data);
      generateLegend('weekly-session-duration-legend-container', data.datasets);

      delay(renderYearOverYearSessionDurationChart, 500 + Math.random()*500, ids, endDate);

    })
    .catch(function(err) {
        console.error(err.error.message);
      })
  }

  /*Calculates the average number of seconds duration of a session for this year to the previous
    year*/

  function renderYearOverYearSessionDurationChart(ids, endDate) {

      var thisYear = query({
        'ids': ids,
        'dimensions': 'ga:month,ga:nthMonth',
        'metrics': 'ga:avgSessionDuration',
        'start-date': moment(endDate).date(1).month(0).format('YYYY-MM-DD'),
        'end-date': moment(endDate).format('YYYY-MM-DD')
      });

      var lastYear = query({
        'ids': ids,
        'dimensions': 'ga:month,ga:nthMonth',
        'metrics': 'ga:avgSessionDuration',
        'start-date': moment(endDate).subtract(1, 'year').date(1).month(0)
            .format('YYYY-MM-DD'),
        'end-date': moment(endDate).date(1).month(0).subtract(1, 'day')
            .format('YYYY-MM-DD')
      });

      Promise.all([thisYear, lastYear]).then(function(results) {
        var data1 = results[0].rows.map(function(row) { return +row[2]; });
        var data2 = results[1].rows.map(function(row) { return +row[2]; });
        var labels = ['Jan','Feb','Mar','Apr','May','Jun',
                      'Jul','Aug','Sep','Oct','Nov','Dec'];

        // Ensure the data arrays are at least as long as the labels array.
        // Chart.js bar charts don't (yet) accept sparse datasets.
        for (var i = 0, len = labels.length; i < len; i++) {
          if (data1[i] === undefined) data1[i] = null;
          if (data2[i] === undefined) data2[i] = null;
        }

        var data = {
          labels : labels,
          datasets : [
            {
              label: 'Last Year',
              fillColor : fillColors[0],
              strokeColor : strokeColors[0],
              data : data2
            },
            {
              label: 'This Year',
              fillColor : fillColors[1],
              strokeColor : strokeColors[1],
              data : data1
            }
          ]
        };

        new Chart(makeCanvas('monthly-session-duration-chart-container')).Bar(data);
        generateLegend('monthly-session-duration-legend-container', data.datasets);
      })
      .catch(function(err) {
        console.error(err.error.message);
      })
    }


/**
   * Draw the a chart.js doughnut chart with data from the specified view that
   * shows the content for the week.
   */
  function renderWeekContentUsageChart(ids, startDate, endDate) {

    var topPageNames = [];

    delayedExecuteQuery({
      'ids': ids,
      'dimensions': 'ga:pageTitle',
      'metrics': 'ga:pageviews',
      'filters': 'ga:pageTitle!=Redirect;ga:pageviews>10',
      'start-date': startDate,
      'end-date':  endDate,
      'sort': '-ga:pageviews',
      'max-results': 5
    },
    function(response) {

      var data = [];
      var labels = [];
      var datasets = [];

      response.rows.forEach(function(row, i) {
        //labels.push(row[0]);
        labels.push('');
        datasets.push(  {
                        label: row[0],
                        fillColor: fillColors[i],
                        strokeColor: strokeColors[i],
                        data: [+row[1]]
                      } );
        topPageNames.push(row[0]);
      });

      data = {labels: labels, datasets: datasets};

      new Chart(makeCanvas('weekly-content-chart-container')).Bar(data, {barDatasetSpacing : 10});
      generateLegend('weekly-content-legend-container', data.datasets);

      delay(renderQuarterlyContentUsageChart, 500 + Math.random()*500, ids, endDate, topPageNames);

    },
    function(err) {
      console.error(err.error.message);
    });

  }


/**
   * Draw the a line chart with data from the specified view that
   * shows the top content over the last year.
   */
  function renderQuarterlyContentUsageChart(ids, endDate, topPages) {

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
    if(index>0)
      pageQuery = pageQuery + ',';
    pageQuery = pageQuery + 'ga:pageTitle==' + element;

    //Initialise array to hold values for page
    pageData['val' + index] = [];
    });



  /**Build month labels and time periods for 4 query periods
   * then run the query for the defined period and collate the results
   */
  var monthLabels =[];
  var periodDates = [];


  for (var qCalculator = 3, dataCounter = 0; qCalculator >=0; qCalculator--, dataCounter++) {
    monthLabels.push(moment(endDate).subtract((qCalculator*3) + 3, 'months').date(1).format('MMM')
      + '-' + moment(endDate).subtract((qCalculator*3) + 1, 'months').date(1).format('MMM'));

   periodDates.push(moment(endDate).subtract((qCalculator*3) + 3, 'months').date(1).format('YYYY-MM-DD'));
   periodDates.push(moment(endDate).subtract((qCalculator*3), 'months').date(1).subtract(1, 'days').format('YYYY-MM-DD'));
  }


  //Retrieve results for each quarter - wrapped in function to ensure execution is completed prior to analysing results

  delayedExecuteQuery({
      'ids': ids,
      'dimensions': 'ga:pageTitle',
      'metrics': 'ga:pageviews',
      'filters': pageQuery,
      'start-date': periodDates[0],
      'end-date': periodDates[1]
    },
    function(response) {

      pageData = processResults(response, pageData, topPages);

      //Run the Q2 query
      delayedExecuteQuery({
      'ids': ids,
      'dimensions': 'ga:pageTitle',
      'metrics': 'ga:pageviews',
      'filters': pageQuery,
      'start-date': periodDates[2],
      'end-date': periodDates[3]
      },
      function(response) {

        pageData = processResults(response, pageData, topPages);

        //Run the Q3 query
        delayedExecuteQuery({
        'ids': ids,
        'dimensions': 'ga:pageTitle',
        'metrics': 'ga:pageviews',
        'filters': pageQuery,
        'start-date': periodDates[4],
        'end-date': periodDates[5]
        },
        function(response) {

          pageData = processResults(response, pageData, topPages);

          //Run the Q4 query
          delayedExecuteQuery({
          'ids': ids,
          'dimensions': 'ga:pageTitle',
          'metrics': 'ga:pageviews',
          'filters': pageQuery,
          'start-date': periodDates[6],
          'end-date': periodDates[7]
          },
          function(response) {
              pageData = processResults(response, pageData, topPages);

              //Build the report
              var data = {
                labels : monthLabels,
                datasets : []
              };

               topPages.forEach(function(element, index, array) {

                //Build data set for each page
                data.datasets[index] = {
                            label: element,
                            fillColor: fillColors[index],
                            strokeColor: strokeColors[index],
                            pointColor : strokeColors[index],
                            pointStrokeColor : "#fff",
                            data: pageData['val' + index]
                            };
                });



              new Chart(makeCanvas('quarterly-content-chart-container')).Line(data);
              generateLegend('quarterly-content-legend-container', data.datasets);

          },
          function(err) {
          console.error(err.error.message);
          });
        },
        function(err) {
        console.error(err.error.message);
        });
      },
      function(err) {
      console.error(err.error.message);
      });
    },
    function(err) {
      console.error(err.error.message);
    });



  }



 /**
   * Draw the a chart.js doughnut chart with data from the specified view that
   * show the top 5 browsers.
   */
  function renderTopBrowsersPeriod(ids, startDate, endDate) {

    var topBrowsers = [];

    delayedExecuteQuery({
      'ids': ids,
      'dimensions': 'ga:browser',
      'metrics': 'ga:pageviews',
      'start-date': startDate,
      'end-date':  endDate,
      'sort': '-ga:pageviews',
      'max-results': 5
    },
    function(response) {

      var data = [];


      response.rows.forEach(function(row, i) {
        data.push({ value: +row[1], color: fillColors[i], label: row[0] });
        topBrowsers.push(row[0]);
      });

      new Chart(makeCanvas('weekly-browser-chart-container')).Doughnut(data);
      generateLegend('weekly-browser-legend-container', data);

      delay(renderQuarterlyBrowserUsageChart, 500 + Math.random()*500, ids, endDate, topBrowsers);

    },
    function(err) {
      console.error(err.error.message);
    });

  }


 /**
   * Draw the line chart with data from the specified view that
   * show the top 5 browsers over the last year.
   */
  function renderQuarterlyBrowserUsageChart(ids, endDate, topBrowsers) {

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
    if(index>0)
      browserQuery = browserQuery + ',';
    browserQuery = browserQuery + 'ga:browser==' + element;

    //Initialise array to hold values for page
    pageData['val' + index] = [];
    });



  /**Build month labels and time periods for 4 query periods
   * then run the query for the defined period and collate the results
   */
  var monthLabels =[];
  var periodDates = [];


  for (var qCalculator = 3, dataCounter = 0; qCalculator >=0; qCalculator--, dataCounter++) {
    monthLabels.push(moment(endDate).subtract((qCalculator*3) + 3, 'months').date(1).format('MMM')
      + '-' + moment(endDate).subtract((qCalculator*3) + 1, 'months').date(1).format('MMM'));

   periodDates.push(moment(endDate).subtract((qCalculator*3) + 3, 'months').date(1).format('YYYY-MM-DD'));
   periodDates.push(moment(endDate).subtract((qCalculator*3), 'months').date(1).subtract(1, 'days').format('YYYY-MM-DD'));
  }


  //Retrieve results for each quarter

  delayedExecuteQuery({
      'ids': ids,
      'dimensions': 'ga:browser',
      'metrics': 'ga:pageviews',
      'filters': browserQuery,
      'start-date': periodDates[0],
      'end-date': periodDates[1]
    },
    function(response) {

      pageData = processResults(response, pageData, topBrowsers);

      //Run the Q2 query
      delayedExecuteQuery({
      'ids': ids,
      'dimensions': 'ga:browser',
      'metrics': 'ga:pageviews',
      'filters': browserQuery,
      'start-date': periodDates[2],
      'end-date': periodDates[3]
      },
      function(response) {

        pageData = processResults(response, pageData, topBrowsers);

        //Run the Q3 query
        delayedExecuteQuery({
        'ids': ids,
        'dimensions': 'ga:browser',
        'metrics': 'ga:pageviews',
        'filters': browserQuery,
        'start-date': periodDates[4],
        'end-date': periodDates[5]
        },
        function(response) {

          pageData = processResults(response, pageData, topBrowsers);

          //Run the Q4 query
          delayedExecuteQuery({
          'ids': ids,
          'dimensions': 'ga:browser',
          'metrics': 'ga:pageviews',
          'filters': browserQuery,
          'start-date': periodDates[6],
          'end-date': periodDates[7]
          },
          function(response) {
              pageData = processResults(response, pageData, topBrowsers);

              //Build the report
              var data = {
                labels : monthLabels,
                datasets : []
              };

               topBrowsers.forEach(function(element, index, array) {

                //Build data set for each page
                data.datasets[index] = {
                            label: element,
                            fillColor: fillColors[index],
                            strokeColor: strokeColors[index],
                            pointColor : strokeColors[index],
                            pointStrokeColor : "#fff",
                            data: pageData['val' + index]
                            };
                });



              new Chart(makeCanvas('quarterly-browser-chart-container')).Line(data);
              generateLegend('quarterly-browser-legend-container', data.datasets);

          },
          function(err) {
          console.error(err.error.message);
          });
        },
        function(err) {
        console.error(err.error.message);
        });
      },
      function(err) {
      console.error(err.error.message);
      });
    },
    function(err) {
      console.error(err.error.message);
    });


  }


  /**
   * Draw the a chart.js doughnut chart with data from the specified view that
   * show the top 5 IE Browser versions.
   */
  function renderIEVersionPeriod(ids, startDate, endDate) {

    var topVersions = [];

    delayedExecuteQuery({
      'ids': ids,
      'dimensions': 'ga:browserVersion',
      'metrics': 'ga:pageviews',
      'filters': 'ga:browser==Internet Explorer',
      'start-date': startDate,
      'end-date':  endDate,
      'sort': '-ga:pageviews',
      'max-results': 5
    },
    function(response) {

      var data = [];

      response.rows.forEach(function(row, i) {
        data.push({ value: +row[1], color: fillColors[i], label: row[0] });
        topVersions.push(row[0]);
      });

      new Chart(makeCanvas('weekly-ieversion-chart-container')).Doughnut(data);
      generateLegend('weekly-ieversion-legend-container', data);

      delay(renderQuarterlyIEVersionUsageChart, 500 + Math.random()*500, ids, endDate, topVersions);

    },
    function(err) {
      console.error(err.error.message);
    });

  }


 /**
   * Draw the line chart with data from the specified view that
   * show the top 5 IE Browser versions over the last year.
   */
  function renderQuarterlyIEVersionUsageChart(ids, endDate, topVersions) {

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
    if(index>0)
      browserQuery = browserQuery + ',';
    browserQuery = browserQuery + 'ga:browserVersion==' + element;

    //Initialise array to hold values for page
    pageData['val' + index] = [];
    });



  /**Build month labels and time periods for 4 query periods
   * then run the query for the defined period and collate the results
   */
  var monthLabels =[];
  var periodDates = [];


  for (var qCalculator = 3, dataCounter = 0; qCalculator >=0; qCalculator--, dataCounter++) {
    monthLabels.push(moment(endDate).subtract((qCalculator*3) + 3, 'months').date(1).format('MMM')
      + '-' + moment(endDate).subtract((qCalculator*3) + 1, 'months').date(1).format('MMM'));

   periodDates.push(moment(endDate).subtract((qCalculator*3) + 3, 'months').date(1).format('YYYY-MM-DD'));
   periodDates.push(moment(endDate).subtract((qCalculator*3), 'months').date(1).subtract(1, 'days').format('YYYY-MM-DD'));
  }


  //Retrieve results for each quarter

  delayedExecuteQuery({
      'ids': ids,
      'dimensions': 'ga:browserVersion',
      'metrics': 'ga:pageviews',
      'filters': browserQuery,
      'start-date': periodDates[0],
      'end-date': periodDates[1]
    },
    function(response) {

      pageData = processResults(response, pageData, topVersions);

      //Run the Q2 query
      delayedExecuteQuery({
      'ids': ids,
      'dimensions': 'ga:browserVersion',
      'metrics': 'ga:pageviews',
      'filters': browserQuery,
      'start-date': periodDates[2],
      'end-date': periodDates[3]
      },
      function(response) {

        pageData = processResults(response, pageData, topVersions);

        //Run the Q3 query
        delayedExecuteQuery({
        'ids': ids,
        'dimensions': 'ga:browserVersion',
        'metrics': 'ga:pageviews',
        'filters': browserQuery,
        'start-date': periodDates[4],
        'end-date': periodDates[5]
        },
        function(response) {

          pageData = processResults(response, pageData, topVersions);

          //Run the Q4 query
          delayedExecuteQuery({
          'ids': ids,
          'dimensions': 'ga:browserVersion',
          'metrics': 'ga:pageviews',
          'filters': browserQuery,
          'start-date': periodDates[6],
          'end-date': periodDates[7]
          },
          function(response) {
              pageData = processResults(response, pageData, topVersions);

              //Build the report
              var data = {
                labels : monthLabels,
                datasets : []
              };

               topVersions.forEach(function(element, index, array) {

                //Build data set for each page
                data.datasets[index] = {
                            label: element,
                            fillColor: fillColors[index],
                            strokeColor: strokeColors[index],
                            pointColor : strokeColors[index],
                            pointStrokeColor : "#fff",
                            data: pageData['val' + index]
                            };
                });



              new Chart(makeCanvas('quarterly-ieversion-chart-container')).Line(data);
              generateLegend('quarterly-ieversion-legend-container', data.datasets);

          },
          function(err) {
          console.error(err.error.message);
          });
        },
        function(err) {
        console.error(err.error.message);
        });
      },
      function(err) {
      console.error(err.error.message);
      });
    },
    function(err) {
      console.error(err.error.message);
    });


  }


 /**
   * Draw the a chart.js doughnut chart with data from the specified view that
   * show the top 5 Firefox Browser versions.
   */
  function renderFirefoxVersionPeriod(ids, startDate, endDate) {

    var topVersions = [];

    delayedExecuteQuery({
      'ids': ids,
      'dimensions': 'ga:browserVersion',
      'metrics': 'ga:pageviews',
      'filters': 'ga:browser==Firefox',
      'start-date': startDate,
      'end-date':  endDate,
      'sort': '-ga:pageviews',
      'max-results': 5
    },
    function(response) {

      var data = [];

      response.rows.forEach(function(row, i) {
        data.push({ value: +row[1], color: fillColors[i], label: row[0] });
        topVersions.push(row[0]);
      });

      new Chart(makeCanvas('weekly-firefoxversion-chart-container')).Doughnut(data);
      generateLegend('weekly-firefoxversion-legend-container', data);

      delay(renderQuarterlyFirefoxVersionUsageChart, 500 + Math.random()*500, ids, endDate, topVersions);

    },
    function(err) {
      console.error(err.error.message);
    });

  }


 /**
   * Draw the line chart with data from the specified view that
   * show the top 5 Firefox Browser versions over the last year.
   */
  function renderQuarterlyFirefoxVersionUsageChart(ids, endDate, topVersions) {

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
    if(index>0)
      browserQuery = browserQuery + ',';
    browserQuery = browserQuery + 'ga:browserVersion==' + element;

    //Initialise array to hold values for page
    pageData['val' + index] = [];
    });



  /**Build month labels and time periods for 4 query periods
   * then run the query for the defined period and collate the results
   */
  var monthLabels =[];
  var periodDates = [];


  for (var qCalculator = 3, dataCounter = 0; qCalculator >=0; qCalculator--, dataCounter++) {
    monthLabels.push(moment(endDate).subtract((qCalculator*3) + 3, 'months').date(1).format('MMM')
      + '-' + moment(endDate).subtract((qCalculator*3) + 1, 'months').date(1).format('MMM'));

   periodDates.push(moment(endDate).subtract((qCalculator*3) + 3, 'months').date(1).format('YYYY-MM-DD'));
   periodDates.push(moment(endDate).subtract((qCalculator*3), 'months').date(1).subtract(1, 'days').format('YYYY-MM-DD'));
  }


  //Retrieve results for each quarter

  delayedExecuteQuery({
      'ids': ids,
      'dimensions': 'ga:browserVersion',
      'metrics': 'ga:pageviews',
      'filters': browserQuery,
      'start-date': periodDates[0],
      'end-date': periodDates[1]
    },
    function(response) {

      pageData = processResults(response, pageData, topVersions);

      //Run the Q2 query
      delayedExecuteQuery({
      'ids': ids,
      'dimensions': 'ga:browserVersion',
      'metrics': 'ga:pageviews',
      'filters': browserQuery,
      'start-date': periodDates[2],
      'end-date': periodDates[3]
      },
      function(response) {

        pageData = processResults(response, pageData, topVersions);

        //Run the Q3 query
        delayedExecuteQuery({
        'ids': ids,
        'dimensions': 'ga:browserVersion',
        'metrics': 'ga:pageviews',
        'filters': browserQuery,
        'start-date': periodDates[4],
        'end-date': periodDates[5]
        },
        function(response) {

          pageData = processResults(response, pageData, topVersions);

          //Run the Q4 query
          delayedExecuteQuery({
          'ids': ids,
          'dimensions': 'ga:browserVersion',
          'metrics': 'ga:pageviews',
          'filters': browserQuery,
          'start-date': periodDates[6],
          'end-date': periodDates[7]
          },
          function(response) {
              pageData = processResults(response, pageData, topVersions);

              //Build the report
              var data = {
                labels : monthLabels,
                datasets : []
              };

               topVersions.forEach(function(element, index, array) {

                //Build data set for each page
                data.datasets[index] = {
                            label: element,
                            fillColor: fillColors[index],
                            strokeColor: strokeColors[index],
                            pointColor : strokeColors[index],
                            pointStrokeColor : "#fff",
                            data: pageData['val' + index]
                            };
                });



              new Chart(makeCanvas('quarterly-firefoxversion-chart-container')).Line(data);
              generateLegend('quarterly-firefoxversion-legend-container', data.datasets);

          },
          function(err) {
          console.error(err.error.message);
          });
        },
        function(err) {
        console.error(err.error.message);
        });
      },
      function(err) {
      console.error(err.error.message);
      });
    },
    function(err) {
      console.error(err.error.message);
    });


  }


  /** Function to process page results.  Takes each result and finds its position in the referenceData
   * array, then maps in the value to the dataStore set.  It then sums all the values, enters 0s
   * for missing values and converts each value to a percentage.
   */

  function processResults(results, dataStore, referenceData) {

    if(results!=undefined) {

      //initially set all referenceData to not being found in results
      var valsFound = [];

      var dataPosition = dataStore.val0.length

      referenceData.forEach(function(element, index, array) {
        valsFound.push(false);
        });

      //iterate through results, map in values and set the value as being found
      if(results.totalResults>0) {
        results.rows.forEach(function(row, r) {

          //Find the position of the returned value in the referenceData array
          var referencePos = referenceData.indexOf(row[0]);

          if(referencePos>-1){
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
      if(valsFound[index]==false)
        dataStore['val' + index].push(0);
      else
        sumValues = sumValues + dataStore['val' + index][dataPosition];
      });

    /** Adjust each value to make it a percentage of the total rather
     *  than the raw number.  This will allow comparisons over time
     *  periods where there is a large variation in the raw numbers.
     */
      if(sumValues>0){
        referenceData.forEach(function(element, index, array) {
          dataStore['val' + index][dataPosition] = dataStore['val' + index][dataPosition] / sumValues * 100;
          });
        }
    }
  return dataStore;

  }






/** This function wraps the executeQuery function in a delay
 * between 500 - 1000ms to allow repeated calls to the Embed API
 * without breaking the rate limit
 */
  function delayedExecuteQuery(queryParams, successFunction, errorFunction) {

    delay(executeQuery, 500 + Math.random()*500, queryParams, successFunction, errorFunction);

  }


 /** This function uses the Embed APIs `gapi.analytics.report.Data` component to
  * return data by waiting for the results which blocks other processing.
  * This allows the function to be called on a time delay to avoid breaking
  * the API rate limit inside complex calculations
  */

  function executeQuery(queryParams, successFunction, errorFunction) {

        var data = new gapi.analytics.report.Data({query: queryParams});

        data.once('success', successFunction)
            .once('error', errorFunction)
            .execute();
    }



  /**
     * Extend the Embed APIs `gapi.analytics.report.Data` component to
     * return a promise the is fulfilled with the value returned by the API.
     * @param {Object} params The request parameters.
     * @return {Promise} A promise.
     */

    function query(params) {
      return new Promise(function(resolve, reject) {
        var data = new gapi.analytics.report.Data({query: params});

        data.once('success', function(response) { resolve(response); })
            .once('error', function(response) { reject(response); })
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

    /**
     * Delay the execution of the function
     */

    function delay(func, timeout, args) {
      var r = Array.prototype.slice.call(arguments, 2);

      return setTimeout(function() {
            func.apply(null, r)
        }, timeout);
    }
