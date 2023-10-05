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
let controlBall;
let mouseFlag = false;
let locationFlag = 0; // 0 : idle, 1: left, 2: right, 3: up, 4: down

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
        this.load.image('ctrlBall', './img/circlepadset.png');
        this.load.image('bar', './img/bar.png');
        this.load.image('keyboard_space', './img/Keyboard_space.png');

        this.load.setPath('./spine');
        this.load.spine('skadi_summer', 'skadi_summer.json', [ 'skadi_summer.atlas' ], true);

    }

    create ()
    {
        this.matter.world.setBounds();

        // console bar
        this.matter.add.rectangle(winSizeW / 2, winSizeH * 3 / 4, winSizeW, winSizeH / 8, {isStatic: true});
        let bar = this.add.image(winSizeW / 2, winSizeH * 3 / 4, 'bar');
        if(isMobile){
            bar.setScale(0.6);
        }

        let zone;
        if(isMobile) {
            zone = this.add.zone(10, winSizeH - 90, 80, 80).setDropZone();
        }else {
            zone = this.add.zone(100, 675, 100, 100).setDropZone();
        }
        //  Just a visual display of the drop zone
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x000000);
        graphics.strokeRect(zone.x + zone.input.hitArea.x, zone.y + zone.input.hitArea.y, zone.input.hitArea.width, zone.input.hitArea.height);
        
        keyboardBtn.space = this.add.image(550, 750, 'keyboard_space', {isStatic : true});
        if(isMobile) {
            keyboardBtn.space.x = winSizeW * 5 / 8;
            keyboardBtn.space.y = winSizeH * 7 / 8;
            keyboardBtn.space.setScale(1.5, 1.5);
        }else {
            keyboardBtn.space.setScale(2.5, 2.5);
        }
        
        keyboardBtn.space.setInteractive();
        keyboardBtn.space.on('pointerdown', () => {
            spaceBtnClickFlag = true;
        });

        if(isMobile) {
            controlBall = this.add.image(50, winSizeH - 50, 'ctrlBall', null, { ignoreGravity: true });
            controlBall.setScale(0.18);
        }else {
            controlBall = this.add.image(150, 725, 'ctrlBall', null, { ignoreGravity: true });
            controlBall.setScale(0.2);
        }
        controlBall.setInteractive();
        controlBall.on('pointerdown', () => {
            mouseFlag = true;
        })
        this.input.on('pointerup', pointer =>{
            if (pointer.leftButtonReleased()){
                mouseFlag = false;
            }
        })
        


        // skadi skeleton settings
        aniListIdx = 7;
        skadi = this.add.spine(winSizeW / 2, winSizeH * 3 / 4, 'skadi_summer', 'custom/move', true);
        if(isMobile) {
            skadi.setScale(0.5);
        }
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
        if(isMobile) { 
            skadi_colider.setScale(0.5);
        }
        skadi_colider.setFixedRotation();
        skadi_colider.setBounce(0.5)
        skadi_colider.setFriction(0, 0, 0);
        skadi_colider.alpha = 0;
        console.dir(skadi_colider);



        for(let i = 0; i < ballCount; i ++) {
            ball.push(this.matter.add.image(winSizeW / 2, 100, 'Originium', Phaser.Math.Between(0, 5)));
            ball[i].setCircle();
            ball[i].setScale(0.5);
            ball[i].setBounce(0.96);
            ball[i].setFriction(0, 0, 0);
            if(isMobile) {
                ball[i].setScale(0.25);
            }else {
                ball[i].setScale(0.5);
            }
        }
        for(let i = 0; i < ballCount; i ++) {
            bill.push(this.matter.add.image(winSizeW / 2, 100, 'LMD', Phaser.Math.Between(0, 5)));
            bill[i].setScale(0.5);
            bill[i].setBounce(0.96);
            bill[i].setFriction(0, 0, 0);
            if(isMobile) {
                bill[i].setScale(0.25);
            }else { 
                bill[i].setScale(0.5);
            }
        }
        
        
        
        
        
        
        
        
        
        // key event
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // mouse event
        this.matter.add.mouseSpring();
        
    }

    update() {
        const pointer = this.input.activePointer;
        
        //movement
        // move left
        if (this.cursors.left.isDown && !isAttack || (mouseFlag && locationFlag == 1)) 
        {
            if(aniListIdx != 9) {
                aniListIdx = 9;
                skadi.play(aniList[aniListIdx], true);
            }

            if(skadiSide != 0) {
                skadiSide = 0;
                if(isMobile) { 
                    skadi.setScale(-0.5, 0.5);
                }else {
                    skadi.setScale(-1, 1);
                }
                
            }

            skadi.x -= 1;
            
            
            
        } // move right
        else if (this.cursors.right.isDown  && !isAttack || (mouseFlag && locationFlag == 2))
        {
            if(aniListIdx != 9) {
                aniListIdx = 9;
                skadi.play(aniList[aniListIdx], true);
            }

            if(skadiSide != 1) {
                skadiSide = 1;
                if(isMobile) { 
                    skadi.setScale(0.5, 0.5);
                }else {
                    skadi.setScale(1, 1);
                }
            }

            skadi.x += 1;
            
        } // look up
        else if(this.cursors.up.isDown && !isAttack || (mouseFlag && locationFlag == 3)){
            if(aniListIdx != 8) {
                aniListIdx = 8;
                skadi.play(aniList[aniListIdx], false);
            }
        } // look down
        else if(this.cursors.down.isDown && !isAttack || (mouseFlag && locationFlag == 4)){
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
        if(isMobile) {
            skadi.y = skadi_colider.y + skadi.height / 4;
        }else {
            skadi.y = skadi_colider.y + skadi.height / 2;
        }
        

        
        // attack motion, effect
        if ((Phaser.Input.Keyboard.JustDown(this.spacebar) || spaceBtnClickFlag) && !isAttack)
        {
            let attackRange = 150;
            if(isMobile) {
                attackRange /= 2;
            }
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
                        (ball[i].x > skadi.x && ball[i].x < skadi.x + attackRange &&
                         ball[i]).y > skadi.y - skadi.height / 2 && 
                         ball[i].y < skadi.y + skadi.height / 2) {
                            ball[i].setVelocityY(-10);
                            ball[i].setVelocityX(2);
                         }
                    
                }

                for(let i = 0; i < ballCount; i ++) {
                    if(skadiSide == 0 && 
                        (ball[i].x < skadi.x && ball[i].x > skadi.x - attackRange &&
                         ball[i]).y > skadi.y - skadi.height / 2 && 
                         ball[i].y < skadi.y + skadi.height / 2) {
                            ball[i].setVelocityY(-10);
                            ball[i].setVelocityX(-2);
                         }
                    
                }

                for(let i = 0; i < ballCount; i ++) {
                    if(skadiSide == 1 && 
                        (bill[i].x > skadi.x && bill[i].x < skadi.x + attackRange &&
                         bill[i]).y > skadi.y - skadi.height /2 && 
                         bill[i].y < skadi.y + skadi.height / 2) {
                            bill[i].setVelocityY(-10);
                            bill[i].setVelocityX(2);
                         }
                    
                }

                for(let i = 0; i < ballCount; i ++) {
                    if(skadiSide == 0 && 
                        (bill[i].x < skadi.x && bill[i].x > skadi.x - attackRange &&
                         bill[i]).y > skadi.y - skadi.height / 2 && 
                         bill[i].y < skadi.y + skadi.height / 2) {
                            bill[i].setVelocityY(-10);
                            bill[i].setVelocityX(-2);
                         }   
                }
            }, 800);
        }

        // mouse event
        if(mouseFlag) { // 100 675 200 775 / 10 500-90 100
            let pointX;
            let pointY;
            if(isMobile) {
                pointX = pointer.worldX - 50;
                pointY = -1 * pointer.worldY + 450;
                
                if(pointer.worldX < 10){
                    controlBall.x = 10;
                }else if(pointer.worldX >= 10 && pointer.worldX <= 90){
                    controlBall.x = pointer.worldX;
                }else {
                    controlBall.x = 90;
                }

                if(pointer.worldY < 410) {
                    controlBall.y = 410;
                }else if(pointer.worldY >= 410 && pointer.worldY <= 490) {
                    controlBall.y = pointer.worldY;
                }else {
                    controlBall.y = 490;
                }
                
            }else {
                pointX = pointer.worldX - 150;
                pointY = -1 * pointer.worldY + 725;

                if(pointer.worldX < 100){
                    controlBall.x = 100;
                    locationFlag = 1;
                }else if(pointer.worldX >= 100 && pointer.worldX <= 200){
                    controlBall.x = pointer.worldX;
                }else {
                    controlBall.x = 200;
                }

                if(pointer.worldY < 675) {
                    controlBall.y = 675;
                }else if(pointer.worldY >= 675 && pointer.worldY <= 775) {
                    controlBall.y = pointer.worldY;
                }else {
                    controlBall.y = 775;
                }
            }
            if(pointX < 0 && Math.abs(pointY) <= -1 * pointX) {
                locationFlag = 1;
            }else if(pointX > 0 && Math.abs(pointY) <= pointX) {
                locationFlag = 2;
            }else if(pointY > 0 && pointY > Math.abs(pointX)) {
                locationFlag = 3;
            }else if(pointY < 0 && -1 * pointY > Math.abs(pointX)) {
                locationFlag = 4;
            }else {
                locationFlag = 0;
            }
        }else {
            if(isMobile) { 
                controlBall.x = 50;
                controlBall.y = winSizeH - 50;
            }else {
                controlBall.x = 150;
                controlBall.y = 725;
            }
            
        }
    }

}


const config = {
    type: Phaser.WEBGL,
    parent: 'phaser-example',
    width: winSizeW,
    height: winSizeH,
    backgroundColor: '#2d2d2d',
    physics: {
        default: 'matter',
        matter: {
            debug: false,
            enableSleeping: true,
            gravity : {x : 0, y : 0.3}
        }
    },
    scene: Example
};

const game = new Phaser.Game(config);