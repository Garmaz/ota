// import {select, json, scaleLinear, max, scaleBand} from 'd3';

const svg = d3.select('svg')
svg.style('background-color','#ebeff5')

const width = parseFloat(svg.attr('width'))
const height = +svg.attr('height')
color_map = {"busy":"#e8a989","idle":"#8be8b2","on_the_way":'#7eedeb'}
// console.log(color_map.busy)

const render = (ids,data)=>{
    const margin = {top:50, left:20, bottom:50, right:20};
    const innerHeight  = height-margin.bottom-margin.top;
    const innerWidth =  width - margin.left-margin.right;

    const g = svg.append('g')
        .attr('transform',`translate(${margin.left},${margin.top})`);


    const xScale = d3.scaleLinear()
        .domain([0,10])
        .range([0,innerWidth])

    const xAsis = d3.axisBottom(xScale)
        .tickSize(-innerHeight)
    ;

    const yScale = d3.scaleBand()
        .domain(data.map(d=>d.id))
        .range([0,innerHeight])
        .padding(0.1)

    const yAsis = d3.axisLeft(yScale);
        
    console.log(data)
    // console.log(Math.min(40, yScale.bandwidth()))
    g.append('g').call(yAsis)
        .selectAll(".domain, .tick line").remove()
    xAxisG = g.append('g').call(xAsis)
        .attr('transform',`translate(0,${innerHeight})`)
    xAxisG.selectAll(".domain").remove();
    xAxisG.append('text')
        .attr('x',innerWidth/2)
        .attr('y',30)
        .attr('fill','black')
        .text("Time")
        .attr('font-size',20)
    ;


    g.selectAll('rect').data(data)
    .enter().append('rect')
        .attr('fill',d=>color_map[d.status])
        .attr('x',d=>xScale(d.time[0]))
        .attr('width',d=>xScale(d.time[1]-d.time[0]))
        .attr('y',d=>yScale(d.id))
        .attr('height',yScale.bandwidth())
        .on('mouseover',(d,i)=>{
            document.getElementById("Bar info").innerHTML=
                    "Agent id: "+d.id+
                    "</br>Status: "+d.status+
                    "</br>Agent location: "+d.location+
                    "</br>At time: "+d.time
            // console.log("hover",d,i)
            // console.log(d3.mouse(g.node()))
            // var t = d3.select(this)
            // console.log(t)
            // // t.attr('fill','blue')
            // g.append('text')
            //     // .attr({x:xScale(d.time[0]),y:d=>yScale(d.id)})
            //     .attr('x',xScale(d.time[0]))
            //     .attr('y',yScale(d.id))
            //     .text("Agent id: "+d.id+"\nAgent location: "+d.location+"\nAt time: "+d.time)
        }
        )
        // .attr('height',Math.min(40, yScale.bandwidth()))


    // for (var i in data){
        // console.log(color_map[data[i].status])
    //     console.log(yScale(data[i].id))
    // }
            // .attr()
};

d3.json('agents.json').then(function(data){
    console.log(Object.keys( data));
    var ids= new Set();
    for (var k in data){
        ids.add(data[k].id)
    }
    console.log(ids)
    render(ids,data)
    // for(var k in data){
    //     console.log(k)
    //         render(keys,k,data[k]);
    // };
})
// console.log(data);
