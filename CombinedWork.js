
    (function SnakeGame() {
        //GLOBAL VARIABLES
        const defaultSpeed = 2;
        const speedOnKeyPressed = 12;
        let speed = defaultSpeed;
        let htmlPage = document.querySelector('html');
        let bodyWidth = htmlPage.scrollWidth;
        let bodyHeight = htmlPage.scrollHeight;
        const directions = {
            39: {
                item: 'left',
                sign: 1
            }, //right
            37: {
                item: 'left',
                sign: -1
            }, //left
            40: {
                item: 'top',
                sign: 1
            }, //top
            38: {
                item: 'top',
                sign: -1
            }, //bottom
        }
        let direction = directions['39'];
        
        let snake = [];


        function init() {

            window.virtualDom = new Dom();
            foodVisualization()
            createDiv();
            moveSnake();
            createUserElements();
            createUserInstructions();
            createGameInfo();
        };



        class Dom {

            constructor() {
                this.elementsSortedByDepth = [];
                this.elementsSortedByNum = [];
                this.currentLevelElements = [];

                //fills the arrays elementsSortedByDepth and elementsSortedByNum
                //and sets a property onto Dom for each type of tagName on the page
                this._getPageElements(document.body, 0);
                this._sortByNumElements();
                this.nextLevel(this.getElementsWithMostDepth());  //the array of HTML elements to put into the next level

                return this;
            }

            /**
             * Internal method
             * 
             * Cycles through every element on the page when the game is initialized.
             * 
             * @param {HTMLObjectElement} element 
             * @param {Number} depth 
             */
            _getPageElements(element, depth) { //called for every element

                element.style.pointerEvents = 'none';   //set every elements pointer events to none
                this._sortByDepth(element, depth);

                if (element.clientHeight > 0 && element.clientWidth > 0) { //check if element has width or height

                    let elementTag = element.tagName.toLowerCase(); //element tagName

                    if (this[elementTag])         //if this property exists
                        this[elementTag].push(element); //push element into it
                    else
                        this[elementTag] = [element]; //create array and store elements inside 

                    for (var i = 0; i < element.children.length; i++) {  //recursive call for each element
                        element.depth = depth;
                        this._getPageElements(element.children[i], depth + 1);
                    }
                }

                return this;
            }


            /**
             * Internal method
             * 
             * @param {HTMLObjectElement} element 
             * @param {Number} depth 
             */
            _sortByDepth(element, depth) {
                if (this.elementsSortedByDepth[depth])
                    this.elementsSortedByDepth[depth].push(element);
                else
                    this.elementsSortedByDepth[depth] = [element];

                return this;
            }



            /**
             * Internal method
             * 
             * 
             */
            _sortByNumElements() {

                Object.keys(this).forEach(function (key) {
                    if (key != "elementsSortedByNum")
                        this.elementsSortedByNum.push({ numOfElements: this[key].length, tagName: key });
                }.bind(this));

                this.elementsSortedByNum.sort(function (a, b) { return a.numOfElements - b.numOfElements });
                return this;
            }

            /**
             * Sets CurrentLevelElements with the given elements
             * 
             * @param {Array<HTMLElement>} elements 
             */
            _setCurrentLevelElements(elements) {
                let _this = this;
                this.currentLevelElements = [];

                elements.forEach(function (elem) {
                    let coords = Dom.utilities.getAbsolutePageCoordinates(elem);
                    _this.currentLevelElements.push(
                        {
                            element: elem,
                            x: coords.left,
                            y: coords.top,
                            rightX: coords.width + coords.left,
                            bottomY: coords.height + coords.top,
                            width: coords.width,
                            height: coords.height
                        });
                })
            }


            /**
             * 
             * @param {Array<Object>} array Array of objects
             */
            _setPointerEvents(array) {
                array.forEach(function (object) {
                    object.element.style.pointerEvents = 'auto';
                })
            }


            /**
             * 
             * @param {Array<HTMLElement>} elements 
             */
            nextLevel(elements) {
                this._setCurrentLevelElements(elements);
                this._setPointerEvents(this.currentLevelElements);
            }


            /**
             * 
             * @param {String} name 
             * @returns {Array<HTMLElement>} this[name]
             */
            getElementsByTagName(name) {
                return this[name];
            }

            /**
             * Returns and removes the array containing the elements with the highest count
             * @returns {Array<HTMLElement>} E.g. returns all div elements if div is the highest encountered element tag
             */
            getElementsWithHighestCount() {
                return this[this.elementsSortedByNum.pop().tagName];
            }

            /**
             * @returns {Array<HTMLElement>} E.g. returns all div elements if div is the lowest encountered element tag
             */
            getElementsWithLowestCount() {
                return this[this.elementsSortedByNum.shift().tagName];
            }

            getElementsWithMostDepth() {
                return this.elementsSortedByDepth.pop();
            }

            smoothScrollTo(element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }

        Dom.utilities = {


            /**
             * Get the absolute page coordiantes of an element.
             * @param {HTMLElement} elem 
             */
            getAbsolutePageCoordinates(elem) {
                let box = elem.getBoundingClientRect();

                return {
                    top: box.top + pageYOffset,
                    left: box.left + pageXOffset,
                    bottom: box.bottom + pageYOffset,
                    right: box.right + pageXOffset,
                    width: box.width,
                    height: box.height
                };
            },

            getDistanceBetween2Points: function (x1, y1, x2, y2) {
                let a = x2 - x1;
                let b = y2 - y1;

                return Math.sqrt(a * a + b * b);
            },

            getCenterOfRect: function (rect) {
                return {
                    x: (rect.offsetWidth - parseInt(rect.style.left)) / 2,
                    y: (rect.offsetHeight - parseInt(rect.style.top)) / 2
                };
            }
        }




        /**
         * Creates a div element that is appended to <body> 
         * This div acts as a layer on top of the <body>
         */
        function createDiv() {
            let div = document.createElement('div');
            div.style.width = '100%';
            div.style.height = '100%';
            div.style.background = 'rgba(255, 255, 255, .3)'; //set opacity 
            div.style.color = 'white';
            div.style.position = 'fixed';
            div.style.top = '0';
            div.setAttribute('id', 'Div1');
            div.style.zIndex = '10000000000000';
            document.body.id = 'body';
            document.getElementById('body').appendChild(div);
            snake.push(div);
            snake.push(div);
            snake.push(div);
            snakeDot();
        }

        /**
         * Creates the Snake and appends it to <body>
         */
        function snakeDot() {
            let snake = document.createElement('div');
            snake.setAttribute('id', 'snake');
            snake.style.border = '1px solid black';
            snake.style.borderRadius = '100px';
            snake.style.left = '20px'; //start position
            snake.style.top = '550px';
            snake.style.width = '30px';
            snake.style.height = '30px'
            snake.style.background = 'black';
            snake.style.position = 'absolute';
            snake.style.zIndex = '10000000000000';
            document.getElementById('body').appendChild(snake);

            window.snakeHead = document.getElementById('snake');
            snakeHead.leftAbs = parseInt(snakeHead.style.left);
            snakeHead.topAbs = parseInt(snakeHead.style.top);

            snakeHead.rightAbs = function () { return snakeHead.absLeft + snakeHead.offsetWidth; };
            snakeHead.bottomAbs = function () { return snakeHead.absTop + snakeHead.offsetHeight; };
        }

    function createUserElements() {
        let divElement = document.createElement('div');
        divElement.style.width = 'fit-content';
        divElement.style.height = 'fit-content';
        divElement.style.position = 'fixed';
        divElement.style.right = '0px';
        divElement.style.top = '90px';
        divElement.style.zIndex = '100';
        divElement.setAttribute('id', 'uidiv');
        document.body.appendChild(divElement);
        }
        // Game Heading and Gameplay Instructions
    function createUserInstructions() {
        let paragraph = document.createElement('p');
        paragraph.style.width = '180px';
        paragraph.style.height = 'fit-content';
        paragraph.style.zIndex = '2';
        paragraph.style.position = 'relative';
        paragraph.style.color = 'darkcyan';
        paragraph.style.fontFamily = 'auto';
        paragraph.style.fontSize = 'large';
        paragraph.style.fontWeight = 'bold';
        paragraph.setAttribute('id', 'p1');
        document.getElementById('uidiv').appendChild(paragraph);
        paragraph.innerText = 'Use the arrow keys to move.' + '\nTo win the game, eat all the webpage elements';
    }

function foodVisualization() {

    window.objectives = [virtualDom.a];
    window.currObjective;
    window.level = 1;
    

    switch (level) {
        case 1:
        currObjective = '<' + objectives[0][0].tagName.toLowerCase() + '>';
        break;
        case 2:
        currObjective = objectives[1];
        break;
        case 3:
        currObjective = objectives[2];
        break;
    }
        }

    var eaten = 2;

// if something is eaten: eaten.append(eatenTag);
    
    if (eaten == 2) {
        buttons = 5;
    }

    function createGameInfo() {
        let paragraph2 = document.createElement('p');
        paragraph2.style.width = '180px';
        paragraph2.style.height = 'fit-content';
        paragraph2.style.zIndex = '2';
        paragraph2.style.position = 'relative';
        paragraph2.style.color = 'darkcyan';
        paragraph2.style.fontFamily = 'Comic Sans MS';
        paragraph2.style.fontSize = 'large';
        paragraph2.style.fontWeight = 'bold';
        paragraph2.setAttribute('id', 'p2');
        document.getElementById('uidiv').appendChild(paragraph2);
        paragraph2.innerText = 'Current Level: ' + level + '\nObjective: ' + currObjective + '\nEaten tags:';
        paragraph2.style.textDecoration = 'underline';

        let paragraph3 = document.createElement('p');
        paragraph3.style.width = '180px';
        paragraph3.style.height = 'fit-content';
        paragraph3.style.zIndex = '2';
        paragraph3.style.position = 'relative';
        paragraph3.style.color = 'darkcyan';
        paragraph3.style.fontFamily = 'auto';
        paragraph3.style.fontSize = 'large';
        paragraph2.setAttribute('id', 'p3');
        document.getElementById('uidiv').appendChild(paragraph3);
        paragraph3.innerText = '<h1>: ' + h1s + '\n<h2>: ' + h2s + '\n<h3>: ' + h3s + '\n<h4>: ' + h4s
        + '\n<h5>: ' + h5s + '\n<h6>: ' + h6s + '\n<a>: ' + links + '\n<p>: ' + paragraphs + '\n<img>:' + imgs
        + '\n<div>: ' + divs + '\n<link>: ' + links + '\n<video>: ' + videos + '\n<button>: ' + buttons;
    }



        // EVENT LISTENERS
        document.addEventListener('keydown', changeDirection);
        document.addEventListener('keyup', decreaseSpeed);
        window.visualViewport.onresize = function () {
            bodyWidth = htmlPage.scrollWidth;
            bodyHeight = htmlPage.scrollHeight;
        }


        function changeDirection(event) {
            if (Object.keys(directions).indexOf(String(event.keyCode)) != -1) {
                speed = speedOnKeyPressed;
                direction = directions[event.keyCode];
            }
        }

        function decreaseSpeed() {
            if (Object.keys(directions).indexOf(String(event.keyCode)) != -1) {
                speed = defaultSpeed;
            }
        }



        /**
         * The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint.
         * 
         * @param {Number} timestamp - argument of requestAnimationFrame that is automatically passed when the method is called. Similar to performance.now()
         */
        function moveSnake(timestamp) {

            snakeHead.scrollIntoView({ block: "center", inline: "center" }); //scroll view around the snake

            checkCollision();

            //define values so we don't have to compute them multiple times.
            //also makes code a bit easier to read.
            let left = snakeHead.leftAbs;
            let top = snakeHead.topAbs;
            let elemWidth = snakeHead.offsetWidth;
            let elemHeight = snakeHead.offsetHeight;

            /* let viewportCoords = snakeHead.getBoundingClientRect();
            var elements = document.elementsFromPoint(viewportCoords.left+16, viewportCoords.top+16);
        
            if(timestamp %100 < 20)
                console.log(elements); */

            if (left < 0) {                                             //exits left side
                snakeHead.leftAbs = (bodyWidth - elemWidth);
            }
            else if (top < 0) {                                         // exits top side
                snakeHead.topAbs = (bodyHeight - elemHeight);
            }
            else if (left + elemWidth > bodyWidth) {                    // exits right side
                snakeHead.leftAbs = 0;
            }
            else if (top + elemHeight > bodyHeight) {                   //exits bottom side
                snakeHead.topAbs = 0;
            }

            snakeHead[direction.item + "Abs"] += direction.sign * speed;
            snakeHead.style[direction.item] = snakeHead[direction.item + "Abs"] + 'px';      //set the new position

            //window.requestAnimationFrame(moveSnake);                                         //call the fn again
        }


        function checkCollision() {

            for (let i = 0; i < virtualDom.currentLevelElements.length; i++) {

                let elem = virtualDom.currentLevelElements[i];

                if (elem.x < snakeHead.leftAbs + snakeHead.clientWidth &&
                    elem.x + elem.width > snakeHead.leftAbs &&
                    elem.y < snakeHead.topAbs + snakeHead.clientHeight &&
                    elem.height + elem.y > snakeHead.topAbs) {

                    elem.element.style.opacity = 0;                                                                                         //opacity 0

                    virtualDom.currentLevelElements[i] = virtualDom.currentLevelElements[virtualDom.currentLevelElements.length - 1];
                    virtualDom.currentLevelElements.pop();
                }
                
            /*  if (centerX > elem.x && centerY > elem.y && centerX < elem.rightX && centerY < elem.bottomY) { //element eaten nom nom
                    
                    elem.element.style.opacity = 0;                                                                                         //opacity 0
                    
                    virtualDom.currentLevelElements[i] = virtualDom.currentLevelElements[virtualDom.currentLevelElements.length - 1];
                    virtualDom.currentLevelElements.pop();
                } */
            }
        }
        init();
    })();
