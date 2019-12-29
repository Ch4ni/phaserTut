var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 300},
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

window.addEventListener('load', () => {
        var game = new Phaser.Game(config)
})

function preload() {
    this.load.image('sky', 'assets/sky.png')
    this.load.image('ground', 'assets/platform.png')
    this.load.image('star', 'assets/star.png')
    this.load.image('bomb', 'assets/bomb.png')
    this.load.spritesheet('dude', 'assets/dude.png', {frameWidth: 32, frameHeight: 48})
}

var platforms
function createPlatforms(context) {
    platforms = context.physics.add.staticGroup()
    platforms.create(400, 568, 'ground').setScale(2).refreshBody()
    platforms.create(600, 400, 'ground')
    platforms.create(50, 250, 'ground')
    platforms.create(750, 220, 'ground')
}

var player
function createPlayer(context) {
    player = context.physics.add.sprite(100, 450, 'dude')

    player.setBounce(0.2)
    player.setCollideWorldBounds(true)

    context.anims.create({
        key: 'left',
        frames: context.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
        frameRate: 10,
        repeat: -1
    })

    context.anims.create({
        key: 'turn',
        frames: [{key: 'dude', frame: 4}],
        frameRate: 20
    })

    context.anims.create({
        key: 'right',
        frames: context.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
        frameRate: 10,
        repeat: -1
    })
}

var stars
function createStars(context){
    stars = context.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: {x: 12, y: 0, stepX: 70}
    })
    stars.children.iterate((star) => {
        star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
    })
}

var score = 0
var scoreText
function createScoreText(context) {
    scoreText = context.add.text(16, 16, 'score: 0', {fontSize: '32px', fill: '#000'})
}

function collectStar(player, star){
    star.disableBody(true, true)
    score += 10
    scoreText.setText('score: ' + score)
    if(stars.countActive(true) === 0) {
        stars.children.iterate((child) => {
            child.enableBody(true, child.x, 0, true, true)
        })

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400)

        var bomb = bombs.create(x, 16, 'bomb')
        bomb.setBounce(1)
        bomb.setCollideWorldBounds(true)
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
    }
}

function setupCollectStar(context){
    context.physics.add.overlap(player, stars, collectStar, null, context)
}

var gameOver = false
function hitBomb(player, bomb) {
    this.physics.pause()
    player.setTint(0xff0000)
    player.anims.play('turn')
    gameOver = true
}

var bombs
var cursors
function create() {
    this.add.image(400, 300, 'sky')
    createPlatforms(this)
    createPlayer(this)
    createStars(this)
    createScoreText(this)
    this.physics.add.collider(player, platforms)
    this.physics.add.collider(stars, platforms)
    setupCollectStar(this)
    cursors = this.input.keyboard.createCursorKeys()

    bombs = this.physics.add.group()
    this.physics.add.collider(bombs, platforms)
    this.physics.add.collider(player, bombs, hitBomb, null, this)
}

function update() {
    if(cursors.left.isDown) {
        player.setVelocityX(-160)
        player.anims.play('left', true)
    } else if(cursors.right.isDown) {
        player.setVelocityX(160)
        player.anims.play('right', true)
    } else {
        player.setVelocityX(0)
        player.anims.play('turn')
    }

    if(cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330)
    }
}