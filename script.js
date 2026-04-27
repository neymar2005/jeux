        const canvas = document.getElementById('pongCanvas');
        const ctx = canvas.getContext('2d');

        // Game objects
        const game = {
            width: canvas.width,
            height: canvas.height,
            centerLine: canvas.width / 2
        };

        const paddleWidth = 10;
        const paddleHeight = 80;
        const ballRadius = 8;
        const maxScore = 5;

        // Player paddle
        const player1 = {
            x: 20,
            y: game.height / 2 - paddleHeight / 2,
            width: paddleWidth,
            height: paddleHeight,
            dy: 0,
            speed: 6,
            score: 0,
            color: '#00ff00'
        };

        // AI paddle
        const player2 = {
            x: game.width - paddleWidth - 20,
            y: game.height / 2 - paddleHeight / 2,
            width: paddleWidth,
            height: paddleHeight,
            dy: 0,
            speed: 5,
            score: 0,
            color: '#ff00ff',
            ai: true
        };

        // Ball
        const ball = {
            x: game.width / 2,
            y: game.height / 2,
            radius: ballRadius,
            dx: -5,
            dy: 5,
            speed: 5,
            maxSpeed: 8,
            color: '#00ff00'
        };

        // Keyboard input
        const keys = {};
        window.addEventListener('keydown', (e) => {
            keys[e.key.toLowerCase()] = true;
        });

        window.addEventListener('keyup', (e) => {
            keys[e.key.toLowerCase()] = false;
        });

        // Draw functions
        function drawRect(x, y, width, height, color) {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, width, height);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, width, height);
        }

        function drawCircle(x, y, radius, color) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        function drawCenterLine() {
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.setLineDash([10, 10]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(game.centerLine, 0);
            ctx.lineTo(game.centerLine, game.height);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        function updateScore() {
            document.getElementById('player1Score').textContent = player1.score;
            document.getElementById('player2Score').textContent = player2.score;
        }

        // Update player movement
        function updatePlayer() {
            if (keys['w'] && player1.y > 0) {
                player1.y -= player1.speed;
            }
            if (keys['s'] && player1.y < game.height - player1.height) {
                player1.y += player1.speed;
            }

            // Keep paddle within bounds
            if (player1.y < 0) player1.y = 0;
            if (player1.y + player1.height > game.height) {
                player1.y = game.height - player1.height;
            }
        }

        // Update AI movement
        function updateAI() {
            const aiCenter = player2.y + player2.height / 2;
            const ballCenter = ball.y;
            const aiError = (Math.random() - 0.5) * 30; // Add some imperfection

            if (aiCenter < ballCenter - 35 + aiError) {
                player2.y += player2.speed;
            } else if (aiCenter > ballCenter + 35 + aiError) {
                player2.y -= player2.speed;
            }

            // Keep paddle within bounds
            if (player2.y < 0) player2.y = 0;
            if (player2.y + player2.height > game.height) {
                player2.y = game.height - player2.height;
            }
        }

        // Update ball movement
        function updateBall() {
            ball.x += ball.dx;
            ball.y += ball.dy;

            // Top and bottom collision
            if (ball.y - ball.radius < 0 || ball.y + ball.radius > game.height) {
                ball.dy = -ball.dy;
                ball.y = Math.max(ball.radius, Math.min(game.height - ball.radius, ball.y));
            }

            // Paddle collision detection
            if (
                ball.x - ball.radius < player1.x + player1.width &&
                ball.y > player1.y &&
                ball.y < player1.y + player1.height
            ) {
                ball.dx = -ball.dx;
                ball.x = player1.x + player1.width + ball.radius;
                
                // Add spin based on paddle contact point
                const contactPoint = (ball.y - (player1.y + player1.height / 2)) / (player1.height / 2);
                ball.dy += contactPoint * 4;
                
                // Increase speed slightly
                if (Math.abs(ball.dx) < ball.maxSpeed) {
                    ball.dx *= 1.05;
                }
            }

            if (
                ball.x + ball.radius > player2.x &&
                ball.y > player2.y &&
                ball.y < player2.y + player2.height
            ) {
                ball.dx = -ball.dx;
                ball.x = player2.x - ball.radius;
                
                // Add spin based on paddle contact point
                const contactPoint = (ball.y - (player2.y + player2.height / 2)) / (player2.height / 2);
                ball.dy += contactPoint * 4;
                
                // Increase speed slightly
                if (Math.abs(ball.dx) < ball.maxSpeed) {
                    ball.dx *= 1.05;
                }
            }

            // Score detection
            if (ball.x - ball.radius < 0) {
                player2.score++;
                resetBall();
            } else if (ball.x + ball.radius > game.width) {
                player1.score++;
                resetBall();
            }
        }

        function resetBall() {
            ball.x = game.width / 2;
            ball.y = game.height / 2;
            ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
            ball.dy = (Math.random() - 0.5) * 5;
            updateScore();

            // Check for win condition
            if (player1.score >= maxScore || player2.score >= maxScore) {
                endGame();
            }
        }

        function endGame() {
            const gameOverScreen = document.getElementById('gameOverScreen');
            const winnerText = document.getElementById('winnerText');
            
            if (player1.score >= maxScore) {
                winnerText.textContent = '🎉 Player 1 Wins! 🎉';
            } else {
                winnerText.textContent = '🤖 AI Wins! 🤖';
            }
            
            gameOverScreen.style.display = 'block';
            gameRunning = false;
        }

        // Draw everything
        function draw() {
            // Clear canvas
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, game.width, game.height);

            // Draw center line
            drawCenterLine();

            // Draw paddles
            drawRect(player1.x, player1.y, player1.width, player1.height, player1.color);
            drawRect(player2.x, player2.y, player2.width, player2.height, player2.color);

            // Draw ball
            drawCircle(ball.x, ball.y, ball.radius, ball.color);

            // Draw borders
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, game.width, game.height);
        }

        // Game loop
        let gameRunning = true;

        function gameLoop() {
            if (gameRunning) {
                updatePlayer();
                updateAI();
                updateBall();
                draw();
            }
            requestAnimationFrame(gameLoop);
        }

        // Start game
        updateScore();
        gameLoop();