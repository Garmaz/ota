d3.json('assignments.json').then(function(data){
    var ids = Object.keys(data)
    console.log(data)
    // for(var k in data){
    //     console.log(data[k])
    //     for (var a in data[k]){
    //         console.log(data[k][a].status)
    //     }
    //         // render(keys,k,data[k]);
    // };
})
// console.log(data);
