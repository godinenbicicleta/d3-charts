//LineChart Class
class CircChart{
  constructor(_parentElement){
    this.parentElement = _parentElement;
    this.initVis();
    this.line = d3.line()
      .x(d=>d.x)
      .y(d=>d.y);
  }

  initVis(){
    
    let vis = this;
    var diameter = 960;
    let radius = 480;

    vis.svg = d3.select(vis.parentElement).append("svg")
      .attr("width", diameter)
      .attr("height", diameter)
    
    vis.g = vis.svg.append("g")
      .attr("transform",`translate(${radius},${radius})`);
    
    //time parse for x-scale
    vis.parseTime = d3.timeParse("%d/%m/%Y");

    vis.firstDate  = vis.parseTime("12/05/2013");
    vis.lastDate = vis.parseTime("31/10/2017");

    //Line path generator

    vis.circles = vis.g.selectAll('circle')
      .data(formattedData.features)
      .enter().append('circle')
      .attr("class", "low-circle")
      .attr('r', d=>{return 5;})
      .attr('cx', d=>d.properties.cx)
      .attr('cy',d=>d.properties.cy)

    vis.texts = vis.g.selectAll('text')
        .data(formattedData.features)
        .enter()
        .append("text")
        .attr("class", "node-label-low")
        .attr("dy", "0.31em")
        .attr("text-anchor", function(d){
          let angle = d.properties.id/numNodes*2*Math.PI;
          if(angle>3*Math.PI/2||angle<Math.PI/2){
            return "start";}
          else{return "end";}
        })
        .attr("transform",function(d){
          let angle = d.properties.id/numNodes*360;
          let res = `rotate(${angle})translate(${480*.6+8})`
          if(angle>270 || angle <90){
            return res;}
          else{return res+"rotate(180)";}})
        .text(function(d) { return d.properties.name; }
        );
/*
{ console.log(d.properties.id/numNodes*2*Math.PI);return
   (d.properties.id/numNodes*2*Math.PI) <
   Math.PI/2 ? "start" : "end"; })
*/ 
    vis.wrangleData();
    }
  
  wrangleData(){
    let vis = this;

    vis.cat = document.getElementById("cat-select").value;
    
    vis.pathData = []

    formattedData.features.map(d=>{
      if(d.properties.cat.includes(vis.cat)){
        vis.pathData.push([{x:d.properties.cx,y:d.properties.cy},{x:0,y:0}])
      }

      return d
    })
    console.log(formattedData.features);

    vis.updateVis();
    }

  updateVis(){
    let vis = this;

    vis.circles
      .attr("class", function(d){
        if(d.properties.cat.includes(vis.cat)){
          return "circle-high";}
        else{return "circle-low";}
      })
      vis.texts
      .attr("class", function(d){
        if(d.properties.cat.includes(vis.cat)){
          return "node-label-high";}
        else{return "node-label-low";}
      });
    


    //JOIN NEW DATA with old elements 
    vis.lines =  vis.g.selectAll("path")
      .data(vis.pathData, d=>d.id);//ADD KEY
    //exit old elements not present in new data
    vis.lines.exit()
      .remove();
//Enter new elements

vis.lines.enter()
  .append("path")
    //.attr("fill", d=> {return color(d[value]);})
    .attr("fill", "none" )
    .attr("stroke", "red" )
    .attr("stroke-width", "3px")
//UPDATE old elements present in new data
    .merge(vis.lines)
    //.transition(t)
      .attr("d", d => vis.line(d) );
  
}
}