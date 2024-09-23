'use strict'

// sorry, everything here is super messy! i promise I'll tidy it up eventually :)
// - matt @malsf21

let g1options = {
    target: '#graph-1',
    title: "set up",
    xAxis: {
        label: 'x - axis',
        domain: [-6, 6]
    },
    yAxis: {
        label: 'y - axis',
        domain: [-18, 36]
    },
    data: [
        {
            fn: 'x^2+x',
            derivative: {
                fn: '2 * x + 1',
                x0: 2
            },
            attr: {"stroke-width": 3}
        }
    ]
}

let started = false;
let currentPos = 0;
let iterator = 1;
let autoRunning = false;

let inputFunc;
let compiledFunc;
let derivative;

const badJSONDeepCopy = obj => {
    return JSON.parse(JSON.stringify(obj))
}

const redrawPlot = (options, fn, deriv, evalAt, iter, pointsDiff = undefined) => {
    // console.log("redraw")

    // strange quirk to force a title rerender
    delete options.title;
    functionPlot(options);

    options.title = "iteration " + iter;
    // console.log(options.title)
    options.data[0].fn = fn;
    options.data[0].derivative = {
        fn: deriv,
        x0: evalAt
    }
    if (pointsDiff !== undefined) {
        if (options.data.length === 1) {
            options.data.push(
                {
                    points: [pointsDiff],
                    fnType: 'points',
                    graphType: 'scatter'
                }
            );
        } else {
            options.data[1].points.push(pointsDiff);
        }
    }

    functionPlot(options);
}

let last_change = 0;

const updatePos = (current, deriv, learning, momentum) => {
    if (momentum === undefined) {
        momentum = 0.0;
    }
    console.log("momentum", momentum)
    console.log("learning", learning)
    console.log("current", current)
    console.log("deriv", deriv)
    console.log("last_change", last_change)

    let new_change = deriv.evaluate({x: current}) * learning + momentum * last_change;
    let solution = current - new_change;
    last_change = new_change;

    return solution;
}

document.getElementById("auto-button").addEventListener("click", () => {
    // console.log("auto")
    if (!started) {
        return;
    }
    autoRunning = !autoRunning;
    if (autoRunning) {
        document.getElementById("auto-button-span").innerHTML = "Stop";
        if (document.getElementById("auto-button-icon").classList.contains('fa-play')) {
            document.getElementById("auto-button-icon").classList.remove('fa-play');
            document.getElementById("auto-button-icon").classList.add('fa-pause');
        }
    } else {
        document.getElementById("auto-button-span").innerHTML = "Start";
        if (document.getElementById("auto-button-icon").classList.contains('fa-pause')) {
            document.getElementById("auto-button-icon").classList.remove('fa-pause');
            document.getElementById("auto-button-icon").classList.add('fa-play');
        }
    }
    let learningRate = document.getElementById("learning-rate").value;
    let momentum = document.getElementById("momentum").value;
    if (isNaN(learningRate)) {
        return;
    }

    let autoUpdate = () => {
        if (!autoRunning) {
            return;
        }
        iterator++;
        currentPos = updatePos(currentPos, derivative, learningRate, momentum);

        document.getElementById("current-pos").innerHTML = currentPos;
        document.getElementById("current-change").innerHTML = last_change;
        redrawPlot(g1options, inputFunc, derivative.toString(), currentPos, iterator, [currentPos, compiledFunc.evaluate({x: currentPos})]);
        setTimeout(autoUpdate, 1000);
    }

    autoUpdate();
});

document.getElementById("start-button").addEventListener("click", () => {
    // console.log("start")
    let inputEval = document.getElementById("initial-start").value;
    let evalAt = Number(inputEval);
    if (isNaN(evalAt)) {
        return;
    }

    iterator = 0;
    if (g1options.data.length >= 2) {
        g1options.data = [g1options.data[0]];
    }

    autoRunning = false;
    started = true;
    last_change = 0;

    currentPos = evalAt;
    document.getElementById("current-pos").innerHTML = evalAt;
    document.getElementById("last-change-wrapper").classList.remove('is-hidden');
    document.getElementById("current-change").innerHTML = last_change;

    document.getElementById("auto-button-span").innerHTML = "Start";
    if (document.getElementById("auto-button-icon").classList.contains('fa-pause')) {
        document.getElementById("auto-button-icon").classList.remove('fa-pause');
        document.getElementById("auto-button-icon").classList.add('fa-play');
    }

    inputFunc = document.getElementById("function-input").value;
    compiledFunc = math.compile(inputFunc);

    derivative = math.derivative(inputFunc, 'x');
    redrawPlot(g1options, inputFunc, derivative.toString(), currentPos, iterator, [currentPos, compiledFunc.evaluate({x: currentPos})]);
});

