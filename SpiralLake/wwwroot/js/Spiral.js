var vertexShaderSource = [
    'precision mediump float;',
    'attribute vec2 vertPosition;',
    'attribute vec3 vertColor;',
    'uniform mat4 mWorld;',
    'uniform mat4 mProj;',
    'void main()',
    '{',
    '  gl_Position = mProj * mWorld * vec4(vertPosition, 0.0, 1.0);',
    '}'
].join("\n");

var fragmentShaderText = [
    'precision mediump float;',
    'void main() {',
    'gl_FragColor = vec4(0, 0, 0, 1.0);',
    '}'
].join("\n");

currentID = 0;

function isCircle() {
    if(document.getElementById("circle_ring_type").checked) {
        return true;
    } else {
        return false;
    }
}

var hypnoTextController = null;
var BORDER_WIDTH = 3;

function setupProgram(gl, program, shapeVertexes, indexArray, projectionMatrix) {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.STENCIL_BUFFER_BIT);
    
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.shaderSource(fragmentShader, fragmentShaderText);
    gl.compileShader(vertexShader);
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error("Vertex compilation error!", gl.getShaderInfoLog(vertexShader));
        return;
    }
    gl.compileShader(fragmentShader);
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error("Fragment compilation error!", gl.getShaderInfoLog(fragmentShader));
        return;
    }
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) { 
        console.error("Linking error!", gl.getProgramInfoLog(program));
    }
    
    gl.validateProgram(program);
    
    
    if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) { 
        console.error("Validation error!", gl.getProgramInfoLog(program));
    }
    
    
    
    
    var shapeVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, shapeVertexBufferObject);
    //The last bound buffer is used for the bufferData call; STATIC_DRAW indicates that the vertex data won't change
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shapeVertexes), gl.STATIC_DRAW);
    
    var boxIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW);
    
    var positionAttributeLocation = gl.getAttribLocation(program, 'vertPosition');
    gl.vertexAttribPointer(
        positionAttributeLocation,
        2, //number of elements per attribute
        gl.FLOAT, //type
        gl.FALSE, //normalization
        2 * Float32Array.BYTES_PER_ELEMENT, //size of vertex: two elements per vertex per size of float
        0 * Float32Array.BYTES_PER_ELEMENT //Offset
    );
    
    
    gl.enableVertexAttribArray(positionAttributeLocation);
    
    gl.useProgram(program);
    
    var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projectionMatrix);
}

