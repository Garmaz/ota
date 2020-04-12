// import {select, json, scaleLinear, max, scaleBand} from 'd3';

const svg = d3.select('svg')
svg.style('background-color','#ebeff5')

const width = parseFloat(svg.attr('width'))
const height = +svg.attr('height')
color_map = {"busy":"#e8a989","idle":"#8be8b2"}
// console.log(color_map.busy)

const render = (ids,data)=>{
    //SVG setup
    const margin = {top:50, left:20, bottom:50, right:20};
    const innerHeight  = height-margin.bottom-margin.top;
    const innerWidth =  width - margin.left-margin.right;

    const g = svg.append('g')
        .attr('transform',`translate(${margin.left},${margin.top})`);


    //Setting scales and axis
    const xScale = d3.scaleLinear()
        .domain([0,10])
        .range([0,innerWidth])

    const xAxis = d3.axisBottom(xScale)
        .tickSize(-innerHeight);

    const yScale = d3.scaleBand()
        .domain(ids)
        .range([0,innerHeight])
        .padding(0.1)

    const yAxis = d3.axisLeft(yScale);
        
    //Rendering Axis
    console.log(data)
    // console.log(Math.min(40, yScale.bandwidth()))
    g.append('g').call(yAxis)
        .selectAll(".domain, .tick line").remove()
    xAxisG = g.append('g').call(xAxis)
        .attr('transform',`translate(0,${innerHeight})`)
    xAxisG.selectAll(".domain").remove();
    xAxisG.append('text')
        .attr('x',innerWidth/2)
        .attr('y',30)
        .attr('fill','black')
        .text("Time")
        .attr('font-size',20)
    ;

    //Rendering bars
    for(var a in data){
        console.log(a)
        var agent = data[a]
        for(var r in agent){
            var record = agent[r]
            const rec = g.append('rect')
                .attr('fill',color_map[record.status])
                .attr('x',xScale(record.time[0]))
                .attr('width',xScale(record.time[1]-record.time[0]))
                .attr('y',yScale(a))
                .attr('height',yScale.bandwidth())
            rec.data(record)
            console.log(rec.d)
            console.log(typeof(record))
            //having problem for more interaction
                // .on('mouseover',(d,i)=>{
                //     // document.getElementById("Bar info").innerHTML="Agent id: "+a+"</br>Agent location: "+record.location+"</br>At time: "+record.time
                //     console.log("hover",d,i)
                //     // console.log(d3.mouse(g.node()))
                //     // var t = d3.select(this)
                //     // console.log(t)
                //     // // t.attr('fill','blue')
                //     // g.append('text')
                //     //     // .attr({x:xScale(d.time[0]),y:d=>yScale(d.id)})
                //     //     .attr('x',xScale(d.time[0]))
                //     //     .attr('y',yScale(d.id))
                //     //     .text("Agent id: "+d.id+"\nAgent location: "+d.location+"\nAt time: "+d.time)
                // }
                // )
        }
    }




    // for (var i in data){
        // console.log(color_map[data[i].status])
    //     console.log(yScale(data[i].id))
    // }
            // .attr()
};

d3.json('agents_1.json').then(function(data){
    var ids = Object.keys(data)
    console.log(ids)
    render(ids,data)
    // for(var k in data){
    //     console.log(data[k])
    //     for (var a in data[k]){
    //         console.log(data[k][a].status)
    //     }
    //         // render(keys,k,data[k]);
    // };
})
// console.log(data);
