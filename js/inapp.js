var padding = { top: 20, right: 0, bottom: 0, left: 0 },
    w = 300 - padding.left - padding.right,
    h = 300 - padding.top - padding.bottom,
    r = Math.min(w, h) / 2,
    rotation = 0,
    oldrotation = 0,
    picked = 1000,
    oldpick = [],
    color = d3.scale.category20(),
    svg = d3.select('#weSpinWheel').append("svg").data([weDATA]),
    container = svg.append("g").attr("class", "spinner").attr("transform", "translate(" + (w / 2 + padding.left) + "," + (h / 2 + padding.top) + ")"),
    vis = container.append("g").attr("class", "spi").attr("transform", "rotate(0)"),
    pie = d3.layout.pie().sort(null).value(function (d) { return 1; }),
    arc = d3.svg.arc().outerRadius(r),
    arcs = vis.selectAll("g.slice").data(pie).enter().append("g").attr("class", "slice");

// console.log("r", r);
// console.log("arcs", arcs);
// console.log("container", container);
// console.log("vis", vis);
arcs.append("path").attr("fill", function (d, i) { return d.data.color; }).attr("stroke", "black").attr("stroke-width", "4").attr("d", function (d) { return arc(d); });
arcs.append("text").attr("transform", function (d) {
    d.innerRadius = 0;
    d.outerRadius = r;
    d.angle = (d.startAngle + d.endAngle) / 2;
    return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")translate(" + (d.outerRadius - 30) + ")";
}).attr("text-anchor", "end").text(function (d, i) {
    return weDATA[i].weName;
}).style({ "fill": "#000000", "font-size": "14px", "font-weight": "600" });
//container.on("click", spin); rotate(136deg) translate(30px, -76px)

function spin(d) {
    container.on("click", null);
    if (oldpick.length == weDATA.length) {
        //console.log("done");
        container.on("click", null);
        return;
    }
    var weightedObj = {};
    for (var i = 0; i < weDATA.length; i++) {
        weightedObj[i] = weDATA[i].wePercWght;
    }
    var rand012 = weightedRandom(weightedObj);
    var ps = 360 / weDATA.length,
        pieslice = Math.round(1440 / weDATA.length),
        rng = Math.floor((Math.random() * 1440) + 360);
    rotation = 1440 + (ps * (weDATA.length - Number(rand012())))
    picked = Math.round(weDATA.length - (rotation % 360) / ps);
    picked = picked >= weDATA.length ? (picked % weDATA.length) : picked;
    if (oldpick.indexOf(picked) !== -1) {
        d3.select(this).call(spin);
        return;
    } else {
        oldpick.push(picked);
    }
    rotation += 0 - Math.round(ps / 2);
    //console.log("rotation", rotation);
    vis.transition().duration(3000).attrTween("transform", rotTween)
        .each("end", function () {
            document.querySelector("span#prize").innerText = weDATA[picked].weName;
            document.querySelector("code > p").innerText = weDATA[picked].weCode;
            // Don't display spin page
            document.querySelector(".spinContainer").classList.add("hide");
            // show the winner/losser page
            if (weDATA[picked].weWin === "yes") {
                try{
                    weNotification.trackEvent('In-app Template - Spin Clicked', JSON.stringify({ "Win": weDATA[picked].weWin, "Respin count": oldpick.length }), false);
                } catch(err) {

                }
                document.querySelector(".weWinCont").classList.add("show");
                let respn = document.querySelector("dialog > div.weWinCont.show > div:nth-child(2) > button.respin-button");
                respn.addEventListener("click", () => {
                    document.querySelector(".weWinCont.show").classList.remove("show");
                    document.querySelector(" dialog > div.spinContainer.hide").classList.remove("hide");
                    document.querySelector("dialog > div.spinContainer.hide").classList.add("show");
                });
            } else if (weDATA[picked].weWin === "no") {
                try {
                    weNotification.trackEvent('In-app Template - Spin Clicked', JSON.stringify({ "Win": weDATA[picked].weWin, "Respin count": oldpick.length }), false);
                } catch(err) {

                }
                document.querySelector(".welostCont").classList.add("show");
                let respn1 = document.querySelector("dialog > div.welostCont.show > div:nth-child(2) > button.respin-button")
                respn1.addEventListener("click", () => {
                    try {
                        weNotification.trackEvent('In-app Template - Spin Clicked', JSON.stringify({ "Win": weDATA[picked].weWin, "Respin": true, "Respin count": oldpick.length }), false);
                    } catch(err) {

                    }
                    document.querySelector(".welostCont.show").classList.remove("show");
                    document.querySelector("dialog > div.spinContainer.hide").classList.remove("hide");
                    document.querySelector("dialog > div.spinContainer.hide").classList.add("show");
                });
            }

            /* Comment the below line for restrict spin to sngle time */
            //container.on("click", spin);
        });
}
function rotTween() {
    var i = d3.interpolate(oldrotation % 360, rotation);
    return function (t) {
        return "rotate(" + i(t) + ")";
    };
}
//make arrow
svg.append("g").attr("transform", "translate(139,0)").append("path").attr("d", "M1 1H31V32.615L16 46.6314L1 32.615V1Z").style({ "fill": "white", "stroke": "#001D34", "stroke-width": "2", "margin": "10px", "position": "absolute", "transform": "rotate(0deg)", "filter": "drop-shadow(0px 4px 0px black)", "transform": "scale(0.7)" })
svg.append("g").attr("transform", "translate(134.5,-5)").append("circle").attr("cx", 16).attr("cy", 20).attr("r", 5).style({ "margin": "10px", "position": "absolute", "transform": "rotate(0deg)" });

//draw spin circle
container.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 25).style({ "fill": "#5446BF", "cursor": "pointer", "filter": "drop-shadow(0px 4px 0px black)" });

container.append("path").attr("d", "M31.2245 29.9704C35.64 22.3158 34.9904 12.4285 27.8065 6.10435C21.5799 0.623753 12.5249 0.640023 6.56619 6.10435C0.452307 11.7101 0.503621 22.1944 6.56619 27.3446C10.4911 30.6788 16.6 31.0267 20.7264 27.3446C24.7276 23.7739 25.1031 17.1306 20.7264 13.1844C18.6726 11.3334 15.665 11.2783 13.6463 13.1844C11.6363 15.0831 11.8052 18.4911 13.6463 20.2645").attr("x", 0).attr("y", 4).attr("text-anchor", "middle").style({ "fill": "none", "stroke": "white", "stroke-width": "3", "stroke-lineclap": "round", "stroke-linejoin": "round", "transform": "translate(-13px, -13px) scale(.75)" });


// This function weightedRandom() is returning the array of max weightage nnumber.
function weightedRandom(spec) {
    var i, j, table = [];
    for (i in spec) {
        for (j = 0; j < spec[i] * 10; j++) {
            table.push(i);
        }
    }
    return function () {
        return table[Math.floor(Math.random() * table.length)];
    }
}

async function copyCode() {
    var copyText = document.querySelector("code > p");
    try {
        await navigator.clipboard.writeText(copyText.innerText);
        document.querySelector("code span").style.display = "inline-block";
        setTimeout(function () {
            document.querySelector("code span").style.display = "none";
        }, 1000);
        try {
            weNotification.trackEvent('In-app Template - Copy Clicked', JSON.stringify({ "Coupon Code": copyText.innerText }), false);
        } catch(err) {

        }
        console.log('Content copied to clipboard');
    } catch (err) {
        console.error('Content not Copied: ', err);
    }
}