var InitDemo = function() {
    var identityMatrix = new Float32Array(16);
    mat4.identity(identityMatrix);
    //Counter-clockwise, X, Y, R, G, B
    xOne = parseFloat(document.getElementById("xOne").value);
    yOne = 0;
    aOneOne = parseFloat(document.getElementById("aOneOne").value);
    aOneTwo = parseFloat(document.getElementById("aOneTwo").value);
    bOneOne = parseFloat(document.getElementById("bOneOne").value);
    bOneTwo = parseFloat(document.getElementById("bOneTwo").value);
    
    xTwo = parseFloat(document.getElementById("xTwo").value);
    yTwo = 0;
    aTwoOne = parseFloat(document.getElementById("aTwoOne").value);
    aTwoTwo = parseFloat(document.getElementById("aTwoTwo").value);
    bTwoOne = parseFloat(document.getElementById("bTwoOne").value);
    bTwoTwo = parseFloat(document.getElementById("bTwoTwo").value);
    inc = .001;
    shapeVertexesSingle = [];
    drawingIndex = 0;
    indexArraySingle = [];
    for (var t = 0; t <= 1; t += inc) {
        var xTOne = ((1 * xOne)) + t * ((3 * aOneOne)) + t * t * ((-6 * aOneOne) + (-3 * xOne) + (1 * xTwo) + (2 * xTwo) + (3 * aTwoOne)) + t * t * t * ((3 * aOneOne) + (2 * xOne) + (-1 * xTwo) + (-1 * xTwo) + (-3 * aTwoOne));
        var yTOne = ((1 * yOne)) + t * ((3 * bOneOne)) + t * t * ((-6 * bOneOne) + (-3 * yOne) + (1 * yTwo) + (2 * yTwo) + (3 * bTwoOne)) + t * t * t * ((3 * bOneOne) + (2 * yOne) + (-1 * yTwo) + (-1 * yTwo) + (-3 * bTwoOne));
        var xTTwo = ((1 * xOne)) + t * ((3 * aOneTwo)) + t * t * ((-6 * aOneTwo) + (-3 * xOne) + (1 * xTwo) + (2 * xTwo) + (3 * aTwoTwo)) + t * t * t * ((3 * aOneTwo) + (2 * xOne) + (-1 * xTwo) + (-1 * xTwo) + (-3 * aTwoTwo));
        var yTTwo = ((1 * yOne)) + t * ((3 * bOneTwo)) + t * t * ((-6 * bOneTwo) + (-3 * yOne) + (1 * yTwo) + (2 * yTwo) + (3 * bTwoTwo)) + t * t * t * ((3 * bOneTwo) + (2 * yOne) + (-1 * yTwo) + (-1 * yTwo) + (-3 * bTwoTwo));
        if(1 != t) {
            shapeVertexesSingle.push(xTOne);
            shapeVertexesSingle.push(yTOne);
        }
        if(0 != t) {
            shapeVertexesSingle.push(xTTwo);
            shapeVertexesSingle.push(yTTwo);
        }
        if(inc == t){
            indexArraySingle.push(0);
            indexArraySingle.push(2);
            indexArraySingle.push(1);
            drawingIndex = 1;
        }
        else if(1 == t) {
            indexArraySingle.push(drawingIndex);
            indexArraySingle.push(drawingIndex + 1);
            indexArraySingle.push(drawingIndex + 2);
        }
        else if(0 != t) {
            indexArraySingle.push(drawingIndex);
            indexArraySingle.push(drawingIndex + 1);
            indexArraySingle.push(drawingIndex + 3);
            indexArraySingle.push(drawingIndex);
            indexArraySingle.push(drawingIndex + 3);
            indexArraySingle.push(drawingIndex + 2);
            drawingIndex = drawingIndex + 2;
        }
        
    }
    currentID = currentID + 1;
    var thisID = currentID;
    
    /////////////
    ///////////// spiraltarget
    /////////////
    
    
    xTwo = 0;
    yTwo = 0;
    aTwoOne = parseFloat(document.getElementById("aTwoOne").value);
    aTwoTwo = parseFloat(document.getElementById("aTwoTwo").value);
    bTwoOne = parseFloat(document.getElementById("bTwoOne").value);
    bTwoTwo = parseFloat(document.getElementById("bTwoTwo").value);
    
    //Counter-clockwise, X, Y, R, G, B
    xOne = parseFloat(document.getElementById("xOne").value) - parseFloat(document.getElementById("xTwo").value);
    yOne = 0;
    aOneOne = parseFloat(document.getElementById("aOneOne").value);
    aOneTwo = parseFloat(document.getElementById("aOneTwo").value);
    bOneOne = parseFloat(document.getElementById("bOneOne").value);
    bOneTwo = parseFloat(document.getElementById("bOneTwo").value);
    
    inc = .05;
    shapeVertexes = [];
    drawingIndex = 0;
    indexArray = [];
    for (var t = 0; t <= 1; t += inc) {
        var xTOne = ((1 * xOne)) + t * ((3 * aOneOne)) + t * t * ((-6 * aOneOne) + (-3 * xOne) + (1 * xTwo) + (2 * xTwo) + (3 * aTwoOne)) + t * t * t * ((3 * aOneOne) + (2 * xOne) + (-1 * xTwo) + (-1 * xTwo) + (-3 * aTwoOne));
        var yTOne = ((1 * yOne)) + t * ((3 * bOneOne)) + t * t * ((-6 * bOneOne) + (-3 * yOne) + (1 * yTwo) + (2 * yTwo) + (3 * bTwoOne)) + t * t * t * ((3 * bOneOne) + (2 * yOne) + (-1 * yTwo) + (-1 * yTwo) + (-3 * bTwoOne));
        var xTTwo = ((1 * xOne)) + t * ((3 * aOneTwo)) + t * t * ((-6 * aOneTwo) + (-3 * xOne) + (1 * xTwo) + (2 * xTwo) + (3 * aTwoTwo)) + t * t * t * ((3 * aOneTwo) + (2 * xOne) + (-1 * xTwo) + (-1 * xTwo) + (-3 * aTwoTwo));
        var yTTwo = ((1 * yOne)) + t * ((3 * bOneTwo)) + t * t * ((-6 * bOneTwo) + (-3 * yOne) + (1 * yTwo) + (2 * yTwo) + (3 * bTwoTwo)) + t * t * t * ((3 * bOneTwo) + (2 * yOne) + (-1 * yTwo) + (-1 * yTwo) + (-3 * bTwoTwo));
        if(1 != t) {
            shapeVertexes.push(xTOne);
            shapeVertexes.push(yTOne);
        }
        if(0 != t) {
            shapeVertexes.push(xTTwo);
            shapeVertexes.push(yTTwo);
        }
        if(inc == t){
            indexArray.push(0);
            indexArray.push(2);
            indexArray.push(1);
            drawingIndex = 1;
        }
        else if(1 == t) {
            indexArray.push(drawingIndex);
            indexArray.push(drawingIndex + 1);
            indexArray.push(drawingIndex + 2);
        }
        else if(0 != t) {
            indexArray.push(drawingIndex);
            indexArray.push(drawingIndex + 1);
            indexArray.push(drawingIndex + 3);
            indexArray.push(drawingIndex);
            indexArray.push(drawingIndex + 3);
            indexArray.push(drawingIndex + 2);
            drawingIndex = drawingIndex + 2;
        }
        
    }
    boxVertexStart = shapeVertexes.length / 2;
    shapeVertexes.push(-1);
    shapeVertexes.push(1);
    shapeVertexes.push(-1);
    shapeVertexes.push(-1);
    shapeVertexes.push(1);
    shapeVertexes.push(-1);
    shapeVertexes.push(1);
    shapeVertexes.push(1);
    boxIndexStart = indexArray.length;
    
    indexArray.push(boxVertexStart);
    indexArray.push(boxVertexStart + 1);
    indexArray.push(boxVertexStart + 2);
    indexArray.push(boxVertexStart);
    indexArray.push(boxVertexStart + 2);
    indexArray.push(boxVertexStart + 3);
    
    circleVertexStart = shapeVertexes.length / 2;
    circleIndexStart = indexArray.length;
    shapeVertexes.push(0);
    shapeVertexes.push(0);
    outside_circle_vertecies = 50;
    var canvas = document.getElementById("spiraltarget1");
    for(var vertex_index = 0; vertex_index < outside_circle_vertecies; vertex_index++) {
        var angle = Math.PI * vertex_index / (outside_circle_vertecies - 1);
        var x = Math.cos(angle) * 2 * (Math.sqrt(canvas.clientWidth * canvas.clientWidth / 4 + canvas.clientHeight * canvas.clientHeight)) / canvas.clientWidth;
        var y = Math.sin(angle) * 2 * (Math.sqrt(canvas.clientWidth * canvas.clientWidth / 4 + canvas.clientHeight * canvas.clientHeight)) / canvas.clientHeight;
        shapeVertexes.push(x);
        shapeVertexes.push(y);
        if(0 != vertex_index) {
            indexArray.push(circleVertexStart);
            indexArray.push(circleVertexStart + vertex_index);
            indexArray.push(circleVertexStart + vertex_index + 1);
        }
    }
    
    var canvas1 = document.getElementById("spiraltarget1");
    var canvas2 = document.getElementById("spiraltarget2");
    var gl1 = canvas1.getContext("webgl", {stencil:true});
    var gl2 = canvas2.getContext("webgl", {stencil:true});
    if(!gl1) {
        var gl1 = canvas1.getContext("experimental-webgl");
        var gl2 = canvas2.getContext("experimental-webgl");
    }
    var devicePixelRatio = window.devicePixelRatio || 2;

    canvas1.width  = canvas1.clientWidth  * devicePixelRatio;
    canvas1.height = canvas1.clientHeight * devicePixelRatio;
    canvas2.width  = canvas2.clientWidth  * devicePixelRatio;
    canvas2.height = canvas2.clientHeight * devicePixelRatio;
    gl1.viewport(0, 0, gl1.canvas.width, gl1.canvas.height);
    gl2.viewport(0, 0, gl2.canvas.width, gl2.canvas.height);
    var program1 = gl1.createProgram();
    var program2 = gl2.createProgram();
    setupProgram(gl1, program1, shapeVertexes, indexArray, identityMatrix);
    var flipMatrix = new Float32Array(16);
    mat4.scale(flipMatrix, identityMatrix, [1, -1, 1]);
    setupProgram(gl2, program2, shapeVertexes, indexArray, flipMatrix);
    
    var matWorldUniformLocation1 = gl1.getUniformLocation(program1, 'mWorld');
    var matWorldUniformLocation2 = gl2.getUniformLocation(program2, 'mWorld');

	var worldMatrix = new Float32Array(16);
	mat4.identity(worldMatrix);
    
    num_curves = document.getElementById("num_curves").value;
    seconds_per_rotation = document.getElementById("seconds_per_rotation").value;
    num_rings = document.getElementById("num_rings").value;
    ring_shrink_seconds = document.getElementById("ring_shrink_seconds").value;
    var angle = 0;
	var rotateMatrix = new Float32Array(16);
	var translateMatrix = new Float32Array(16);
	var scaleMatrix = new Float32Array(16);
    var skip = 0;
    gl1.enable(gl1.STENCIL_TEST);
    gl2.enable(gl2.STENCIL_TEST);
    var horizontal_displacement = document.getElementById("horizontal_displacement").value;
    middle_corner_offset = 1;
    corner_1_angle = -1 * (Math.atan(2 / (1 - horizontal_displacement)) + Math.PI);
    corner_2_angle = -2 * Math.PI + (Math.atan(2 / (middle_corner_offset + horizontal_displacement)));
    num_frames = 0;
    branch_scale = 1;
    is_circle = isCircle();
    max_circle_horizontal_coord = 2 * (Math.sqrt(canvas.width * canvas.width / 4 + canvas.height * canvas.height)) / canvas.width;
    var loop = function () {
        if(thisID == currentID) {
            gl1.colorMask(false, false, false, false);
            gl1.stencilFunc(gl1.NOTEQUAL, 1, 0xFF);
            gl1.stencilOp(gl1.ZERO, gl1.REPLACE, gl1.REPLACE);
            gl1.stencilMask(0xFF);
            gl1.clear(gl1.STENCIL_BUFFER_BIT);
            gl2.colorMask(false, false, false, false);
            gl2.stencilFunc(gl2.NOTEQUAL, 1, 0xFF);
            gl2.stencilOp(gl2.ZERO, gl2.REPLACE, gl2.REPLACE);
            gl2.stencilMask(0xFF);
            gl2.clear(gl2.STENCIL_BUFFER_BIT);
            //num_frames = num_frames + 1;
            for(var i = 0; i < num_curves; i++) {
                angle = (-Math.PI * 2 * i / num_curves - performance.now() / 1000 / seconds_per_rotation * 2 * Math.PI) % (2 * Math.PI);
                if(angle > -1 * Math.PI / 4){
                    scale_to =  (1 + horizontal_displacement);
                    branch_scale = scale_to / xOne;
                }
                else if(angle > -1 * Math.PI / 2) {
                    branch_scale = (middle_corner_offset + horizontal_displacement) / xOne;
                }
                else if (angle > -1 * Math.PI) {
                    branch_scale = (1 - horizontal_displacement) / xOne;
                }
                else if (angle > corner_1_angle) {
                    rectified_angle = -1 * (angle  + Math.PI);
                    angle_cosine = Math.cos(rectified_angle);
                    scale_to =  (1 - horizontal_displacement) / angle_cosine;
                    branch_scale = scale_to / xOne;
                }
                else if (angle > corner_2_angle) {
                    rectified_angle = -1 * (angle  + Math.PI);
                    angle_sine = Math.sin(rectified_angle);
                    scale_to =  2 / angle_sine;
                    branch_scale = scale_to / xOne;
                }
                else if (angle < corner_2_angle) {
                    rectified_angle = angle + 2 * Math.PI;
                    angle_cos = Math.cos(rectified_angle);
                    scale_to =  (1 + horizontal_displacement) / angle_cos;
                    branch_scale = scale_to / xOne;
                }
                else{
                    scale_to =  (1 + horizontal_displacement);
                    branch_scale = scale_to / xOne;
                }
                mat4.fromRotationTranslationScale(worldMatrix, [Math.cos(angle / 2), Math.sin(angle / 2), 0, 0], [-1 * horizontal_displacement, -1, 0], [branch_scale, branch_scale, 1]);
                worldMatrix = rotateMatrix;
                gl1.uniformMatrix4fv(matWorldUniformLocation1, gl1.FALSE, worldMatrix);
                gl2.uniformMatrix4fv(matWorldUniformLocation2, gl2.FALSE, worldMatrix);
                gl1.drawElements(gl1.TRIANGLES, boxIndexStart, gl1.UNSIGNED_SHORT, 0);
                gl2.drawElements(gl2.TRIANGLES, boxIndexStart, gl2.UNSIGNED_SHORT, 0);
                mat4.fromRotationTranslationScale(worldMatrix, [Math.cos(-angle / 2), Math.sin(-angle / 2), 0, 0], [horizontal_displacement, -1, 0], [-1 * branch_scale, branch_scale, 1]);
                worldMatrix = rotateMatrix;
                gl1.uniformMatrix4fv(matWorldUniformLocation1, gl1.FALSE, worldMatrix);
                gl2.uniformMatrix4fv(matWorldUniformLocation2, gl2.FALSE, worldMatrix);
                gl1.drawElements(gl1.TRIANGLES, boxIndexStart, gl1.UNSIGNED_SHORT, 0);
                gl2.drawElements(gl2.TRIANGLES, boxIndexStart, gl2.UNSIGNED_SHORT, 0);
            }
            ring_calculation_time = performance.now()
            ring_offset = (ring_shrink_seconds - (ring_calculation_time / 1000) % ring_shrink_seconds) / ring_shrink_seconds / num_rings
            mat4.translate(translateMatrix, identityMatrix, [0, -1, 0]);
            for(var i = 0; i < num_rings; i++) {
                vertical_ring_scale = i / num_rings + ring_offset;
                if(is_circle) {
                    horizontal_ring_scale = vertical_ring_scale;
                } else {
                    horizontal_ring_scale = 1 / max_circle_horizontal_coord * (1 - vertical_ring_scale) + vertical_ring_scale;
                }
                mat4.scale(worldMatrix, translateMatrix, [horizontal_ring_scale, vertical_ring_scale, 1]);
                gl1.uniformMatrix4fv(matWorldUniformLocation1, gl1.FALSE, worldMatrix);
                gl2.uniformMatrix4fv(matWorldUniformLocation2, gl2.FALSE, worldMatrix);
                gl1.drawElements(gl1.TRIANGLES, (outside_circle_vertecies - 1) * 3, gl1.UNSIGNED_SHORT, circleIndexStart * 2);
                gl2.drawElements(gl2.TRIANGLES, (outside_circle_vertecies - 1) * 3, gl2.UNSIGNED_SHORT, circleIndexStart * 2);
            }
            gl1.uniformMatrix4fv(matWorldUniformLocation1, gl1.FALSE, identityMatrix);
            gl2.uniformMatrix4fv(matWorldUniformLocation2, gl2.FALSE, identityMatrix);
            if(num_rings > 0 && (ring_calculation_time / 1000) % (2 * ring_shrink_seconds) >= ring_shrink_seconds) {
                gl1.drawElements(gl1.TRIANGLES, 6, gl1.UNSIGNED_SHORT, boxIndexStart * 2);
                gl2.drawElements(gl2.TRIANGLES, 6, gl2.UNSIGNED_SHORT, boxIndexStart * 2);
            }
            gl1.colorMask(true, true, true, true);
            gl1.clear(gl1.COLOR_BUFFER_BIT);
            gl2.colorMask(true, true, true, true);
            gl2.clear(gl2.COLOR_BUFFER_BIT);
            gl1.drawElements(gl1.TRIANGLES, 6, gl1.UNSIGNED_SHORT, boxIndexStart * 2);
            gl2.drawElements(gl2.TRIANGLES, 6, gl2.UNSIGNED_SHORT, boxIndexStart * 2);
            requestAnimationFrame(loop);
        }
    };
    requestAnimationFrame(loop);
    //framerate_loop = setInterval(function(){console.log(num_frames); num_frames = 0;}, 1000);
}

