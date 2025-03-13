// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    let width = 600, height = 400;
    let margin = {
      top: 50,
      bottom: 50,
      right: 50,
      left: 60
    }

    // Create the SVG container
    let svg = d3.select('#boxplot')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', 'lightyellow')
    

    // Set up scales for x and y axes
    let xScale = d3.scaleBand()
                   .domain([...new Set(data.map(d => d.Platform))]) 
                   .range([margin.left, width - margin.right])
                   .padding(0.5);
    
    let yScale = d3.scaleLinear()
                   .domain([0, d3.max(data, d => d.Likes)])
                   .range([height - margin.bottom, margin.top]);
    // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
    // d3.min(data, d => d.Likes) to achieve the min value and 
    // d3.max(data, d => d.Likes) to achieve the max value
    // For the domain of the xscale, you can list all four platforms or use
    // [...new Set(data.map(d => d.Platform))] to achieve a unique list of the platform
    

    // Add scales   
    let yAxis = svg.append('g')
                   .call(d3.axisLeft().scale(yScale))
                   .attr('transform', `translate(${margin.left},0)`);
    
    let xAxis = svg.append('g')
                   .call(d3.axisBottom().scale(xScale))
                   .attr('transform', `translate(0,${height - margin.bottom})`);


    // Add x-axis label
    svg.append('text')
       .text('Social Media Platforms')
       .attr('x', width / 2)
       .attr('y', height - 10)
       .attr('text-anchor', 'middle');

    // Add y-axis label
    svg.append('text')
       .text('Number of Likes')
       .attr('x', 0 - height / 2)
       .attr('y', 25)
       .attr('text-anchor', 'middle')
       .attr('transform', 'rotate(-90)');

    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values); 
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const max = d3.max(values);
        const IQR = q3 - q1;
        const lowerWhisker = Math.max(min, q1 - 1.5 * IQR);
        const upperWhisker = Math.min(max, q3 + 1.5 * IQR);
        return { lowerWhisker, q1, median, q3, upperWhisker };
    };
  
    // Comments for the following two lines:
    // 1. This code uses d3.rollup to group the data by Platform and compute quartiles (Q1, median, Q3, etc.).
    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.Platform);
    
    // 2. This code loops through each Platform and draws the box plot elements.
    quantilesByGroups.forEach((quantiles, Platform) => {
        // Calculate the x position for the Platform
        const x = xScale(Platform) + xScale.bandwidth() / 2;
        // Calculate the width of the box (Set to 60% of the bandwidth)
        const boxWidth = xScale.bandwidth() * 0.6;

        // Draw vertical lines
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x)
            .attr("y1", yScale(quantiles.lowerWhisker))
            .attr("y2", yScale(quantiles.upperWhisker))
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Draw box
        svg.append("rect")
           .attr("x", x - boxWidth / 2)  // Center the box
           .attr("y", yScale(quantiles.q3)) // Start at Q3 (higher value)
           .attr("width", boxWidth)
           .attr("height", Math.abs(yScale(quantiles.q1) - yScale(quantiles.q3))) 
           .attr("stroke", "black")
           .attr("fill", "lightblue");

        // Draw median line (horizontal lines)
        svg.append("line")
           .attr("x1", x - boxWidth / 2) 
           .attr("x2", x + boxWidth / 2) 
           .attr("y1", yScale(quantiles.median))
           .attr("y2", yScale(quantiles.median))
           .attr("stroke", "black")
           .attr("stroke-width", 4);
    });
});

