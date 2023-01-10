d3.csv("clean_data.csv").then( function(data) {
  // TODO Do stuff here
  console.log(data)

  midyear_data = data.slice(57, 111)


  const gdp_list = new Array();
  const country_list = new Array();
  const bigmac_price_list = new Array();
  const country_names_list = new Array();

  for (let i=0; i<midyear_data.length; i++){
    gdp_list.push(midyear_data[i]["GDP_dollar"])
    country_list.push(midyear_data[i]["iso_a3"])
    bigmac_price_list.push(midyear_data[i]["dollar_price"])
    country_names_list.push(midyear_data[i]["name"])
  }

  var data = [{
    type: "choropleth", 
    locationmode: "country names", 
    locations: country_names_list,
    z: bigmac_price_list,
    text: country_names_list,
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

  Plotly.newPlot("world_map", data, layout, {showLink: false});

  // Scatter Plot
  var trace1 = {
    x: gdp_list,
    y: bigmac_price_list,
    mode: 'markers+text',
    type: 'scatter',
    name: 'Countries',
    text: country_list,
    textposition: 'top center',
    textfont: {
      family:  'Raleway, sans-serif'
    },
    marker: { size: 8 }
  };
  
  var data = [trace1];
  
  var layout = {
    title:'GDP vs Price',
    xaxis: {
      title: "2022 GDP for Countries [USD]"
    },
    yaxis: {
      title: "BigMac Price [USD]"
    }
  };
  
  Plotly.newPlot('scatter_plot', data, layout);
  
})