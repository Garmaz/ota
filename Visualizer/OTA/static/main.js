// import {select, json, scaleLinear, max, scaleBand} from 'd3';

var svg = d3.select(".workers")
svg.style('background-color', '#ebeff5')

var width = parseFloat(svg.attr('width'))
var height = +svg.attr('height')
color_map = {
    "busy": "#e8a989",
    "idle": "#8be8b2",
    "on_the_way": '#7eedeb'
}

render = (data,metadata) => {
    // console.log(data)
    svg.call(d3.zoom().on("zoom", function () {
        console.log("zooming")
        yScale.range([0, innerWidth].map(d => d3.event.transform.applyY(d)));
        yAxisG.call(yAsis)
        xAxisG.call(xAsis.scale(d3.event.transform.rescaleX(xScale)));
        var new_xScale = d3.event.transform.rescaleX(xScale);
        d3.select("#canvas").selectAll("rect")
            .attr('y', d => yScale(d.agent.id))
            .attr('height', yScale.bandwidth())
            .attr('x', d => new_xScale(d.arrivetime))
            .attr('width', d => new_xScale(d.finish_time) - new_xScale(d.arrivetime))

    }))
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
        .domain([0, metadata.duration])
        .range([0, innerWidth])

    xAsis = d3.axisBottom(xScale)
        .tickSize(-innerHeight);

    yScale = d3.scaleBand()
        .domain(data.map(d => d.agent.id))
        .range([0, innerHeight])
        .padding(0.1)

    yAsis = d3.axisLeft(yScale);

    yAxisG = g.append('g').call(yAsis)
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
        .attr('height', yScale.bandwidth())
        .on('mouseover', function (d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '.75')
            div.transition()
                .duration(50)
                .style("opacity", 1);
            div.html("Agent_ID:"+d.agent.id)
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
        .on("click", function (d) {
            d3.selectAll('rect').transition()
                .duration('50')
                .attr('opacity', '1')
                .attr('fill','#f07a4f')
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '.5')
                .attr('fill','#000dff')
            console.log("clicked")
            // console.log(d)
            var curr_idle_set={};
            var curr_assi = [];
            var curr_idle = [];
            data.forEach(element => {
                if (
                    (element.arrivetime >= d.arrivetime && element.arrivetime <= d.finish_time) ||
                    (element.finish_time >= d.arrivetime && element.finish_time <= d.finish_time) ||
                    (element.arrivetime <= d.arrivetime && element.finish_time >= d.finish_time)
                ) {
                    curr_assi.push([element.agent.id, element.request.start.x, element.request.start.y, 0])
                    curr_assi.push([element.agent.id, element.request.end.x, element.request.end.y, 1])
                    // console.log(element.arrivetime, d.arrivetime, element.finish_time, d.finish_time)
                }
            // console.log(curr_assi)
            show_map(d.agent.id, curr_assi, metadata)

        })
};

function show_map(id, data, metadata) {
    const color_map = [
        "blue",
        "red"
    ]
    const margin = {
        top: 50,
        left: 50,
        bottom: 50,
        right: 50
    };

    var svg = d3.select(".location"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    const innerHeight = height - margin.bottom - margin.top;
    const innerWidth = width - margin.left - margin.right;

    // svg.attr('transform', `translate(${margin.left},${margin.top})`);

    var k = height / width,
        x0 = [0, metadata.xmax],
        y0 = [0, metadata.ymax],
        x = d3.scaleLinear().domain(x0).range([0, width]),
        y = d3.scaleLinear().domain(y0).range([height, 0]),
        z = d3.scaleOrdinal(d3.schemeCategory10);

    var xAxis = d3.axisTop(x)
    // .ticks(20)
    // .tickSize(-height),
    var yAxis = d3
        .axisRight(y)
    // .ticks(20 * height / width)
    // .tickSize(-width);

    var xGrid = d3.axisBottom(x)
        .ticks(20)
        // .tickSize(-height)
        .tickSizeOuter(0)
        .tickSizeInner(-height)
    svg.selectAll("circle").remove()
    svg.selectAll("path").remove()
    svg.selectAll("rect").remove()
    svg.selectAll("g").remove()
    var yGrid = d3.axisLeft(y)
        .ticks(20 * height / width)
        .tickSize(-width);

    Xgrid = svg.append("g")
        // .attr("class", "axis axis--x")
        .style("font", "0px times")
        .attr("transform", "translate(0," + (height - 10) + ")")
        .call(xGrid);

    Ygrid = svg.append("g")
        .style("font", "0px times")
        // .attr("class", "axis axis--y")
        .attr("transform", "translate(10,0)")
        .call(yGrid);


    var div = d3.select("body").append("div")
        .attr("class", "tooltip-bar")
        .style("opacity", 0);


    // svg.append("circle")
    // .attr("cx",x(0))
    // .attr("cy",y(0))
    // .attr("r",10)

    // svg.append("rect")
    //     .attr("x",x(0))
    //     .attr("y",y(y0[1]-y0[0]))
    //     .attr("width",x(x0[1]-x0[0]))
    //     .attr("height",100)
    //     .style("opacity",0.1)
    //     .style("fill","#affca7")

    // svg.append("rect")
    //     .attr("x",x(0))
    //     .attr("y",y(y0[1]-y0[0]))
    //     .attr("width",x(x0[1]-x0[0]))
    //     .attr("height",y(100))
    //     .attr("stroke","#37de64")
    //     .attr("stroke-width","5")
    //     .style("fill","none")

    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", function (d) {
            return x(d[1]);
        })
        .attr("cy", function (d) {
            return y(d[2]);
        })
        .attr("r", d => {
            if (d[0] == id && d[3] == 0) {
                return 7.5
            }
            return 5;
        })
        .attr("fill", function (d) {
            if (d[0] == id && d[3] == 0) {
                return "green"
            }
            return color_map[d[3]];
        })
        .on('mouseover', function (d, i) {

            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '.75')
            div.transition()
                .duration(50)
                .style("opacity", 1);
            div.html("Agent_ID: " + d[0] + "<br/>" + "x: " + d[1] + "<br/>" + "y: " + d[2])
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


    
    var linefunc = d3.line()
        .x(d => {
            return x(d[0])
        })
        .y(d => {
            return y(d[1])
        })
    // .interpolate("linear");
    line_data = []
    for (k in data) {
        if (k % 2 == 1) {
            line_data.push([
                [
                    [data[k - 1][1], data[k - 1][2]],
                    [data[k][1], data[k][2]]
                ]
            ])
        }
    }
    line_data.forEach(d => {
        // console.log(d[0][0][0], d[0][0][1], d[0][1][0], d[0][1][1])
        svg.append("path")
            .attr("class", "line")
            .data(d)
            .attr("d", linefunc)
            .attr("stroke", "blue")
            // .attr("stroke-width",1)
            .attr("fill", "none")

    });


    xG = svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + (height - 10) + ")")
        .call(xAxis);

    yG = svg.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(10,0)")
        .call(yAxis);

    svg.selectAll(".domain")
        .style("display", "none");


    svg.call(d3.zoom().on("zoom", zoom))

    function zoom() {
        xG.call(xAxis.scale(d3.event.transform.rescaleX(x)));
        Xgrid.call(xGrid.scale(d3.event.transform.rescaleX(x)));
        var new_x = d3.event.transform.rescaleX(x);
        yG.call(yAxis.scale(d3.event.transform.rescaleY(y)));
        Ygrid.call(yGrid.scale(d3.event.transform.rescaleY(y)));
        var new_y = d3.event.transform.rescaleY(y);
        svg.selectAll("circle")
            .attr('cx', d => new_x(d[1]))
            .attr('cy', d => new_y(d[2]))


        var new_linefunc = d3.line()
            .x(d => {
                return new_x(d[0])
            })
            .y(d => {
                return new_y(d[1])
            })
        svg.selectAll(".line")
            .attr("d", new_linefunc)
        svg.selectAll("rect")
            .attr("x", new_x(0))
            .attr("y", new_y(y0[1] - y0[0]))
            // .attr("x",x(x0[0]))
            // .attr("y",y(y0[0]))
            .attr("width", new_x(x0[1] - x0[0]))
            // .attr("width",x(x0[1]-x0[0]))
            .attr("height", new_y(-50))
    }

}


function show_graph(filename) {
    if (filename=="../static/data/"){
        console.log("nothing selected")
        return
    }
    else{
        console.log(filename)
        d3.json(filename).then(function (data) {
            render(data.slice(1),data.slice(0,1)[0])
        })

    }
}
// console.log(data);