class TextController {
    constructor() {
        this.lineList = document.getElementById("txtPrompt").value.split("\n");
        this.linePointer = 0;
        this.newLinePause = true;
        this.NEW_CHAR_WAIT = 100;
        this.NEW_LINE_WAIT = 4000;
        this.SLIDE_TEXT_WAIT = 100;
    }
    showText() {
        var charElementList = document.getElementsByClassName("hiddenText");
        if(0 < charElementList.length) {
            charElementList[0].classList.add("revealed");
            charElementList[0].classList.remove("hiddenText");
            setTimeout(this.showText.bind(this), this.NEW_CHAR_WAIT);
        }
        else if(this.newLinePause) {
            this.newLinePause = false;
            setTimeout(this.showText.bind(this), this.NEW_LINE_WAIT);
        }
        else if(this.linePointer < this.lineList.length) {
            this.newLinePause = true;
            var line = this.lineList[this.linePointer].trim();
            while(""==line && this.linePointer < (this.lineList.length - 1)) {
                this.linePointer = this.linePointer + 1;
                line = this.lineList[this.linePointer].trim();
            }
            if(""!=line) {
                var wordList = line.split(" ");
                var wordElemTextList = [];
                for(var wordIndex = 0; wordIndex < wordList.length; wordIndex++) {
                    var charElemTextList = [];
                    var word = wordList[wordIndex];
                    for(var charIndex = 0; charIndex < word.length; charIndex++) {
                        charElemTextList.push("<span class=\"hiddenText\">" + word[charIndex] + "</span>");
                    }
                    wordElemTextList.push("<span class=\"word\">" + charElemTextList.join("") + "</span>");
                }
                $(".textCenterer").html(wordElemTextList.join(" "));
                setTextPositioning();
                this.linePointer = this.linePointer + 1;
                setAndAnimateTextBoxPositioning();
                setTimeout(this.slideText.bind(this), this.SLIDE_TEXT_WAIT);
                
            } else {
                this.closeBox();
            }
        } else {
            this.closeBox();
        }
    }
    slideText() {
        var slideDuration = document.getElementsByClassName("hiddenText").length * this.NEW_CHAR_WAIT;
        $(".textCenterer").animate(
            {"left": ($("#spiraltarget1").width() - $(".textCenterer").width()) / 2 + "px"},
                {duration: slideDuration});
        this.showText();
    }
    closeBox() {
        $(".textblock").animate({"height":"0px"},
            {
                "duration":500,
                "step": function () {
                    $(".textblock").css({
                    "top" : ($(".canvasContainer").height() - $(".textblock").height()) / 2 + "px",
                    "left" : ($("#spiraltarget1").width() - $(".textblock").width()) / 2 + "px"
                    });
                },
                "complete": function() {
                    $(this).hide();
                    $(this).css({"height":" 50px", "width": "0px"});
                }
            }
        );
        $(".textCenterer").html("");
        hypnoTextController = null;
    }
}

