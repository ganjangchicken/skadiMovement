let winSizeW = 800;
let winSizeH = 800;
let isMobile = false;

function checkMobile() {
    if(window.innerWidth < 800) {
        isMobile = true;
        winSizeW = 360;
        winSizeH = 500;
    }
}
checkMobile();

