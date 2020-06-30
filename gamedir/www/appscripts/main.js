require(
   // Use this library to "fix" some annoying things about Raphel paper and graphical elements:
    //     a) paper.put(relement) - to put an Element created by paper back on a paper after it has been removed
    //     b) call element.addEventListener(...) instead of element.node.addEventListner(...)
    ["../jslibs/raphael.lonce"],  // include a custom-built library

    function() {

        console.log("Yo, I am alive!");

  
    //OVERALL GAME VARIABLES
    var gameOver = false;
    var score = 0;

    function addScore(){
        s = document.getElementById("score");
        s.innerHTML = score + " amoebas eaten";
    };



    //SETUP CHUNK---------------------------------------------------------------------------------------
    ///Initialize data variables
    ////Create background

    var paper, pWidth, pHeight; //Canvas variables
    var amoeba; 
    var gameNPCs; //Cell variables


    function setUpButton(){
        
        var centerDiv = document.getElementById("centerDiv");
        paper = new Raphael(centerDiv);
   
        pWidth = paper.width;
        pHeight = paper.height;

        var bgRect = paper.rect(0,0,pWidth, pHeight);
        bgRect.attr({"fill" : "black"});

        var buttonX = pWidth/2 - 110;
        var buttonY = pHeight/2 - 100;

        var aRect = paper.rect(buttonX, buttonY, 220, 200, 10);
        aRect.attr({"fill" : "white", "stroke-width" : 0});

        var headerText = paper.text(buttonX + 110, buttonY + 30, 'Instructions');
        headerText.attr({"font-weight": "bold", "font-size": 16, "fill": "#4A4A4A", "font-family": "Myriad, Helvetica, sans-serif"});

        var instructionsText = paper.text(buttonX + 110, buttonY + 88, 'You are an amoeba. \n Eat the smaller ones and \n avoid being eaten by \nbigger ones.');
        instructionsText.attr({"font-size": 14, "fill": "#4A4A4A", "font-family": "Myriad, Helvetica, sans-serif"});

        var startBG = paper.rect(buttonX + 60, buttonY + 140, 100, 40, 10);
        startBG.attr({"fill" : "#26C281", "stroke-width" : 0});

        var startText = paper.text(buttonX + 110, buttonY + 160, 'Start');
        startText.attr({"font-size": 14, "fill": "white", "font-family": "Myriad, Helvetica, sans-serif"});

        var clickMeButton = paper.rect(buttonX + 60, buttonY + 140, 100, 40, 10);
        clickMeButton.attr({"fill" : "#26C281", "stroke-width" : 0, "fill-opacity" : 0});

        clickMeButton.addEventListener("click", function(){
            paper.remove();
            setup();
        });

    };



    var setupCanvas = function() {
        var centerDiv = document.getElementById("centerDiv");

        paper = new Raphael(centerDiv);

        // put the width and heigth of the canvas into variables for our own convenience
        pWidth = paper.width;
        pHeight = paper.height;

        var bgRect = paper.rect(0,0,pWidth, pHeight);
        bgRect.attr({"fill" : "black"});
    };

    // DOES NOT SET POS
    var createCell = function(size, color){
        var babyCell = paper.circle(0, 0, size);

        //setting the limits of xrate and yrate later on
        babyCell.speedLimit = 30/size;

        //giving it color
        babyCell.colorString = `hsl(${color/360}, 1, 0.5)`;
        babyCell.attr({"stroke-width" : 0,
                        "fill": babyCell.colorString});

        return babyCell;
    };

    // DOES NOT SET POS
    var createCellArray = function(number, size, color){
        var cellArray = []; 
        for (i=0; i < number; i++) {
            cellArray[i] = createCell(size, color);
        }
        return cellArray;
    };

    var setPosition = function(cell, x, y){

        cell.attr({'cx' : x, 'cy': y});
    };

    var amoebaAnimateID;

    // Create Amoeba! Give it movement, make it reactive
    var setupAmoeba = function(){
        amoeba = createCell(8,46);
        setPosition(amoeba, pWidth/2, pHeight/2);
        var amoebaSpeed = 1.7;

        amoeba.xrate = 0.3; 
        amoeba.yrate = 0.3;
        amoeba.xpos = pWidth/2;
        amoeba.ypos = pHeight/2;


        var moveAmoeba = function(){
            amoeba.xpos += amoeba.xrate;
            amoeba.ypos += amoeba.yrate;

            if (amoeba.xpos > pWidth) {amoeba.xrate =- amoeba.xrate}
            if (amoeba.ypos> pHeight) {amoeba.yrate =- amoeba.yrate}
            if (amoeba.xpos < 0) {amoeba.xrate =- amoeba.xrate}
            if (amoeba.ypos < 0) {amoeba.yrate =- amoeba.yrate};

            amoeba.attr({'cx' : amoeba.xpos, 'cy' : amoeba.ypos})
        };

        var animateAmoeba = function(){
            return setInterval(moveAmoeba, 20)
        };

        amoebaAnimateID = animateAmoeba();

        //Amoeba move by keystrokes

        function amoebaLeft(){
            amoeba.xrate = -amoebaSpeed;
            amoeba.yrate = amoeba.yrate/2;    
        };

        function amoebaRight(){
            amoeba.xrate = amoebaSpeed;
            amoeba.yrate = amoeba.yrate/2;    
        };

        function amoebaUp(){
            amoeba.yrate = -amoebaSpeed;
            amoeba.xrate = amoeba.xrate/2;
        };

        function amoebaDown(){
            amoeba.yrate = amoebaSpeed;
            amoeba.xrate = amoeba.xrate/2;
        };

        window.addEventListener("keydown", function(event){

            amoeba.attr({'cx': amoeba.xpos, 'cy': amoeba.ypos});
            if (event.keyCode == "37") {amoebaLeft();}
            if (event.keyCode == "39") {amoebaRight();}
            if (event.keyCode == "40") {amoebaDown();}
            if (event.keyCode == "38") {amoebaUp();}
            event.preventDefault();
            
        });
    };

    var otherCellsAnimateID;

    // Create all my other cells!
    var setupOtherCells = function(){
        var cellSpecies = [
            //slot new cell sizes here
            //Cell array is number of cells, size, and color
            createCellArray(12,5,99), //smallest
            createCellArray(6,10,25)  //bigger
        ];
        //combine all arrays into one array
        gameNPCs = [].concat(...cellSpecies);
        
        //give each 'other' cell in array a random starting position
        gameNPCs.forEach(function(cell){
            //console.log(cell);
            setPosition(cell, randInt(0, pWidth), randInt(0, pHeight));

        })

        var NPCSpeedRange = 1.5;

        //Seting up speed: Assigning unique and random speed to each cell, grabbing the xpos and ypos, we do this just once
        gameNPCs.forEach(function(cell) {
            cell.xrate = randInt(-NPCSpeedRange, NPCSpeedRange);
            if (cell.xrate == 0) {cell.xrate = NPCSpeedRange};
            cell.yrate = randInt(-NPCSpeedRange, NPCSpeedRange);
            if (cell.yrate == 0) {cell.yrate = NPCSpeedRange};
            cell.xpos = cell.attr('cx');
            cell.ypos = cell.attr('cy');
        });


        function handleMovementFor(cell){
            cell.xpos+=cell.xrate;
            cell.ypos+=cell.yrate;
            cell.attr({'cx' : cell.xpos, 'cy' : cell.ypos});

            //Bounce back from walls
            if (cell.xpos > pWidth) {cell.xrate = -cell.xrate}
            if (cell.ypos > pHeight) {cell.yrate = -cell.yrate}
            if (cell.xpos < 0) {cell.xrate = -cell.xrate}
            if (cell.ypos < 0) {cell.yrate = -cell.yrate} 
        };
        

        //==========================================================================

        //B. HANDLE THE COLLISIONS =================================================

        //Check if collision has occurred
        function handleCollisionFor(cell){
            var proximity = distance(cell.xpos, cell.ypos, amoeba.xpos, amoeba.ypos);
            var touching = cell.attr('r') + amoeba.attr('r') - 1;

            //if touch!
            if (proximity < touching){
                //if amoeba touches big one and gets eaten
                if (cell.attr('r') > amoeba.attr('r')){
                    endGame();
                } else {
                //amoeba ttouches small one, it eats
                    cell.remove();
                    //console.log(score);
                    score++;
                    addScore();

                }
            }
        };

        function gameStep() {
          gameNPCs.forEach(function(cell){
            handleMovementFor(cell);
            handleCollisionFor(cell);
          })
        };

        var animate = function(){
                //console.log("animating");
                return setInterval(gameStep, 20)
        };

        otherCellsAnimateID = animate();

    };

    ///Set up functions that I need later on

    //Random num gen
    var randInt = function( m, n ) {
        var range = n-m;
        var frand = Math.random()*range;
        return m+Math.floor(frand);
    }

    //Distance gen        
    var distance = function(x1, y1, x2, y2) {
        
        var a = x1 - x2;
        var b = y1 - y2;
        var c = Math.sqrt( a*a + b*b );
        return c
    };

    ///Set up listeners (for amoeba character)

    ///Set up timer---------------------------------------------------------------------------
    function setUpTimer(){
        var countdownId = document.getElementById("countdown");
        var timeLeft = 91;

        
        return setInterval(
                function() {
                    timeLeft--;
                    if (timeLeft < 1) {
                        countdownId.innerHTML = "Amoeba lifespan is over"
                        endGame();
                    } else {
                        //console.log(timeLeft,seconds);
                        countdownId.innerHTML = timeLeft + " seconds left."
                    }
            }
            ,1000);

    };


//---------------------------------------------------------------------------------------------------

    var lifespanTimerID;

    var setup = function(){
        setupCanvas();
        setupAmoeba();
        setupOtherCells();
        lifespanTimerID = setUpTimer();
    };



//END THE GAME=======================================================================


    //clear all cells
    function clearCells(){
        gameNPCs.forEach(function(cell){
            cell.remove();
            amoeba.remove();
        })
    };


    //game over message
    // function gameOverMessage(){
    //     alert("Your score is " + score +". Play again? :)")
    // };

    //update past scores
    function updateScores(){
        var pastScores = document.getElementById("pastScores");
        pastScores.innerHTML += score + "<br>";
    };

    //resets the score after each game
    function resetScore(){
        var s = document.getElementById("score");
        s.innerHTML = 0;
        //score = 0;
    };


    //creates show score and restart button
    function restartButton(){
        
        var centerDiv = document.getElementById("centerDiv");
        paper = new Raphael(centerDiv);
   
        pWidth = paper.width;
        pHeight = paper.height;

        var bgRect = paper.rect(0,0,pWidth, pHeight);
        bgRect.attr({"fill" : "black"});

        var buttonX = pWidth/2 - 110;
        var buttonY = pHeight/2 - 100;

        var aRect = paper.rect(buttonX, buttonY, 220, 200, 10);
        aRect.attr({"fill" : "white", "stroke-width" : 0});

        var headerText = paper.text(buttonX + 110, buttonY + 30, 'Game over!');
        headerText.attr({"font-weight": "bold", "font-size": 16, "fill": "#4A4A4A", "font-family": "Myriad, Helvetica, sans-serif"});

        var yourScoreText = paper.text(buttonX + 110, buttonY + 70, "Good try. \n\n Your score: ");
        yourScoreText.attr({"font-size": 14, "fill": "#4A4A4A", "font-family": "Myriad, Helvetica, sans-serif"});

        var yourScoreContinuedText = paper.text(buttonX + 110, buttonY + 110, score);
        yourScoreContinuedText.attr({"font-weight": "bold", "font-size": 44, "fill": "#26C281", "font-family": "Myriad, Helvetica, sans-serif"});

        var startBG = paper.rect(buttonX + 60, buttonY + 140, 100, 40, 10);
        startBG.attr({"fill" : "#2698E4", "stroke-width" : 0});

        var startText = paper.text(buttonX + 110, buttonY + 160, 'Play again');
        startText.attr({"font-size": 14, "fill": "white", "font-family": "Myriad, Helvetica, sans-serif"});

        var clickMeButton = paper.rect(buttonX + 60, buttonY + 140, 100, 40, 10);
        clickMeButton.attr({"fill" : "#26C281", "stroke-width" : 0, "fill-opacity" : 0});

        clickMeButton.addEventListener("click", function(){
            paper.remove();
            score = 0;
            setup();
        });

    };



    //get rid of cells, stop the timer
    function endGame(){
        gameOver = true;
        //console.log("Game over!")
        clearCells();
        clearInterval(lifespanTimerID);
        clearInterval(amoebaAnimateID);
        clearInterval(otherCellsAnimateID);
        //set up the restart button!
        //Update the score
        updateScores();
        resetScore();
        restartButton();
    };


    
    //IMPORTANT STUFF

    setUpButton();

});

