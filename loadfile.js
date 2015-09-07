/**
 * Analyze the relations of classes and ids in an HTML document.
 * Uses D3.js for visualization.
 *
 * Licensed under the MIT License
 * (c) 2014 by Martin Giger
 */

function graphData({height, width}) {
    this.nodes = [];
    this.links = [];
    this.currentIDNumber = this.classGroup;
    this.color = d3.scale.category20();

    // setup graph

    var that = this;

    this.svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    this.force = d3.layout.force()
        .charge(-100)
        .linkDistance(60)
        .size([width, height]);


    this.force.on("tick", function() {
        that.svg.selectAll(".link").attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        that.svg.selectAll(".node").attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });
}

graphData.prototype.nodes = [];
graphData.prototype.links = [];
graphData.prototype.currentIDNumber = 1;
graphData.prototype.classGroup = 1;
graphData.prototype.svg = null;
graphData.prototype.force = null;
graphData.prototype.color = null;

graphData.prototype.addClasses = function(dom) {
    var elements = dom.querySelectorAll('*');

    for(var e = 0; e < elements.length; ++e) {
        for(var c = 0; c < elements[e].classList.length; ++c) {
            if(elements[e].classList.item(c) && this.getClassIndex(elements[e].classList.item(c)) == -1) {
                this.nodes.push({"name":elements[e].classList.item(c),"group":this.classGroup});
            }
        }
    }
};

graphData.prototype.getIDs = function(dom,idn) {
    var elements = dom.querySelectorAll("*");

    for(var e = 0; e < elements.length; ++e) {
        if(elements[e].id && elements[e].id != '')
            this.nodes.push({"name":elements[e].id,"group":idn});
    }
};

graphData.prototype.generateLinks = function(dom, idn) {
    var element;
    this.nodes.forEach(function(node,i) {
        if(node.group == idn) {
            element = dom.querySelector('#'+node.name);
            for(var c = 0; c < element.classList.length; ++c) {
                if(element.classList.item(c)) {
                    this.links.push({"source":parseInt(i,10),"target":this.getClassIndex(element.classList.item(c)),"value":1});

                    for(var o = 0; o < element.classList.length; ++o) {
                        if(c != o)
                            this.links.push({"source":this.getClassIndex(element.classList.item(c)),"target":this.getClassIndex(element.classList.item(o)),"value":0});
                    }
                }
            }
        }
    }, this);
};

graphData.prototype.update = function(uri) {
    var that = this;
    d3.html(uri, function(dom) {
        that.setDom(dom);
    });
};

graphData.prototype.setDom = function(dom) {
    var idn = ++this.currentIDNumber;

    this.getIDs(dom, idn);
    this.addClasses(dom);
    this.generateLinks(dom, idn);

    this.force
      .nodes(this.nodes)
      .links(this.links)
      .start();

    var link = this.svg.selectAll(".link")
      .data(this.links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.value); });

    var node = this.svg.selectAll(".node")
      .data(this.nodes)
    .enter().append("g")
      .attr("class", "node")
      .call(this.force.drag);

    node.append("text")
      .attr("dx", 2)
      .attr("dy", ".35em")
      .style("fill", function(d) { return this.color(d.group); })
      .text(function(d) { return (d.group==1?'.':'#')+d.name });
};

graphData.prototype.getClassIndex = function(className) {
    var index = -1;
    this.nodes.forEach(function(node,i) {
        if(node.group == this.classGroup && node.name == className)
            index = i;
    }, this);

    return index;
};
