let skadi = 0;
let skadi_colider = 0;
let aniList = [];
let aniListIdx = 0;
let skadiSide = 1; // 0 : left, 1: right
let isAttack = false;
let weapon = 0;
let ball = [];
let bill = [];
const ballCount = 10;
let keyboardBtn = {
    left : null,
    right : null,
    up : null,
    down : null,
    space : null
};
let spaceBtnClickFlag = false;


class Example extends Phaser.Scene
{   

    constructor ()
    {
        super({
            pack: {
                files: [
                    { type: 'scenePlugin', key: 'SpinePlugin', url: 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/plugins/spine/dist/SpinePluginDebug.min.js', sceneKey: 'spine' }
                ]
            }
        });
    }

    preload ()
    {
        this.load.image('Originium', './img/Originium.png');
        this.load.image('LMD', './img/LMD.png');
        
        this.load.image('keyboard_space', './img/Keyboard_space.png');

        this.load.setPath('./spine');
        this.load.spine('skadi_summer', 'skadi_summer.json', [ 'skadi_summer.atlas' ], true);

    }

    create ()
    {
        this.matter.world.setBounds();

        // console bar
        this.matter.add.rectangle(400, 600, 800, 100, {isStatic: true});
        
        keyboardBtn.space = this.add.image(550, 750, 'keyboard_space', {isStatic : true});
        keyboardBtn.space.setScale(2.5, 2.5);
        keyboardBtn.space.setInteractive();
        keyboardBtn.space.on('pointerdown', () => {
            spaceBtnClickFlag = true;
        });

        // skadi skeleton settings
        aniListIdx = 7;
        skadi = this.add.spine(400, 600, 'skadi_summer', 'custom/move', true);
        skadi.setInteractive()
        //this.input.enableDebug(skadi, 0xff00ff);
        //console.dir(skadi.play)

        aniList = skadi.getAnimationList();
        //console.log(aniList);

        skadi_colider = this.add.ellipse(
            skadi.x, skadi.y - (skadi.height / 2 + 20), skadi.width / 2, skadi.height
        );
        skadi_colider.setStrokeStyle(2, 0x1a65ac);
        const points = skadi_colider.pathData.slice(0, -2).join(' ');
        this.shield = this.matter.add.gameObject(skadi_colider, {
            shape: { type: 'fromVerts', verts: points, flagInternal: false },
            isStatic : false,
            setInteractive : true
        });
        skadi_colider.setFixedRotation();
        skadi_colider.setBounce(0.5)
        skadi_colider.setFriction(0, 0, 0);
        skadi_colider.alpha = 0;
        console.dir(skadi_colider);


        for(let i = 0; i < ballCount; i ++) {
            ball.push(this.matter.add.image(400, 100, 'Originium', Phaser.Math.Between(0, 5)));
            ball[i].setCircle();
            ball[i].setScale(0.5);
            ball[i].setBounce(0.96);
            ball[i].setFriction(0, 0, 0);
        }
        for(let i = 0; i < ballCount; i ++) {
            bill.push(this.matter.add.image(400, 100, 'LMD', Phaser.Math.Between(0, 5)));
            bill[i].setScale(0.5);
            bill[i].setBounce(0.96);
            bill[i].setFriction(0, 0, 0);
        }
        
        
        
        
        
        
        
        
        
        // key event
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // mouse event
        this.matter.add.mouseSpring();
        
    }

    update() {
        
        //movement
        // move left
        if (this.cursors.left.isDown && !isAttack) 
        {
            if(aniListIdx != 9) {
                aniListIdx = 9;
                skadi.play(aniList[aniListIdx], true);
            }

            if(skadiSide != 0) {
                skadiSide = 0;
                skadi.setScale(-1, 1);
            }

            skadi.x -= 1;
            
            
            
        } // move right
        else if (this.cursors.right.isDown  && !isAttack)
        {
            if(aniListIdx != 9) {
                aniListIdx = 9;
                skadi.play(aniList[aniListIdx], true);
            }

            if(skadiSide != 1) {
                skadiSide = 1;
                skadi.setScale(1, 1);
            }

            skadi.x += 1;
            
        } // look up
        else if(this.cursors.up.isDown && !isAttack){
            if(aniListIdx != 8) {
                aniListIdx = 8;
                skadi.play(aniList[aniListIdx], false);
            }
        } // look down
        else if(this.cursors.down.isDown && !isAttack){
            if(aniListIdx != 7) {
                aniListIdx = 7;
                skadi.play(aniList[aniListIdx], false);
            }
        }
        else // idle
        {
            if(aniListIdx != 5  && !isAttack) {
                aniListIdx = 5;
                skadi.play(aniList[aniListIdx], true);
                
            }   
            skadi_colider.setVelocityX(0);
        }
        
        // skadi physics setting
        if(skadi_colider.x > skadi.x) {
            skadi_colider.setVelocityX(-1);
        }else if(skadi_colider.x < skadi.x) {
            skadi_colider.setVelocityX(1);
        }else {
            skadi_colider.setVelocityX(0);
        }

        if(skadi_colider.x - skadi.x > 2 || skadi_colider.x - skadi.x < -2) {
            skadi.x = skadi_colider.x;
        }
        skadi.y = skadi_colider.y + skadi.height / 2;

        
        // attack motion, effect
        if ((Phaser.Input.Keyboard.JustDown(this.spacebar) || spaceBtnClickFlag) && !isAttack)
        {
            isAttack = true;
            aniListIdx = 0;
            skadi.play(aniList[aniListIdx], false);
            setTimeout(() => {
                console.log("1.5초");
                isAttack = false;
                spaceBtnClickFlag = false;
            }, 1400);
            
            setTimeout(() => {
                for(let i = 0; i < ballCount; i ++) {
                    if(skadiSide == 1 && 
                        (ball[i].x > skadi.x && ball[i].x < skadi.x + 150 &&
                         ball[i]).y > skadi.y - skadi.height / 2 && 
                         ball[i].y < skadi.y + skadi.height / 2) {
                            ball[i].setVelocityY(-10);
                            ball[i].setVelocityX(2);
                         }
                    
                }

                for(let i = 0; i < ballCount; i ++) {
                    if(skadiSide == 0 && 
                        (ball[i].x < skadi.x && ball[i].x > skadi.x - 150 &&
                         ball[i]).y > skadi.y - skadi.height / 2 && 
                         ball[i].y < skadi.y + skadi.height / 2) {
                            ball[i].setVelocityY(-10);
                            ball[i].setVelocityX(-2);
                         }
                    
                }

                for(let i = 0; i < ballCount; i ++) {
                    if(skadiSide == 1 && 
                        (bill[i].x > skadi.x && bill[i].x < skadi.x + 150 &&
                         bill[i]).y > skadi.y - skadi.height /2 && 
                         bill[i].y < skadi.y + skadi.height / 2) {
                            bill[i].setVelocityY(-10);
                            bill[i].setVelocityX(2);
                         }
                    
                }

                for(let i = 0; i < ballCount; i ++) {
                    if(skadiSide == 0 && 
                        (bill[i].x < skadi.x && bill[i].x > skadi.x - 150 &&
                         bill[i]).y > skadi.y - skadi.height / 2 && 
                         bill[i].y < skadi.y + skadi.height / 2) {
                            bill[i].setVelocityY(-10);
                            bill[i].setVelocityX(-2);
                         }   
                }
            }, 800);
        }
    }

}

const config = {
    type: Phaser.WEBGL,
    parent: 'phaser-example',
    width: 800,
    height: 800,
    backgroundColor: '#2d2d2d',
    physics: {
        default: 'matter',
        matter: {
            debug: true,
            enableSleeping: true,
            gravity : {x : 0, y : 0.3}
        }
    },
    scene: Example
};

const game = new Phaser.Game(config);