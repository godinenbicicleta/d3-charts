let time = 0;
let formattedData;
let interval;

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


//scales
let x = d3.scaleLog()
  .range([0,width])
  .domain([142, 150000]);

let y = d3.scaleLinear()
  .range([height,0])
  .domain([0,90]);

let a = d3.scaleSqrt()
  .range([5,25])
  .domain([2000,1400000000]);

let color = d3.scaleOrdinal(d3.schemeCategory10);

//labels
let xAxisLabel = g.append("text")
  .attr("class", "x axis-label")
  .attr("x", width/2)
  .attr("y", height+50)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("GDP per Capita ($)");

let yAxisLabel = g.append("text")
  .attr("class", "y axis-label")
  .attr("x",-(height/2))
  .attr("y", -60)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .text("Life Expectancy (years)");


let timeLabel = g.append("text")
  .attr("y", height-10)
  .attr("x", width-40)
  .attr("font-size","40px")
  .attr("opacity","0.4")
  .attr("text-anchor", "middle")
  .text("1800");

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

  
let xAxis = d3.axisBottom(x)
    .tickValues([400,4000,40000])
    .tickFormat(d3.format("$"));

yAxisGroup.call(yAxis);
xAxisGroup.call(xAxis);

//load the data
d3.json("data/gap.json")
  .then(main)
  .catch(error=>{console.log(error);});

//---------------------legend--------------
let continents = ["europe", "asia", "americas", "africa"]

let legend = g.append("g")
  .attr("transform", `translate(${width-75},${height-125})`)

for(const [i,c] of continents.entries()){
  let legendRow = legend.append("g")
    .attr("transform",`translate(${0},${i*20})`);

  legendRow.append("rect")
    .attr("width", 10)
    .attr("height",10)
    .attr("fill", color(c));

  legendRow.append("text")
  .attr("x", 13)
  .attr("y",10)
  .attr("text-anchor", "beginning")
  .style("text-transform", "capitalize")
  .text(c);
}




function main(data){
  console.log(data);

  formattedData = data.map(
    year => {
      return year["countries"].filter(
      (country)=>(country.income && country.life_exp)
      ).map(
      country => {
            country.income = +country.income;
            country.life_exp = +country.life_exp;
            return country;            
        })
    });

  update(formattedData[0]);
}

function step(){
    time = (time<214) ? time+1 : 0 ;
    update(formattedData[time]);
  }
 
document.getElementById("play-button")
  .addEventListener("click",function(){
    let button = this;
    if(button.innerText =="Play"){
      button.innerText = "Pause";
      interval = setInterval(step,100);
      }
    else{
      button.innerText="Play";
      clearInterval(interval);
    }
    });


document.getElementById("reset-button")
  .addEventListener("click", function(){
    time = 0;
    update(formattedData[0]);
    });


document.getElementById("continent-select")
  .addEventListener("change", function(){
      update(formattedData[time]);
    })

function update(data){
  let t = d3.transition()
    .duration(100);

  let continent = document.getElementById("continent-select")
    .value;

  data = data.filter(d=>{
    if(continent=="all") {return true;}
    else {return d.continent==continent;}
    });
  
  //JOIN NEW DATA with old elements 
  let circles = g.selectAll("circle")
    .data(data,d=>d.country); //add key


  //exit old elements not present in new data
  circles.exit()
    .remove();

  //Enter new elements

  circles.enter()
    .append("circle")
      //.attr("fill", d=> {return color(d[value]);})
      .attr("fill", d => color(d.continent) )
      .attr("stroke", d => color(d.continent) )
      .attr("stroke-width", "1px")
      .attr("fill-opacity", 0.7)
  //UPDATE old elements present in new data
      .merge(circles)
      .transition(t)
        .attr("cx", d => x(d.income) )
        .attr("cy", d => y(d.life_exp) )
        .attr("r", d => a(d.population) );
  
  timeLabel.text(+(time+1800));
  label
    .attr("x", tScale(+time+1800))
    .text(time+1800);
  handle.attr("cx", tScale(time+1800));
}

//------------slider--------------


let sh = 100;
let sw = width + margin.left + margin.right;



let startDate = 1800;
let endDate = 2014;


let tScale = d3.scaleLinear()
    .domain([startDate, endDate])
    .range([0, width])
    .clamp(true);


let sliderSvg = d3.select("#slider")
  .append("svg")
  .attr("class","slider")
  .attr("height",sh)
  .attr("width",sw)



let slider = sliderSvg.append("g")
  .attr("class", "slider")
  .attr("transform", `translate(${margin.left},${sh/2})`);

slider.append("line")
  .attr("class", "track")
  .attr("x1", tScale.range()[0])
  .attr("x2", tScale.range()[1])
  .select(function(){return this.parentNode.appendChild(this.cloneNode(true));})
    .attr("class", "track-inset")
  .select(function(){return this.parentNode.appendChild(this.cloneNode(true));})
    .attr("class", "track-overlay")
    .call(d3.drag()
      .on("start.interrupt", function(){slider.interrupt();})
      .on("start drag", function(){hue(tScale.invert(d3.event.x));}));



slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", `translate(0,18)`)
  .selectAll("text")
    .data(tScale.ticks(10))
    .enter()
    .append("text")
    .attr("x", tScale)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .text(function(d) { return d ; });

let label = slider.append("text")
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(endDate)
    .attr("x",tScale(startDate))
    .attr("transform", "translate(0," + (-15) + ")")

let handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9)
    .attr("cx", tScale(startDate));

function hue(h) {
  time = Math.round(h)-1800;

  update(formattedData[time]);
    
}
