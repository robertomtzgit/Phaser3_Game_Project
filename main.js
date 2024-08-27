var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('background', 'assets/background.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('frog_idle', 'assets/frog_idle.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('frog_run', 'assets/frog_run.png', { frameWidth: 32, frameHeight: 32 });
}

function create ()
{
    // Game background
    this.add.image(500, 400, 'background').setDisplaySize(1600, 1200); // Adjust size as needed

    // Platforms group
    platforms = this.physics.add.staticGroup();

    // Create platforms
    platforms.create(400, 568, 'ground').setScale(2).refreshBody(); // Ground platform
    platforms.create(100, 380, 'ground').setScale(1).refreshBody(); // Middle platform
    platforms.create(700, 230, 'ground').setScale(1).refreshBody(); // Middle platform
    platforms.create(50, 170, 'ground').setScale(1).refreshBody(); // High platform

    // Player setup
    player = this.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.setScale(1.5); // Adjust player size

    // Player animations
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('frog_run', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'frog_idle', frame: 0 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('frog_run', { start: 0, end: 5 }), // Ensure frame range is correct
        frameRate: 10,
        repeat: -1
    });

    // Input events
    cursors = this.input.keyboard.createCursorKeys();

    // Stars to collect
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    // Bombs
    bombs = this.physics.add.group();

    // Score
    scoreText = this.add.text(16, 16, 'Score: 0', { fontFamily: 'Bungee Tint', fontSize: '32px', fill: '#000' });

    //Game Over
    gameOverText = this.add.text(config.width / 2, config.height / 2, '¡Game Over!', { fontFamily: 'Bungee Tint', fontSize: '64px', fill: '#f00' });
    gameOverText.setOrigin(0.5, 0.5); 
    gameOverText.setVisible(false); 

    // Collisions
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    // Interactions
    this.physics.add.overlap(player, stars, collectStar, null, this);
    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update ()
{
    if (gameOver)
    {
        return;
    }

    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);
        player.setFlipX(true);  // Flip sprite to the left
        player.anims.play('left', true); // Play left animation
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);
        player.setFlipX(false); // Do not flip sprite
        player.anims.play('right', true); // Play right animation
    }
    else
    {
        player.setVelocityX(0);
        player.anims.play('turn'); // Play idle animation
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }
}

function collectStar (player, star)
{
    star.disableBody(true, true);

    // Add and update the score
    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0)
    {
        // A new batch of stars to collect
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });

        var x = (player.x < 1000) ? Phaser.Math.Between(400, 1000) : Phaser.Math.Between(0, 1000);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
    }
}

function hitBomb (player, bomb)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
    gameOverText.setVisible(true); 
}
