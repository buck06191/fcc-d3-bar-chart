let yMargin = 40,
  w = 800,
  h = 400,
  barWidth = w / 275,
  xPad=50,
  yPad=60;

let tooltip = d3.select("body")
.append("div")
.attr("id", "tooltip")
.attr("class", "invisible")
.attr("data-date", "");


let svgContainer = d3
  .select(".graphHolder")
  .append("svg")
  .attr("width", w + 2*xPad)
  .attr("height", h + yPad);

svgContainer.append("text")
.attr("transform", "rotate(-90)")
.attr("y", 80)
.attr("x", -h/2)
.attr("id", "axisLabel")
.text("US GDP ($ billion)");

d3
  .json(
    "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json"
  )
  .then(function(data, err) {
  
  let description = data.description;
  description = description.replace(/\n|\- /g, "<br/>")

  document.getElementById("description").innerHTML = "<p>" + description + "</p>";
  
  
    if (err) return console.error(err);
    let years = data.data.map(d => {
      let formattedYear = "";
      let y = d[0];
      let temp = y.slice(5, 7);
      if (temp == "01") {
        formattedYear += "Q1";
      } else if (temp == "04") {
        formattedYear += "Q2";
      } else if (temp == "07") {
        formattedYear += "Q3";
      } else if (temp == "10") {
        formattedYear += "Q4";
      }

      formattedYear += " '" + y.slice(2, 4);
      return formattedYear;
    });
  
    let numYear = data.data.map((d)=>{
      return d[0].slice(0,4);
    })

    let GDP = data.data.map(d => {
      return d[1];
    });  
  
    // Find min and max for figure
    yearMin = d3.min(numYear);
    yearMax = d3.max(numYear);
  
    gdpMin = d3.min(GDP);
    gdpMax = d3.max(GDP);
  
    let xScale = d3.scaleLinear()
    .domain([yearMin, yearMax])
    .range([0, w]);
  
    let yScale = d3.scaleLinear()
    .domain([gdpMin, gdpMax])
    .range([h, gdpMin/gdpMax*h]);
  
  // Need seprate inverse scale for the gdp vlaues instead of the y-axis scale because of the tests
    let gdpScale = d3.scaleLinear()
    .domain([gdpMin, gdpMax])
    .range([gdpMin/gdpMax*h, h]);


    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  
    xAxisGroup = svgContainer.append("g")
         .attr("id", "x-axis")
         .attr("transform", "translate("+ xPad +"," + h + ")")
         .call(xAxis);
  
    const yAxis = d3.axisLeft(yScale);
  
    yAxisGroup = svgContainer.append("g")
         .attr("id", "y-axis")
         .attr("transform", "translate("+ xPad + ", 0)")
         .call(yAxis);

    svgContainer
      .selectAll("rect")
      .data(GDP)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("data-date", (d,i) =>{
           return data.data[i][0];})
      .attr("data-gdp", (d,i) => {return d;})
      .attr("x", (d, i) => {
        return i * barWidth;
      })
  // transform to offset by xPad, don't add to x attribute.
      .attr("transform", "translate("+ xPad + ", 0)")
      .attr("y", (d, i) => {
        return h - gdpScale(d) ;
      })
      .attr("height", (d, i) => {
        return gdpScale(d);
      })
      .attr("width", barWidth)
  .on("mouseover", (d, i) => {
      tooltip.attr("class", "visible")
      .attr("data-date", data.data[i][0]);
      tooltip.html(years[i] + "<br/>"  + "$" + d + " billion")	
             .style("left", (d3.event.clientX) + "px")		
             .style("top", (d3.event.clientY - 28) + "px");	
    })
    .on("mouseout", (d,i) => {
      tooltip.attr('class','invisible')
      .attr('data-date', "");
    });
  });
