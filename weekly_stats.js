
  function renderWeekOverWeekChart(ids, startDateCurrentWeek, endDateCurrentWeek,
                            startDatePreviousWeek, endDatePreviousWeek) {


    var currentWeek = query({
      'ids': ids,
      'dimensions': 'ga:date,ga:nthDay',
      'metrics': 'ga:sessions',
      'start-date': startDateCurrentWeek,
      'end-date': endDateCurrentWeek
    });

    var previousWeek = query({
      'ids': ids,
      'dimensions': 'ga:date,ga:nthDay',
      'metrics': 'ga:sessions',
      'start-date': startDatePreviousWeek,
      'end-date':  endDatePreviousWeek
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
            label: 'Week Starting ' + moment(startDatePreviousWeek, 'YYYYMMDD').format('DD/MM/YYYY'),
            fillColor : "rgba(220,220,220,0.5)",
            strokeColor : "rgba(220,220,220,1)",
            pointColor : "rgba(220,220,220,1)",
            pointStrokeColor : "#fff",
            data : data2
          },
          {
            label: 'Week Starting ' + moment(startDateCurrentWeek, 'YYYYMMDD').format('DD/MM/YYYY'),
            fillColor : "rgba(151,187,205,0.5)",
            strokeColor : "rgba(151,187,205,1)",
            pointColor : "rgba(151,187,205,1)",
            pointStrokeColor : "#fff",
            data : data1
          }
        ]
      };

      new Chart(makeCanvas('weekly-session-chart-container')).Line(data);
      generateLegend('weekly-session-legend-container', data.datasets);
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
              fillColor : "rgba(220,220,220,0.5)",
              strokeColor : "rgba(220,220,220,1)",
              data : data2
            },
            {
              label: 'This Year',
              fillColor : "rgba(151,187,205,0.5)",
              strokeColor : "rgba(151,187,205,1)",
              data : data1
            }
          ]
        };

        new Chart(makeCanvas('monthly-session-chart-container')).Bar(data);
        generateLegend('monthly-session-legend-container', data.datasets);
      })
      .catch(function(err) {
        console.error(err.stack);
      })
    }

  /* Calculates the number of seconds avergae dution for a session for the current and previous week */

  function renderWeekOverWeekSessionDurationChart(ids, startDateCurrentWeek, endDateCurrentWeek,
                            startDatePreviousWeek, endDatePreviousWeek) {


    var currentWeek = query({
      'ids': ids,
      'dimensions': 'ga:date,ga:nthDay',
      'metrics': 'ga:avgSessionDuration',
      'start-date': startDateCurrentWeek,
      'end-date': endDateCurrentWeek
    });

    var previousWeek = query({
      'ids': ids,
      'dimensions': 'ga:date,ga:nthDay',
      'metrics': 'ga:avgSessionDuration',
      'start-date': startDatePreviousWeek,
      'end-date':  endDatePreviousWeek
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
            label: 'Week Starting ' + moment(startDatePreviousWeek, 'YYYYMMDD').format('DD/MM/YYYY'),
            fillColor : "rgba(220,220,220,0.5)",
            strokeColor : "rgba(220,220,220,1)",
            pointColor : "rgba(220,220,220,1)",
            pointStrokeColor : "#fff",
            data : data2
          },
          {
            label: 'Week Starting ' + moment(startDateCurrentWeek, 'YYYYMMDD').format('DD/MM/YYYY'),
            fillColor : "rgba(151,187,205,0.5)",
            strokeColor : "rgba(151,187,205,1)",
            pointColor : "rgba(151,187,205,1)",
            pointStrokeColor : "#fff",
            data : data1
          }
        ]
      };

      new Chart(makeCanvas('weekly-session-duration-chart-container')).Line(data);
      generateLegend('weekly-session-duration-legend-container', data.datasets);
    });
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
              fillColor : "rgba(220,220,220,0.5)",
              strokeColor : "rgba(220,220,220,1)",
              data : data2
            },
            {
              label: 'This Year',
              fillColor : "rgba(151,187,205,0.5)",
              strokeColor : "rgba(151,187,205,1)",
              data : data1
            }
          ]
        };

        new Chart(makeCanvas('monthly-session-duration-chart-container')).Bar(data);
        generateLegend('monthly-session-duration-legend-container', data.datasets);
      })
      .catch(function(err) {
        console.error(err.stack);
      })
    }


/**
   * Draw the a chart.js doughnut chart with data from the specified view that
   * shows the content for the week.
   */
  function renderWeekContentUsageChart(ids, startDate, endDate) {

    query({
      'ids': ids,
      'dimensions': 'ga:pageTitle',
      'metrics': 'ga:pageviews',
      'filters': 'ga:pageTitle!=Redirect;ga:pageviews>10',
      'start-date': startDate,
      'end-date':  endDate,
      'sort': '-ga:pageviews',
      'max-results': 10

    })
    .then(function(response) {

      var data = [];
      var labels = [];
      var datasets = [];
      var colors = ['#4D5360','#949FB1','#D4CCC5','#ADD7FE','#FEADAD','#C1FEC2', '#C1FEE3', '#FFF9D1', '#F1FFD1', '#D1FFD1', '#D1FFEA'];

      response.rows.forEach(function(row, i) {
        //labels.push(row[0]);
        labels.push('');
        datasets.push(  {
                        label: row[0],
                        fillColor: colors[i],
                        strokeColor: colors[i],
                        data: [+row[1]]
                      }  );
      });

      data = {labels: labels, datasets: datasets};

      new Chart(makeCanvas('weekly-content-chart-container')).Bar(data, {barDatasetSpacing : 10});
      generateLegend('weekly-content-legend-container', data.datasets);
    })
    .catch(function(err) {
      console.error(err.stack);
    })

  }


 /**
   * Draw the a chart.js doughnut chart with data from the specified view that
   * show the top 5 browsers over the past 30 days.
   */
  function renderTopBrowsersPeriod(ids, startDate, endDate) {

    query({
      'ids': ids,
      'dimensions': 'ga:browser',
      'metrics': 'ga:pageviews',
      'start-date': startDate,
      'end-date':  endDate,
      'sort': '-ga:pageviews',
      'max-results': 5
    })
    .then(function(response) {

      var data = [];
      var colors = ['#FEADAD','#ADD7FE','#BBFEAD','#ADFEEB','#FEFCAD'];

      response.rows.forEach(function(row, i) {
        data.push({ value: +row[1], color: colors[i], label: row[0] });
      });

      new Chart(makeCanvas('weekly-browser-chart-container')).Doughnut(data);
      generateLegend('weekly-browser-legend-container', data);
    });
  }


 /**
   * Draw the a chart.js doughnut chart with data from the specified view that
   * show the top 5 browsers.
   */
  function renderTopBrowsersYear(ids, endDate) {

    query({
      'ids': ids,
      'dimensions': 'ga:browser',
      'metrics': 'ga:pageviews',
      'start-date': moment(endDate).subtract(1, 'year').format('YYYY-MM-DD'),
      'end-date': endDate,
      'sort': '-ga:pageviews',
      'max-results': 5
    })
    .then(function(response) {

      var data = [];
      var colors = ['#FFC399','#A3FF99','#99FFD9','#99C8FF','#B199FF'];

      response.rows.forEach(function(row, i) {
        data.push({ value: +row[1], color: colors[i], label: row[0] });
      });

      new Chart(makeCanvas('yearly-browser-chart-container')).Doughnut(data);
      generateLegend('yearly-browser-legend-container', data);
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

