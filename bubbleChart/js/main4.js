//load the data
d3.json("data/revenues.json")
  .then(main)
  .catch(error=>{console.log(error);});

let flag = true;
let t = d3.transition().duration(750);

//D3 margin convention
let margin = {top:50, right:20, bottom:100, left:80};

//width and height for the g group
let width = 600 - margin.left - margin.right;
let height = 400 - margin.top - margin.bottom;

//create sbg container
let svg = d3.select("#vis-container")
  .append("svg")
  .attr( "width", width + margin.left + margin.right )
  .attr( "height", height + margin.top + margin.bottom )

//crate a g grup and move it to position inside svg
let g = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)

//group for the labels
let gLabels = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)

//scales
let x = d3.scaleBand()
  .range([0,width])
  .paddingInner(0.3)
  .paddingOuter(0.3);

let y = d3.scaleLinear()
  .range([height,0]);

let color = d3.scaleSequential()
  .interpolator(d3.interpolatePurples)
  
let reverseColor = d3.scaleSequential()
  .interpolator(d3.interpolatePurples);


//call to y axis
let yAxisGroup = g.append("g")
  .attr("class", "y axis");

//call to x axis
let xAxisGroup = g.append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0,${height})`);



//label bottom axis
let xAxisLabel = g.append("text")
  .attr("class", "x axis-label")
  .attr("x", width/2)
  .attr("y", height+50)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle");

//label left axis
let yAxisLabel = g.append("text")
  .attr("class", "y axis-label")
  .attr("x",-(height/2))
  .attr("y", -60)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)");


function main(data){
  console.log(data);
  
  for (let d of data){
    d.revenue = +d.revenue;
    d.profit = +d.profit;
    }

  d3.interval(function(){
      let newData = flag ? data :data.slice(1);
      update(newData);
      flag = !flag;
    },1000);

  update(data);
}

function update(data){
  let value = flag ? "revenue":"profit"; 
  let yLabelText = flag ? "Revenue ($)": "Profit ($)";
  let maxY = d3.max(data, d=>{return d[value];})

  //update domain for scales
  x.domain(data.map(d=>{return d.month;}));
  y.domain([0,d3.max(data, d=>{return d[value];})]);
  color.domain(d3.extent(data, d=>{return d[value];}));
  reverseColor.domain([d3.extent(data, d=>{return d[value];})[1],
    d3.extent(data, d=>{return d[value];})[0]]
    );

  //set axis
  
  let yAxis = d3.axisLeft(y)
    .ticks(10)
    .tickFormat(d=>{return `\$${d}`});

  yAxisGroup.transition(t).call(yAxis);
  
  let xAxis = d3.axisBottom(x);

  xAxisGroup.transition(t).call(xAxis)

  yAxisLabel.text(yLabelText);
  xAxisLabel.text("Month");

  //JOIN NEW DATA with old elements 
  let rects = g.selectAll("circle")
    .data(data, (d)=>{return d.month;}); //add Key

  //exit old elements not present in new data
  rects.exit()
    .attr("fill", "red")
    .transition(t)
    .attr("cy", y(0))
    .remove();

  //UPDATE old elements present in new data


  //Enter new elements

  rects.enter()
    .append("circle")
      //.attr("fill", d=> {return color(d[value]);})
      .attr("fill", "grey")
      .attr("cy",y(0))
      .attr("cx", d=>{return x(d.month)+x.bandwidth()/2;})
      .attr("stroke", "black")
      .attr("fill-opacity",0)
      .attr("r",5)
  //UPDATE old elements present in new data
      .merge(rects)
      .transition(t)
        .attr("cx", d=>{return x(d.month)+x.bandwidth()/2;})
        .attr("cy", d=>{return y(d[value]);})
        .attr("fill-opacity",1)
        .attr("fill", d=> {return color(d[value]);});
}


  //add labels to the bars
  /*
  let labels = gLabels.selectAll("text")
    .data(data)

  labels.enter()
    .append("text")
    .attr("class", "value-label")
    .attr("y", d=>{return y(d.revenue) + 20;})
    .attr("x", d=>{return x(d.month)+x.bandwidth()/2;})
    .text(d=>{return d.revenue;})
    .attr("fill", d=>{return reverseColor(d.revenue);})
    .attr("text-anchor", "middle");*/