function setAndAnimateTextBoxPositioning() {
    $(".textblock").show();
    $(".textblock").animate({"width":($(".textCenterer").width() + 30) + "px"},
        {
            "duration":1000,
            "step": function () {
                $(".textblock").css({
                "left" : (($("#spiraltarget1").width() - $(".textblock").width()) / 2 - BORDER_WIDTH) + "px"
                });
            },
        }
    );
}

function setTextPositioning() {
    $(".textblock").css({
        "top" : (($(".canvasContainer").height() - $(".textblock").height()) / 2 - BORDER_WIDTH) + "px",
        "left" : ($("#spiraltarget1").width() - $(".textblock").width()) / 2 + "px"
    });
    $(".textCenterer").css(
        {
            "top": ($(".canvasContainer").height() - $(".textCenterer").height()) / 2 + "px",
            "left" : ($("#spiraltarget1").width() - ($(".textCenterer").children().children().first().width())) / 2 + "px"
        }
    );
}

state = "";

function fullscreen() {
    $("#controls").hide();
    $("header").hide();
    $("footer").hide();
    $("main").removeClass("pb-3");
    $(".canvasContainer").css({"height": "100vh", "width": "initial"});
    $("#spiraltarget1").css({"height": "50%", "width": "100%"});
    $("#spiraltarget2").css({ "height": "50%", "width": "100%" });
    $("body").css("margin-bottom", "0px");
    
    if(null == hypnoTextController)
    {
        hypnoTextController = new TextController();
        setTimeout(hypnoTextController.showText.bind(hypnoTextController), 100); 
    }
    setResizeText();
    InitDemo();
    state = "fullscreen";
    $("#sizeControl").addClass("reduce");
}