// Prepare you data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
      d.AvgLikes = +d.AvgLikes;
  });


    // Define the dimensions and margins for the SVG
    let width = 600, height = 400;
    let margin = {
      top: 50,
      bottom: 50,
      right: 50,
      left: 60
    }

    // Create the SVG container
    let svg = d3.select('#barplot')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', 'lightyellow')
    

    // Define four scales
    // Scale x0 is for the platform, which divide the whole scale into 4 parts
    // Scale x1 is for the post type, which divide each bandwidth of the previous x0 scale into three part for each post type
    // Recommend to add more spaces for the y scale for the legend
    // Also need a color scale for the post type

    let x0 = d3.scaleBand()
               .domain([...new Set(data.map(d => d.Platform))]) 
               .range([margin.left, width - margin.right])
               .padding(0.5);
      

    let x1 = d3.scaleBand()
               .domain([...new Set(data.map(d => d.PostType))])
               .range([0, x0.bandwidth()])
               .padding(0.2);
      

    let y = d3.scaleLinear()
              .domain([0, d3.max(data, d => d.AvgLikes)])
              .range([height - margin.bottom, margin.top]);
      

    const color = d3.scaleOrdinal()
      .domain([...new Set(data.map(d => d.PostType))])
      .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);    
         
    // Add scales x0 and y  
    let yAxis = svg.append('g')
      .call(d3.axisLeft().scale(y))
      .attr('transform', `translate(${margin.left},0)`);   
    
    let x0Axis = svg.append('g')
                    .call(d3.axisBottom(x0))
                    .attr('transform', `translate(0,${height - margin.bottom})`);

    // Add x-axis label
    svg.append('text')
        .text('Social Media Platforms')
        .attr('x', width / 2)
        .attr('y', height - 10)
        .attr('text-anchor', 'middle');
        

    // Add y-axis label
    svg.append('text')
        .text('Average Number of Likes')
        .attr('x', 0 - height / 2)
        .attr('y', 25)
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)');


  // Group container for bars
    const barGroups = svg.selectAll("bar")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${x0(d.Platform)},0)`);

  // Draw bars
    barGroups.append("rect")
      .attr("x", d => x1(d.PostType))
      .attr("y", d => y(d.AvgLikes))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - margin.bottom - y(d.AvgLikes))
      .attr("fill", d => color(d.PostType));
      

    // Add the legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 80}, ${margin.top})`);

    const types = [...new Set(data.map(d => d.PostType))];
 
    types.forEach((type, i) => {

    // Alread have the text information for the legend. 
    // Now add a small square/rect bar next to the text with different color.
      legend.append("rect")
          .attr("x", 0)
          .attr("y", i * 20)
          .attr("width", 10)
          .attr("height", 10)
          .attr("fill", color(type));

      legend.append("text")
          .attr("x", 20)
          .attr("y", i * 20 + 12)
          .text(type)
          .attr("alignment-baseline", "middle");
  });

});

// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 

const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.AvgLikes = +d.AvgLikes;
    });
    

    // Define the dimensions and margins for the SVG
    let width = 1000, height = 600;
    let margin = {
      top: 50,
      bottom: 80,
      right: 50,
      left: 60
    }
    

    // Create the SVG container
    let svg = d3.select('#lineplot')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', 'lightyellow')
    

    // Set up scales for x and y axes  
    let xScale = d3.scaleBand()
                   .domain(data.map(d => d.Date))
                   .range([margin.left, width - margin.right])
                   .padding(0.5);

    let yScale = d3.scaleLinear()
                   .domain([0, d3.max(data, d => d.AvgLikes)])
                   .range([height - margin.bottom, margin.top]);


    // Draw the axis, you can rotate the text in the x-axis here
    let xAxis = svg.append('g')
                  .call(d3.axisBottom().scale(xScale))
                  .attr('transform',`translate(0,${height - margin.bottom})`)
                  .selectAll("text")
                  .attr("transform", "rotate(-25)")
                  .style("text-anchor", "end");

    let yAxis = svg.append('g')
                   .call(d3.axisLeft().scale(yScale))
                   .attr('transform', `translate(${margin.left},0)`);



    // Add x-axis label
    svg.append('text')
       .text('Date')
       .attr('x', width / 2)
       .attr('y', height - 10)
       .attr('text-anchor', 'middle');

    // Add y-axis label
    svg.append('text')
       .text('Average Number of Likes')
       .attr('x', 0 - height / 2)
       .attr('y', 25)
       .attr('text-anchor', 'middle')
       .attr('transform', 'rotate(-90)');


    // Draw the line and path. Remember to use curveNatural.
    let line = d3.line()
             .x(d=>xScale(d.Date)+xScale.bandwidth()/2)
             .y(d=>yScale(d.AvgLikes))
             .curve(d3.curveNatural);

let path = svg.append('path')
              .datum(data)
              .attr('stroke', 'goldenrod')
              .attr('stroke-width', 2)
              .attr('d', line)
              .attr('fill', 'none') 

});
