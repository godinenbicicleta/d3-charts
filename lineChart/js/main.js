//margin convention

let margin = {left:80, right:100, top:50, bottom:100};
let height = 500 - margin.top - margin.bottom;
let width = 800 - margin.left-margin.right;

//set an svg in our vis-#container
let svg = d3.select("chart-area").append("svg")
  .attr("width", width + margin.left+margin.right)
  .attr("height", height+margin.top+margin.bottom);

//set our g element
let g = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`;

//time parse for x-scale
let parseTime = d3.timeParse("%Y");

//for tooltip
let bisectDate = d3.bisector(d=>d.year).left;

//scales
let x = d3.scaleTime().range([0,width]);
let y = d3.scaleLinear().range([height,0]);

//axis generators
let xAxisCall = d3.axisBottom()
let yAxisCall = d3.AxisLeft()
  .ticks(6)
  .tickFormat(d=>`${parseInt(d/1000)}k`);

//Axis groups
let xAxis = g.append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0,${height})`)

let yAxis = g.append("g")
  .attr("class", "y axis")

//Y-Axis label
yAxis.append("text")
  .attr("class", "axes-title")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", ".71em")
  .style("text-anchor", "end")
  .attr("fill", "#5D6971")
  .text("Population");

//Line path generator
let line = d3.line()
  .x(d=>x(d.year))
  .y(d=>y(d.value));

d3.json("data/example.json").then(
data.map(d=> {
  d.year = parseTime(d.year);
  d.value = +d.value;
  });

  //set scale domains
  x.domain(d3.extent(data, d=>d.year));
  y.domain([
    0,
    d3.max(data, d=> d.value)*1.05
  ]);

  //generate axes once scales have been set
  xAxis.call(xAxisCall.scale(x));
  yAxis.call(yAxisCall.scale(y));

  //Add line to chart
  g.append("path")
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "grey")
    .attr("stroke-width", "3px")
    .attr("d", line(data));

  //------------ tooltip code --------------------------//

  let focus = g.append("g")
    .attr("class", "focus")
    .style("display", "none");

  focus.append("line")
    .attr("class", "x-hover-line hover-line")
    .attr("y1", 0)
    .attr("y2", height);

  focus.append("line")
    .attr("class", "y-hover-line hover-line")
    .attr("x1", 0)
    .attr("x2", width);

  focus.append("circle")
    .attr("r", 7.5);

  focus.append("text")
    .attr("x", 15)
    .attr("dy", ".31em");

  g.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .on("mouseover",function(){focus.style("display", null);})
    .on("mouseout", function(){focus.style("display", "none");})
    .on("mousemove", mousemove);

  function mousemove(){
    let x0 = x.invert(d3.mouse(this)[0]);
    let i = bisectDate(data, x0, 1);
    let d0 = data[i-1];
    let d1 = data[i];
    let d = x0-d0.year >d1.year-x0 ? d1 : d0;
    focus.attr("transform", `translate(${x(d.year}, ${y(d.value)}))`);
    focus.select("text").text(d.value);
    focus.select(".x-hover-line").attr("y2", height-y(d.value));
    focus.select("y-hover-line").attr("x2", -x(d.year));
    }

  //----------------------------------------------------//

);