function reduce() {
    $("#spiraltarget1").css({"height": "200px", "width": "800px"});
    $("#spiraltarget2").css({"height": "200px", "width": "800px"});
    $(".canvasContainer").css({ "width": "800px", "height": "400px" });
    $("header").show();
    $("footer").show();
    $("main").addClass("pb-3");
    $("body").css("margin-bottom", "60px");
    $("#controls").show();
    $("#textCenterer").stop();
    $("#textCenterer .word span.hidden").removeClass("hidden").addClass("revealed");
    InitDemo();
    state = "reduced";
    $("#sizeControl").removeClass("reduce");
    setResizeText();
    
}

function setResizeText() {
    $(".textblock").css({
        "top": (($(".canvasContainer").height() - $(".textblock").height()) / 2 - BORDER_WIDTH) + "px",
        "left": ($("#spiraltarget1").width() - $(".textblock").width()) / 2 + "px"
    });
    $(".textCenterer").stop();
    $(".textCenterer").css(
        {
            "top": ($(".canvasContainer").height() - $(".textCenterer").height()) / 2 + "px",
            "left": ($("#spiraltarget1").width() - $(".textCenterer").width()) / 2 + "px"
        }
    );
}

$("#sizeControl").click(function(){
    if("fullscreen" == state) {
        reduce();
    } else {
        fullscreen();
    }
});

