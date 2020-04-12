// import {select, json, scaleLinear, max, scaleBand} from 'd3';

var svg = d3.select('svg')
svg.style('background-color', '#ebeff5')

var width = parseFloat(svg.attr('width'))
var height = +svg.attr('height')
color_map = {
    "busy": "#e8a989",
    "idle": "#8be8b2",
    "on_the_way": '#7eedeb'
}
// console.log(color_map.busy)

render = (data) => {
    svg.call(d3.zoom().on("zoom",function(){
        console.log("zooming")
        yScale.range([0, innerWidth].map(d => d3.event.transform.applyY(d)));
        yAxisG.call(yAsis)
        // yAxisG.call(yAsis.scale(d3.event.transform.rescaleY(yScale)));
        xAxisG.call(xAsis.scale(d3.event.transform.rescaleX(xScale)));
        // var new_yScale = d3.event.transform.rescaleY(yScale);
        var new_xScale = d3.event.transform.rescaleX(xScale);
        // barwidth = new_yScale(1)
        d3.select("#canvas").selectAll("rect")
            // .data(mainData[0].data)
            .attr('y', d => yScale(d.agent.id))
            .attr('height', yScale.bandwidth())
            // .attr('y', d => new_yScale(d.agent.id))
            // .attr('height', new_yScale(1)-new_yScale(0))
            .attr('x', d => new_xScale(d.arrivetime))
            .attr('width', d => new_xScale(d.finish_time) - new_xScale(d.arrivetime))
    
    }))
    // var zoom = d3.zoom().on("zoom", null);
    const margin = {
        top: 50,
        left: 20,
        bottom: 50,
        right: 20
    };
    const innerHeight = height - margin.bottom - margin.top;
    const innerWidth = width - margin.left - margin.right;
    
    var g = svg.append('g')
    .attr("id", "canvas")
    .attr('transform', `translate(${margin.left},${margin.top})`);
    
    
    
    xScale = d3.scaleLinear()
    .domain([0, 100])
    .range([0, innerWidth])
    
    xAsis = d3.axisBottom(xScale)
    .tickSize(-innerHeight);
    
    yScale = d3.scaleBand()
    .domain(data.map(d => d.agent.id))
    // .domain([0,data.length-1])
    .range([0, innerHeight])
    .padding(0.1)
    
    yAsis = d3.axisLeft(yScale);
    
    console.log(data)
    // console.log(Math.min(40, yScale.bandwidth()))
    yAxisG = g.append('g').call(yAsis)
    // .selectAll(".domain, .tick line").remove()
    xAxisG = g.append('g').call(xAsis)
    .attr('transform', `translate(0,${innerHeight})`)
    xAxisG.selectAll(".domain").remove();
    xAxisG.append('text')
    .attr('x', innerWidth / 2)
    .attr('y', 30)
    .attr('fill', 'black')
    .text("Time")
    .attr('font-size', 20);
    
    
    var div = d3.select("body").append("div")
        .attr("class", "tooltip-bar")
        .style("opacity", 0);
        
        g.selectAll('rect').data(data)
        .enter().append('rect')
        .attr('fill', "#f07a4f")
        .attr('x', d => xScale(d.arrivetime))
        .attr('width', d => xScale(d.finish_time - d.arrivetime))
        .attr('y', d => yScale(d.agent.id))
        // .attr('height', yScale(1))
        .attr('height', yScale.bandwidth())
        .on('mouseover', function (d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '.75')
            div.transition()
                .duration(50)
                .style("opacity", 1);
            div.html(d.request.id)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px");
        })
        .on('mouseout', function (d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '1')
            div.transition()
                .duration('50')
                .style("opacity", 0);
        })
    // svg.call(zoom);
};


d3.json('gen_ass.json').then(function (data) {
    render(data)
    // for(var k in data){
    //     console.log(k)
    //         render(keys,k,data[k]);
    // };
})
// console.log(data);