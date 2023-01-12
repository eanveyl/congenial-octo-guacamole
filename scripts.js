function linearRegression(inputArray, xLabel, yLabel) {
  const x = inputArray.map((element) => element[xLabel]);
  const y = inputArray.map((element) => element[yLabel]);
  const sumX = x.reduce((prev, curr) => prev + curr, 0);
  const avgX = sumX / x.length;
  const xDifferencesToAverage = x.map((value) => avgX - value);
  const xDifferencesToAverageSquared = xDifferencesToAverage.map(
    (value) => value ** 2
  );
  const SSxx = xDifferencesToAverageSquared.reduce(
    (prev, curr) => prev + curr,
    0
  );
  const sumY = y.reduce((prev, curr) => prev + curr, 0);
  const avgY = sumY / y.length;
  const yDifferencesToAverage = y.map((value) => avgY - value);
  const xAndYDifferencesMultiplied = xDifferencesToAverage.map(
    (curr, index) => curr * yDifferencesToAverage[index]
  );
  const SSxy = xAndYDifferencesMultiplied.reduce(
    (prev, curr) => prev + curr,
    0
  );
  const slope = SSxy / SSxx;
  const intercept = avgY - slope * avgX;
  return (x) => intercept + slope * x;
}

var dataset;

d3.csv("clean_data_euromod.csv", (d) => {
  dataset = d;
  start();
});

async function start() {

  midyear_data = dataset.slice(57, 129);  // TODO this is not the most flexible way to fetch the data

  const gdp_list = new Array();
  const country_list = new Array();
  const bigmac_price_list = new Array();
  const country_names_list = new Array();

  for (let i = 0; i < midyear_data.length; i++) {
    gdp_list.push(parseFloat(midyear_data[i]["GDP_dollar"]))
    country_list.push(midyear_data[i]["iso_a3"])
    bigmac_price_list.push(parseFloat(midyear_data[i]["dollar_price"]))
    country_names_list.push(midyear_data[i]["name"])
  }

  // Dropdown button to choose country and display Big Mac price

  
  
    var select = d3.select("#dropdown").append("div").append("select")

    select.on("change", function(d) {
        var value = d3.select(this).property("value");
        alert(value);
      });

    select.selectAll("option")
      .data(data)
      .enter()
      .append("option")
      .attr("value", function (d) { return d.dollar_price; })
      .text(function (d) { return d.name; });

    
  
    const selectedText = d3.select('#dropdown option:checked').text();
    document.getElementById("output").innerHTML = selectedText

  // World Map
  // Inspiration from https://plotly.com/javascript/choropleth-maps/
  var data = [{
    type: "choropleth",
    locationmode: "country names",
    locations: country_names_list,
    z: bigmac_price_list,
    text: bigmac_price_list,
    autocolorscale: true
  }];

  var layout = {
    title: "BigMac Price in USD",
    geo: {
      projection: {
        type: "robinson"
      }
    }
  };

  Plotly.newPlot("world_map", data, layout, { showLink: false });

  // Scatter Plot
  // Inspiration from https://plotly.com/javascript/line-and-scatter/
  lin_reg_array = new Array();

  for (let i = 0; i < gdp_list.length; i++) {
    lin_reg_array.push({ "GDP": gdp_list[i], "Price": bigmac_price_list[i] })
  }

  const linReg = linearRegression(lin_reg_array, "GDP", "Price")  // This is a function handle that takes a GDP value and returns the expected linear regression of the price in USD
  const max_gdp = Math.max(...gdp_list);
  const min_gdp = Math.min(...gdp_list);
  var linreg_vals = new Array();
  linreg_vals.push(linReg(min_gdp));
  linreg_vals.push(linReg(max_gdp));



  var trace1 = {
    x: gdp_list,
    y: bigmac_price_list,
    mode: 'markers+text',
    type: 'scatter',
    name: 'Countries',
    text: country_list,
    textposition: 'top center',
    textfont: {
      family: 'Raleway, sans-serif'
    },
    marker: { size: 8 }
  };

  var trace2 = {
    x: [min_gdp, max_gdp],
    y: linreg_vals,
    mode: "lines+markers",
    type: "scatter",
    name: "Linear Regression",
    line: { shape: "linear" }
  }
  var data = [trace1, trace2];

  var layout = {
    title: 'GDP vs Price',
    xaxis: {
      title: "2022 GDP for Countries [USD]"
    },
    yaxis: {
      title: "BigMac Price [USD]"
    }
  };

  Plotly.newPlot('scatter_plot', data, layout);
}