function StartPage() {
    $(".canvasContainer").css("height", "400px");
    InitDemo();
    if(null == hypnoTextController)
    {
        hypnoTextController = new TextController();
        setTimeout(hypnoTextController.showText.bind(hypnoTextController), 100);
        setTextPositioning();
    }
    else {
        setResizeText();
    }
    state = "reduced";
}
function showSizeControl() {
    if("" != state) {
        if(!sizeControlVisible) {
            $("#sizeControl").slideDown({queue: false, done: function() {if(sizeControlVisible){$("#sizeControl").prop("style", "display: block;");}}});
            sizeControlVisible = true;
        }
        clearTimeout(slideDownTimer);
        slideDownTimer = setTimeout(function(){if(sizeControlVisible) {$("#sizeControl").slideUp({queue: false, done: function() {if(!sizeControlVisible){$("#sizeControl").prop("style", "display: none;");}}}); sizeControlVisible = false;}}, 2000);
    }
}

$(document).keydown(function(e) {
    if("Escape" == e.originalEvent.code) {
        reduce();
    }
});

$(window).resize(function() {
    if("fullscreen" == state) {
        InitDemo();
        setTextPositioning();
    }
});

slideDownTimer = 0;
sizeControlVisible = false;

$(document).ready(function () {

    $("#btnFullScreen").click(function(e) {
        fullscreen();
    });
    
    
    $(".canvasContainer").mousemove(function() {
        showSizeControl();
    });
    
    $(".canvasContainer").dblclick(function() {
        showSizeControl();
    });
    
    $(".canvasContainer").mouseleave(function() {
        clearTimeout(slideDownTimer);
        if(sizeControlVisible) {
            $("#sizeControl").slideUp({queue: false, done: function() {
                if(!sizeControlVisible){
                    $("#sizeControl").prop("style", "display: none;");
                    }
                }});
            sizeControlVisible = false;
        }
    });

    $("#sizeControl").click(function () {
        if ("fullscreen" == state) {
            reduce();
        } else {
            fullscreen();
        }
    }); 
});