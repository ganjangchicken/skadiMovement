
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
        let counter = 7;
        
        let skadi = this.add.spine(400, 600, 'skadi_summer', 'custom/move', true);
        skadi.setInteractive()
        
        this.input.enableDebug(skadi, 0xff00ff);

        let aniList = skadi.getAnimationList();
        console.log(aniList);

        button(this, 120, 50, 'up', () => {
            console.log("click");

            if(counter == 0) {
                counter = 5;
            }else if(counter == 5){
                counter = 7;
            }else {
                counter = 0
            }

            skadi.play(aniList[counter], true);

        })

        const ball = this.matter.add.image(400, 100, '오리지늄', Phaser.Math.Between(0, 5));

        ball.setCircle();
        ball.setBounce(0.96);
      
        console.log(skadi);
        console.log(skadi.input);
        
        this.matter.add.mouseSpring();

        let skadi_body = this.matter.add.rectangle(skadi.x, skadi.y, skadi.width, skadi.height);
        
        skadi_body.isStatic = true;
        console.log(skadi_body);

        const ellipse = this.add.ellipse(
            400, 100, 200, 100
        );
        ellipse.setStrokeStyle(2, 0x1a65ac);
        const points = ellipse.pathData.slice(0, -2).join(' ');
        this.shield = this.matter.add.gameObject(ellipse, {
            shape: { type: 'fromVerts', verts: points, flagInternal: true }
        });


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