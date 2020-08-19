startGame = (cellV = 4, cellH = 7, ) => {

    const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter,

        width = window.innerWidth - 150,
        height = window.innerHeight - 150,
        //height
        cellsVertical = cellV,
        //width
        cellsHorizental = cellH,
        wallWidth = 2

    const unitLengthX = width / cellsHorizental;
    const unitLengthY = height / cellsVertical;


    engine = Engine.create(),
        engine.world.gravity.y = 0,
        { world } = engine,
        render = Render.create({
            element: document.body,
            engine: engine,
            options: {
                wireframes: false,
                width,
                height
            }
        });


    Render.run(render);
    Runner.run(Runner.create(), engine)



    // Walls
    const walls = [
        Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
        Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
        Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
        Bodies.rectangle(width, height / 2, 2, height, { isStatic: true })
    ];
    World.add(world, walls);

    // Maze Generator 

    const shuffle = (arr) => {
        let counter = arr.length;

        while (counter > 0) {
            const index = Math.floor(Math.random() * counter);

            counter--;

            const temp = arr[counter];
            arr[counter] = arr[index];
            arr[index] = temp;

        }
        return arr;
    };

    const grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizental).fill(false));
    const verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizental - 1).fill(false));
    const horisontals = Array(cellsVertical - 1).fill(null).map(() => Array(cellsHorizental).fill(false));

    const startRow = Math.floor(Math.random() * cellsVertical);
    const startColumn = Math.floor(Math.random() * cellsHorizental);

    const stepThrougCell = (row, column) => {
        // If i have visited the cell at [row, column], then return
        if (grid[row][column]) {
            return;
        }
        // Mark this cell as being visited
        grid[row][column] = true;
        //Assemlble randomly-ordered list of neighbors
        const neighbors = shuffle([
            [row - 1, column, 'up'],
            [row, column + 1, 'right'],
            [row + 1, column, 'down'],
            [row, column - 1, 'left']
        ]);

        // For each neighbor...
        for (let neighbor of neighbors) {
            const [nextRow, nextColumn, direction] = neighbor

            // see if that neighbor is out of bounds
            if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizental) {
                continue;
            }
            // If we have visited that neighbor, continue to next neighbore
            if (grid[nextRow][nextColumn]) {
                continue;
            }
            // Remove a wall from either horizontals or verticals
            if (direction == 'left') {
                verticals[row][column - 1] = true;
            } else if (direction === 'right') {
                verticals[row][column] = true;
            } else if (direction === 'up') {
                horisontals[row - 1][column] = true;
            } else if (direction === 'down') {
                horisontals[row][column] = true;
            }
            stepThrougCell(nextRow, nextColumn);
        }

        // Visit that next cell
    }

    stepThrougCell(startRow, startColumn);

    horisontals.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
            if (open) {
                return;
            }

            const wall = Bodies.rectangle(
                columnIndex * unitLengthX + unitLengthX / 2,
                rowIndex * unitLengthY + unitLengthY,
                unitLengthX,
                wallWidth,
                {
                    label: 'wall',
                    isStatic: true,
                    render: {
                        fillStyle: 'red'
                    }
                }
            );
            World.add(world, wall)
        })
    })

    verticals.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
            if (open) {
                return;
            }

            const wall = Bodies.rectangle(
                columnIndex * unitLengthX + unitLengthX,
                rowIndex * unitLengthY + unitLengthY / 2,
                wallWidth,
                unitLengthY,
                {
                    label: 'wall',
                    isStatic: true,
                    render: {
                        fillStyle: 'red'
                    }
                }
            );
            World.add(world, wall)
        })
    });

    //goal

    const goal = Bodies.rectangle(
        width - unitLengthX / 2,
        height - unitLengthY / 2,
        unitLengthX / 2,
        unitLengthY / 2,
        {
            isStatic: true,
            label: 'goal',
            render: {
                fillStyle: 'green'
            }
        }
    );
    World.add(world, goal);

    // Player ball

    const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
    const ball = Bodies.circle(
        unitLengthX / 2,
        unitLengthY / 2,
        ballRadius,
        {
            label: 'ball',
            render: {
                fillStyle: 'blue'
            }
        }
    );
    World.add(world, ball);

    document.addEventListener('keydown', event => {
        const { x, y } = ball.velocity;
        if (event.keyCode === 38 || event.keyCode === 87) {
            Body.setVelocity(ball, { x, y: y - 5 });
        }
        if (event.keyCode === 39 || event.keyCode === 68) {
            Body.setVelocity(ball, { x: x + 5, y });
        }
        if (event.keyCode === 40 || event.keyCode === 83) {
            Body.setVelocity(ball, { x, y: y + 5 });
        }
        if (event.keyCode === 37 || event.keyCode === 65) {
            Body.setVelocity(ball, { x: x - 5, y });
        }
    });

    // win condition

    Events.on(engine, 'collisionStart', event => {
        event.pairs.forEach((collision) => {
            const labels = ['ball', 'goal'];

            if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
                {
                    world.gravity.y = 1;
                    world.bodies.forEach(body => {
                        if (body.label === 'wall') {
                            Body.setStatic(body, false);
                        }
                    });
                    document.querySelector('.winner').classList.remove('hidden');
                }
            }
        });
    });

    // prevent scrolling using arrow keys

    window.addEventListener("keydown", function (e) {
        // space and arrow keys
        if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);
};


startGame()

document.querySelector('button').addEventListener('click', () => {
    location.reload();
    startGame()
});