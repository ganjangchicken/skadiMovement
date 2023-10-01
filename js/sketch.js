let skadi = 0;
let skadi_colider = 0;
let aniList = [];
let aniListIdx = 0;
let skadiSide = 1; // 0 : left, 1: right
let isAttack = false;
let attackTimeBuffer = 0;
let stopBugFixBall = null;
let stopBugFixBuffer = 0;
let stopBugFixFlag = false;

const button = (scene, x, y, texture, cb) => {
    scene.add
      .image(x, y, texture)
      .setInteractive()
      .on('pointerdown', () => {
        cb()
      })
}

class Example extends Phaser.Scene
{   

    constructor ()
    {
        super({
            pack: {
                files: [
                    { type: 'scenePlugin', key: 'SpinePlugin', url: '../phaser/plugins/spine/dist/SpinePluginDebug.js', sceneKey: 'spine' }
                ]
            }
        });
    }

    preload ()
    {
        this.load.setPath('../spine');
        this.load.spine('skadi_summer', 'skadi_summer.json', [ 'skadi_summer.atlas' ], true);

        this.load.image('up', '../img/up.png');
        this.load.image('오리지늄', '../img/오리지늄.png');
        this.load.image('용문폐', '../img/용문폐.png');
    }

    create ()
    {
        this.matter.world.setBounds();
        aniListIdx = 7;
        
        skadi = this.add.spine(400, 600, 'skadi_summer', 'custom/move', true);
        skadi.setInteractive()
        this.input.enableDebug(skadi, 0xff00ff);
        console.dir(skadi.play)

        aniList = skadi.getAnimationList();
        console.log(aniList);

        button(this, 120, 50, 'up', () => {
            console.log("click");

            if(aniListIdx == 0) {
                aniListIdx = 5;
            }else if(aniListIdx == 5){
                aniListIdx = 7;
            }else {
                aniListIdx = 0
            }

            skadi.play(aniList[aniListIdx], true);

        })

        const ball = this.matter.add.image(400, 100, '오리지늄', Phaser.Math.Between(0, 5));

        ball.setCircle();
        ball.setBounce(0.96);
      
        console.log(skadi);
        console.log(skadi.input);
        
        this.matter.add.mouseSpring();
        
        skadi_colider = this.add.ellipse(
            skadi.x, skadi.y - (skadi.height / 2 + 2), skadi.width / 2, skadi.height
        );
        skadi_colider.setStrokeStyle(2, 0x1a65ac);
        const points = skadi_colider.pathData.slice(0, -2).join(' ');
        this.shield = this.matter.add.gameObject(skadi_colider, {
            shape: { type: 'fromVerts', verts: points, flagInternal: false },
            isStatic : false,
            setInteractive : true
        });
        skadi_colider.setFixedRotation();
        console.dir(skadi_colider)
        
        
        // key event
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);


        //stopBugFixBall = this.matter.add.circle(100, 100, 5);
        
    }

    update() {
        
        if (this.cursors.left.isDown && !isAttack)
        {
            if(aniListIdx != 7) {
                aniListIdx = 7;
                skadi.play(aniList[aniListIdx], true);
            }

            if(skadiSide != 0) {
                skadiSide = 0;
                skadi.setScale(-1, 1);
            }

            //skadi.x -= 1.5;
            skadi_colider.setVelocityX(-2);
        }
        else if (this.cursors.right.isDown  && !isAttack)
        {
            if(aniListIdx != 7) {
                aniListIdx = 7;
                skadi.play(aniList[aniListIdx], true);
            }

            if(skadiSide != 1) {
                skadiSide = 1;
                skadi.setScale(1, 1);
            }

            //skadi.x += 1.5;
            skadi_colider.setVelocityX(2);
        }
        else
        {
            if(aniListIdx != 5  && !isAttack) {
                aniListIdx = 5;
                skadi.play(aniList[aniListIdx], true);
                
            }   
            skadi_colider.setVelocityX(0);
        }
        //skadi_colider.x = skadi.x;
        skadi.x = skadi_colider.x;

        if (Phaser.Input.Keyboard.JustDown(this.spacebar) && !isAttack)
        {
            isAttack = true;
            aniListIdx = 0;
            skadi.play(aniList[aniListIdx], false);
            
        }
        if(isAttack) {
            attackTimeBuffer += 1;

            if(attackTimeBuffer > 90) {
                isAttack = false;
                attackTimeBuffer = 0;
                stopBugFixBuffer = 0;
                stopBugFixFlag = true;
            }
        }
        if(stopBugFixFlag && stopBugFixBuffer == 0) {
            stopBugFixBuffer += 1;
            stopBugFixBall = this.matter.add.circle(skadi_colider.x + 1, skadi_colider.y - 110, 5);
        }
        if(stopBugFixFlag) {
            stopBugFixBuffer += 1;
        }
        if(stopBugFixBuffer > 5) {
            console.dir(stopBugFixBall)
            stopBugFixBuffer = 0;
            stopBugFixFlag = false;
        }


        
    }

}

const config = {
    type: Phaser.WEBGL,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    backgroundColor: '#2d2d2d',
    physics: {
        default: 'matter',
        matter: {
            debug: true,
            enableSleeping: true
        }
    },
    scene: Example
};

const game = new Phaser.Game(config);