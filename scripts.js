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

function generateDescriptionText(gdp_list, country_list, bigmac_price_list, country_names_list) {
  var descriptions = new Array();
  const lin_reg_array = new Array();
  
  for (let i=0; i<gdp_list.length; i++) {
    lin_reg_array.push({"GDP": gdp_list[i], "Price": bigmac_price_list[i]});
  }
  const linReg = linearRegression(lin_reg_array, "GDP", "Price");

  for (let i=0; i<country_list.length; i++) {
    expected_price = linReg(gdp_list[i]);
    var rel_cost = (bigmac_price_list[i]/expected_price -1) * 100 ;  // In order to know i.e. 60% more expensive than other similar countries
    var rel_cost = rel_cost.toFixed(1)  // Round to the nearest tenth
    var s = String();
    
    if (expected_price < bigmac_price_list[i]) {
      s = rel_cost + "% more expensive.";
    } else {
      s = rel_cost + "% less expensive.";
    }


    var description = "Selected Country: " + country_names_list[i] + 
    ". Compared to other countries \nwith similar GDP, goods are\n" + s

    descriptions.push(description);
  }
  
  return descriptions
}

var dataset;
const dropdown = document.getElementById("dropdown");
const gdp_list = new Array();
const country_list = new Array();
const bigmac_price_list = new Array();
const bigmac_price_local = new Array();
const dollar_ex = new Array();
const currency_code = new Array();
const country_names_list = new Array();
var selected_country;
var selected_country_index;
var bigmac_price_list_normalized;

d3.csv("clean_data_euromod.csv", (d) => {
  dataset = d;
  start();
});

async function draw() {
  // World Map
  // Inspiration from https://plotly.com/javascript/choropleth-maps/
  var data = [{
    type: "choropleth",
    locationmode: "country names",
    locations: country_names_list,
    z: bigmac_price_list_normalized,
    text: bigmac_price_list_normalized,
    autocolorscale: true
  }];

  var layout = {
    title: "BigMac Price in " + currency_code[selected_country_index],
    geo: {
      projection: {
        type: "robinson"
      }
    }, 
    height: 700
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
    mode: 'markers',
    type: 'scatter',
    name: 'Countries',
    text: generateDescriptionText(gdp_list, country_list, bigmac_price_list, country_names_list),
    textposition: 'top center',
    textfont: {
      family: 'Raleway, sans-serif'
    },
    marker: { size: 10 }
  };

  var trace2 = {
    x: [min_gdp, max_gdp],
    y: linreg_vals,
    mode: "lines+markers",
    type: "scatter",
    name: "Linear Regression",
    line: { shape: "linear" }
  }

  var trace3 = {
    x: [gdp_list[idx_selected_country]], 
    y: [bigmac_price_list[idx_selected_country]],
    mode: "markers", 
    type: "scatter",
    name: "Selected Country",
    textposition: 'top center',
    textfont: {
      family:  'Raleway, sans-serif'
    },
    marker: { 
      size: 14,
      color: "rgb(240,0,0)"
    }
  }
  var data = [trace1, trace2, trace3];
  
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

async function start() {

  midyear_data = dataset.slice(57, 129);

  for (let i = 0; i < midyear_data.length; i++) {
    gdp_list.push(parseFloat(midyear_data[i]["GDP_dollar"]));
    country_list.push(midyear_data[i]["iso_a3"]);
    bigmac_price_list.push(parseFloat(midyear_data[i]["dollar_price"]));
    bigmac_price_local.push(parseFloat(midyear_data[i]["local_price"]));
    currency_code.push(midyear_data[i]["currency_code"]);
    dollar_ex.push(parseFloat(midyear_data[i]["dollar_ex"]));
    country_names_list.push(midyear_data[i]["name"]);
  }

  country_names_list.forEach((country) => {
    var opt = document.createElement('option');
    opt.value = country;
    opt.innerHTML = country;
    dropdown.appendChild(opt);
  });

  selected_country = country_names_list[0];

  // TODO simplify this
  const selected_country_name_html = document.getElementById("selected_country_name");
  const selected_country_price_html = document.getElementById("selected_country_price");
  selected_country_index = country_names_list.indexOf(selected_country);
  selected_country_name_html.innerHTML = selected_country;
  selected_country_price_html.innerHTML = bigmac_price_local[selected_country_index] + " " + currency_code[selected_country_index];
  bigmac_price_list_normalized = bigmac_price_list.map((price) => price * dollar_ex[selected_country_index]);

  dropdown.addEventListener("change", () => {
    selected_country = dropdown.value;
    const selected_country_name_html = document.getElementById("selected_country_name");
    const selected_country_price_html = document.getElementById("selected_country_price");
    selected_country_index = country_names_list.indexOf(selected_country);
    selected_country_name_html.innerHTML = selected_country;
    selected_country_price_html.innerHTML = bigmac_price_local[selected_country_index] + " " + currency_code[selected_country_index];
    bigmac_price_list_normalized = bigmac_price_list.map((price) => price * dollar_ex[selected_country_index]);
    draw();
  }
  );

  draw();
}