document.getElementById("update-button").addEventListener("click", () => {
    console.log("update")
    if (!started) {
        return;
    }
    let learningRate = document.getElementById("learning-rate").value;
    let momentum = document.getElementById("momentum").value;
    if (isNaN(learningRate)) {
        return;
    }

    autoRunning = false;
    iterator++;
    currentPos = updatePos(currentPos, derivative, learningRate, momentum);

    document.getElementById("current-pos").innerHTML = currentPos;
    document.getElementById("current-change").innerHTML = last_change;
    redrawPlot(g1options, inputFunc, derivative.toString(), currentPos, iterator, [currentPos, compiledFunc.evaluate({x: currentPos})]);
});


let setFnInputVal = (val, start = 4) => {
    document.getElementById("function-input").value = val;
    document.getElementById("initial-start").value = start;
}

document.getElementById("fn-x-2").addEventListener("click", () => setFnInputVal("x^2"));
document.getElementById("fn-sin-x").addEventListener("click", () => setFnInputVal("sin(x)", 2));
document.getElementById("fn-sin-wild").addEventListener("click", () => setFnInputVal("sin(5x) + (x^3) / 2", 2));
document.getElementById("fn-1-x").addEventListener("click", () => setFnInputVal("1/x", 0.5));
document.getElementById("fn-poly-x").addEventListener("click", () => setFnInputVal("x + 2 * (x^2) + (0.4) * x^3", 2));

functionPlot(g1options);

// demo (opening slide)

let demoIter = 0;
let demoFunc = 'x^2';
let demoCompiled = math.compile(demoFunc);
let demoDeriv = math.derivative(demoFunc, 'x');
const demoDefault = 0;
let demoPos = demoDefault;
const demoRate = 0.25;

const randomStart = () => {
    return Math.random() * 64 - 32;
}

let demoOptions = {
    target: '#demo-graph',
    title: "set up your gradient descent!",
    xAxis: {
        label: 'x - axis',
        domain: [-10, 10]
    },
    yAxis: {
        label: 'y - axis',
        domain: [-50, 100]
    },
    data: [
        {
            fn: 'x^2',
            derivative: {
                fn: '2 * x',
                x0: demoDefault
            },
            attr: {"stroke-width": 3}
        }
    ]
}

const advanceDemo = () => {

    let newStart = randomStart();
    demoOptions.data = [
        {
            fn: 'x^2',
            derivative: {
                fn: '2 * x',
                x0: newStart
            },
            attr: {"stroke-width": 3}
        }
    ]
    demoIter = 0;
    demoPos = newStart;
    demoDeriv = math.derivative(demoFunc, 'x');
    //demoPos = updatePos(demoPos, demoDeriv, demoRate, 0.0);
    //document.getElementById("demo-current").innerHTML = demoPos.toFixed(2);

    redrawPlot(demoOptions, demoFunc, demoDeriv.toString(), demoPos, demoIter, [demoPos, demoCompiled.evaluate({x: demoPos})]);
};

//setInterval(() => advanceDemo(), 500);
advanceDemo();


// generic error graph

// let genErrorPoints = [];

// for (let i = 1; i < 20; i += 0.3){
//     genErrorPoints.push(
//         [
//             i + Math.random()*0.1,
//             11*i/8 - 0.5* Math.random()
//         ],
//         [
//             i + Math.random()*0.1,
//             11*i/8 + Math.random()
//         ],
//         [
//             i + Math.random()*0.1,
//             11*i/8 + 0.5 * Math.random()
//         ]
//     )

// }

// let errorGraphOptions = {
//     target: '#generic-error-graph',
//     title: "Which Line Is Better?",
//     xAxis: {
//         label: 'x - axis',
//         domain: [0, 10]
//     },
//     yAxis: {
//         label: 'y - axis',
//         domain: [0, 20]
//     },
//     data: [
//         {
//             points: genErrorPoints,
//             fnType: 'points',
//             graphType: 'scatter'
//         },
//         {
//             fn: '3x/2'
//         },
//         {
//             fn: '5x/4 + 1'
//         },
//         {
//             fn: '23x/16 + sin(x)'
//         }
//     ]
// }

// functionPlot(errorGraphOptions);