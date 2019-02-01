//load the data
d3.json("data/gap.json")
  .then(main)
  .catch(error=>{console.log(error);});


let t = d3.transition().duration(100);

//D3 margin convention
let margin = {top:50, right:20, bottom:100, left:80};

//width and height for the g group
let width = 600 - margin.left - margin.right;
let height = 400 - margin.top - margin.bottom;

//create svg container
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

//group for the lagend
let gLegend = svg.append("g")
  .attr("transform", `translate(${width+margin.left-30}, ${height+30})`);

//scales
let x = d3.scaleLog()
  .range([0,width]);

let y = d3.scaleLinear()
  .range([height,0]);

let a = d3.scaleSqrt()
  .range([5,25]);

let color = d3.scaleOrdinal((d3.schemeCategory10));
  
  a.domain([2000, 1400000000]);
  //update domain for scales
  x.domain([300,150000]);

  y.domain([0,90]);

//call to y axis
let yAxisGroup = g.append("g")
  .attr("class", "y axis");

//call to x axis
let xAxisGroup = g.append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0,${height})`);

let yAxis = d3.axisLeft(y)
    .ticks(10)
    .tickFormat(d=>{return +d;});

  yAxisGroup.transition(t).call(yAxis);
  
let xAxis = d3.axisBottom(x)
    .tickValues([400,4000,40000])
    .tickFormat(d3.format("$"));

  xAxisGroup.transition(t).call(xAxis)


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

yAxisLabel.text("Life Expectancy (years)");
xAxisLabel.text("GDP per Capita ($)");

var flag = 0;

function main(data){
  console.log(data);

  color.domain(data[0].countries.map(d=>{return d.continent;}));
  const formattedData = data.map(function(year){
        return year["countries"].filter(function(country){
            var dataExists = (country.income && country.life_exp);
            return dataExists
        }).map(function(country){
            country.income = +country.income;
            country.life_exp = +country.life_exp;
            return country;            
        })
    });

  d3.interval(function(){
    if(flag<214){
      update(formattedData[flag],flag);
      }
    else{
      flag=-1;
      }
    flag++
    },1000);

  update(formattedData[0],flag+1800);
}

  
function update(data, year){


  //set axis
  


  //JOIN NEW DATA with old elements 
  let rects = g.selectAll("circle")
    .data(data, (d)=>{return d.country;}); //add Key

  //exit old elements not present in new data
  rects.exit()
    .remove();

  //UPDATE old elements present in new data


  //Enter new elements

  rects.enter()
    .append("circle")
      //.attr("fill", d=> {return color(d[value]);})
      .attr("fill", d=>{return color(d.continent)})
  //UPDATE old elements present in new data
      .merge(rects)
      .transition(t)
        .attr("cx", d=>{return x(d.income);})
        .attr("cy", d=>{return y(d.life_exp);})
        .attr("r",d=>{return a(d.population)});
  
  
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
    .attr("text-anchor", "middle");
    
    */
