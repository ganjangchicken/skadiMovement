let skadi = 0;
let skadi_colider = 0;
let aniList = [];
let aniListCounter = 0;
let skadiSide = 0; // 0 : left, 1: right


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
        aniListCounter = 7;
        
        skadi = this.add.spine(400, 600, 'skadi_summer', 'custom/move', true);
        skadi.setInteractive()
        
        this.input.enableDebug(skadi, 0xff00ff);

        aniList = skadi.getAnimationList();
        console.log(aniList);

        button(this, 120, 50, 'up', () => {
            console.log("click");

            if(aniListCounter == 0) {
                aniListCounter = 5;
            }else if(aniListCounter == 5){
                aniListCounter = 7;
            }else {
                aniListCounter = 0
            }

            skadi.play(aniList[aniListCounter], true);

        })

        const ball = this.matter.add.image(400, 100, '오리지늄', Phaser.Math.Between(0, 5));

        ball.setCircle();
        ball.setBounce(0.96);
      
        console.log(skadi);
        console.log(skadi.input);
        
        this.matter.add.mouseSpring();
        
        skadi_colider = this.add.ellipse(
            skadi.x, skadi.y - skadi.height / 2, skadi.width / 2, skadi.height
        );
        skadi_colider.setStrokeStyle(2, 0x1a65ac);
        const points = skadi_colider.pathData.slice(0, -2).join(' ');
        this.shield = this.matter.add.gameObject(skadi_colider, {
            shape: { type: 'fromVerts', verts: points, flagInternal: true },
            isStatic : true
        });
        
        
        //skadi_colider = ellipse;

        this.cursors = this.input.keyboard.createCursorKeys();

        
    }

    update() {
        
        if (this.cursors.left.isDown)
        {
            if(aniListCounter != 7) {
                aniListCounter = 7;
                skadi.play(aniList[aniListCounter], true);
            }

            if(skadiSide != 0) {
                skadiSide = 0;
                skadi.setScale(-1, 1);
            }

            skadi.x -= 1.5;
            
        }
        else if (this.cursors.right.isDown)
        {
            if(aniListCounter != 7) {
                aniListCounter = 7;
                skadi.play(aniList[aniListCounter], true);
            }

            if(skadiSide != 1) {
                skadiSide = 1;
                skadi.setScale(1, 1);
            }

            skadi.x += 1.5;
        }
        else
        {
            if(aniListCounter != 5) {
                aniListCounter = 5;
                skadi.play(aniList[aniListCounter], true);
                
            }            
        }
        skadi_colider.x = skadi.x;


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