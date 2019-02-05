//global variables
let formattedData;
let circChart;
let numNodes;



//----------coin-select----------//

document.getElementById("cat-select")
  .addEventListener("change", function(){
  circChart.wrangleData();
    });


//----------var-select----------//

document.getElementById("var-select")
  .addEventListener("change", function(){
  lineChart.wrangleData();
});


//------- date slider ------//

function sliderEnded(h){
  lineChart.wrangleData();
  }

function sliderStarted(h){
    lineChart.wrangleData();
  }

// constructor(_parentElement, _startDate, _endDate){
slider1 = new DateSlider("#date-slider","12/05/2013", "31/10/2017" );

//load data
d3.csv("data/geoawesomeness.csv")
  .then(main)
  .catch(error=>console.log(error));

//main function
function main(data){
  
  console.log(data);
  
  formattedData = toPoints(data);
    


  console.log(formattedData);

  circChart = new CircChart("#chart-area");
}

function toPoints(data){
  let radius=480;
  let geoms = [];
  let c_y;
  let c_x;
  let i=0;
  numNodes = data.length;
  console.log(numNodes);
  for(let p of data){
    
    if (p.x){
      angle = (i / (numNodes)) * 2 * Math.PI; 
                                           
     c_x = (radius*.6 * Math.cos(angle)); 
     c_y = (radius*.6* Math.sin(angle)); 
      geoms.push({
          type: "Feature", properties:{
            name: p.name , website: p.website , category: p.category, "location": p.location,  date:p.fecha, info:p.info,
     employees:p.employees, tech:p.tech, companies_partner:p.companies_partner, problem_to_solve:p.problem_to_solve,
     value_ideal_customer:p.value_ideal_customer, "status":p.status, year:+p.year_,
     cat:p.cat.split(","),cx:c_x, cy:c_y,"id":i
          },
          geometry:{type:"Point",coordinates:[+p.x,+p.y]}
        });
        i+=1;
      }
    else{
      angle = (i / (numNodes)) * 2 * Math.PI; 
                                           
      c_x = (radius*.6 * Math.cos(angle)); 
      c_y = (radius*.6* Math.sin(angle)); 
       geoms.push({
           type: "Feature", properties:{
             name: p.name , website: p.website , category: p.category, "location": p.location,  date:p.fecha, info:p.info,
      employees:p.employees, tech:p.tech, companies_partner:p.companies_partner, problem_to_solve:p.problem_to_solve,
      value_ideal_customer:p.value_ideal_customer, "status":p.status, year:+p.year_,
      cat:p.cat.split(","),cx:c_x, cy:c_y,"id":i
           }
         });
         i+=1;

    }
    
    }

       return {type:"FeatureCollection", features:geoms};
  }

