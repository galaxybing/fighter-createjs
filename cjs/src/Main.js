var cjs= createjs;
var stg= new cjs.Stage("canvasStage");
var sWidth, sHeight, queue, spriteConfig, starCount= 200, speed= 5;// 场景配置变量

var player, lives= 5, livesTxt, score= 0, scoreTxt;// 玩家主战机
var enemyClip=[];// 敌战机类型
var starArr= [], fires= [], enemy= [], fireAble= true, breakAble= true;

/* 配置，控制变量 */
const ARROW_KEY_LEFT = 37;//键盘左键
const ARROW_KEY_RIGHT = 39;//键盘右键
const SPACE_KEY = 32;//键盘空格
var leftKeyDown = false, rightKeyDown = false;

function init(){
    sWidth = stg.canvas.width;
    sHeight = stg.canvas.height;
    queue = new cjs.LoadQueue(true);
    // 配置插件
    cjs.Sound.registerPlugins([cjs.HTMLAudioPlugin]);// createjs.WebAudioPlugin, createjs.FlashAudioPlugin
    queue.installPlugin(cjs.Sound);

    queue.on("complete", completeLoadedHandler);
    queue.loadManifest([
        {id:"sprite", src:"assets/images/20150808203650401.png"},
        {id:"shot", src:"assets/sounds/shot.mp3"},
        //{id:"explosion", src:"assets/sounds/explosion.mp3"}
    ]);

    cjs.Ticker.on("tick", updateStageHandler);

    console.log("cjs->", cjs);
}

/*
 * 预加载资源完成后， completeLoadedHandler
 * 一）创建各个画面元素
 *
 */
function completeLoadedHandler(){
    buildGame();//3.创建游戏界面，包括星空，玩家飞机，敌机，计分版等
    setContorl();//4.设置按键控制，让玩家可以左右移动并发射子弹

    startGame();//5.进入游戏循环，使用tick事件实现游戏的变化，发展
}

function buildGame(){
    buildSpace();//星空背景
    buildMsg();//计分，和 玩家剩余的飞机数
    buildPlayer();//创建玩家的飞机
    buildEnemy();//创建敌机
}

function buildSpace(){
    // 因为暂时没有找到星空图片；
    // 所以，用1px的圆来作为星星，设置alpha用透明度来表示星星的远近不同，并且远处的星星运动速度慢，而近处的速度快； updateStar() 中
    var i, star, w, h, alpha;
    for (i=0; i<starCount; i++){
        starSky = new cjs.Container();
        star = new cjs.Shape();
        w = Math.floor(Math.random()*stg.canvas.width);
        h = Math.floor(Math.random()*stg.canvas.height);
        alpha = Math.random();
        star.graphics.beginFill("#FFF").drawCircle(0,0,1);
        star.x = w;
        star.y = h;
        star.alpha = alpha;
        starSky.addChild(star);
        starArr.push(star);//
        stg.addChild(starSky);
    }
}
function buildPlayer(){
    var data = {
        images:[queue.getResult("sprite")],
        frames:[
            [0,0,37,42],
            [37,0,42,42],
            [79,0,37,42],
            [116,0,42,42],
            [158,0,37,42],
            [0,70,64,64],
            [64,70,64,64],
            [128,70,64,64],
            [192,70,64,64],
            [256,70,64,64],
            [320,70,64,64],
            [384,70,64,64],
            [448,70,64,64],
            [512,70,64,64],
            [576,70,64,64],
            [640,70,64,64],
            [704,70,64,64],
            [768,70,64,64]
        ],
        animations:{
            ship:0,
            enemy1:1,
            enemy2:2,
            enemy3:3,
            enemy4:4,
            exp:{
                frames:[5,6,7,8,9,10,11,12,13,14,15,16],
                speed:.5
            }
        }
    };
    spriteConfig = new cjs.SpriteSheet(data);
    cjs.Sound.registerSound("assets/sounds/explosion.mp3", "explosion");// ?使用
    player = new cjs.Sprite(spriteConfig, "ship");
    player.x = sWidth/2 -player.getBounds().width/2;
    player.y = sHeight - player.getBounds().height;
    stg.addChildAt(player,0);// 使用 addChildAt 添加元素，可以设置元素的顺序，0表示玩家的飞机永远在最上层
}

/* 控制键盘交互 */
function setContorl(){
    window.onkeydown = handleKeyDown;
    window.onkeyup = handleKeyUp;

}
function handleKeyDown(e){
    e = !e ? window.event : e;
    switch(e.keyCode){
        case ARROW_KEY_LEFT:
            leftKeyDown = true;
            break;
        case ARROW_KEY_RIGHT:
            rightKeyDown = true;
            break;
    }
}

function handleKeyUp(e){
    e = !e ? window.event : e;
    switch(e.keyCode){
        case ARROW_KEY_LEFT:
            leftKeyDown = false;
            break;
        case ARROW_KEY_RIGHT:
            rightKeyDown = false;
            break;
        case SPACE_KEY:
            playFire();
    }
}
function playFire(){
    if(fireAble){
    var fire = new createjs.Shape();
    fire.graphics.beginFill("#FF0").drawRect(0,0,2,5).endFill();
    fire.x = player.x + 18;
    fire.y = 658;
    cjs.Sound.play("shot");// 直接调用你在 preload 中载入的声音 shot
    fires.push(fire);
    stg.addChild(fire);}
}

/* 显示游戏文本消息 */
function buildMsg(){
    livesTxt = new createjs.Text("lives:" + lives, "20px Times", "#FFF");
    livesTxt.y = 5;
    livesTxt.x = 10;
    stg.addChild(livesTxt);

    scoreTxt = new createjs.Text("score:" + score, "20px Times", "#FFF");
    scoreTxt.y =5;
    scoreTxt.x = sWidth - 100;
    stg.addChild(scoreTxt);
}

/* 创建敌机对象 */
function buildEnemy() {
    var i, e1, e2, e3, e4;
    e1 = new cjs.Sprite(spriteConfig, "enemy1");
    e2 = new cjs.Sprite(spriteConfig, "enemy2");
    e3 = new cjs.Sprite(spriteConfig, "enemy3");
    e4 = new cjs.Sprite(spriteConfig, "enemy4");
    enemyClip.push(e1, e2, e3, e4);
    buildEnemis();
}

function buildEnemis(){
    var i, j=0, en, en1;
    for(i=0;i<4;i++){
        en = enemyClip[i].clone();
        //for(j=0;j<6;j++){/* 该循环的作用是增强每架敌机的生命力，去掉循环则生命力值为 1 */
            en1 = en.clone();// 复制元素后，对临时容器进行赋值
            enemy.push(en1);
            cjs.Tween.get(en1).wait(5000*i).to({x:100,y:800}, 5000, cjs.Ease.sineInOut(-2))
            stg.addChild(en1);
        //}
    }
}

/*
 *
 * 二）
     让星空、子弹动起来
     判断子弹是否与敌机相撞
     敌机是否与玩家相撞
     更新得分
 *
 */
function updateStageHandler(event) {
    updateStar();
    updatePlayer();
    updateEnemy();
    updateFire();
    updateMsg();

    checkGame();
    stg.update(event);
}
function updateStar(){
    var i,star,yPos;
    for(i=0;i<200;i++){
        star = starArr[i];
        yPos = star.y + 5*star.alpha;// 远处的(即透明度低)星星运动速度慢，而近处的速度快
        if(yPos >= stg.canvas.height){
            yPos = 0;
        }
        star.y = yPos;
    }
}
function updatePlayer(){
    var nextX = player.x;
    if(leftKeyDown){
        nextX = player.x - speed;
        if(nextX<0){
            nextX = 0;
        }
    }else if(rightKeyDown){
        nextX = player.x + speed;
        if(nextX > (sWidth - 37)){
            nextX = sWidth - 37;
        }
    }

    player.x = nextX;
}
function updateFire(){
    var i, nextY, fire;
    for (i=0;i<fires.length;i++){
        fire = fires[i];
        nextY = fire.y - 10;

        //if(nextY == 0 ){//如果子弹飞出屏幕或被碰撞后销毁时，在子弹数组中去掉，并在stage中删除元素
        if(nextY <= 0 ){
            fires.splice(i,1)
            stg.removeChild(fire);
            continue;
        }
        fire.y = nextY;
    }
}

//敌机与子弹的碰撞检测，碰撞成功则得分 +10
function updateEnemy(){
    var i, j, fire, enemyTemp, enemy1;
    for(var m=0;m<enemy.length;m++){
        enemyTemp = enemy[m];

        var tempx = enemyTemp.x;
        var tempy = enemyTemp.y;

        if(tempy>=sHeight+100 || tempx>=sWidth-100){// 移除 enemy 元素，同时从数组和画布里面；
            enemy.splice(m,1);
            stg.removeChild(enemyTemp);
        }
    }

    for(i=0;i<fires.length;i++){
        // console.log("fires.length->", fires.length);
        for(j=0;j<enemy.length;j++){
            /*
            if(!fires[i]){
                console.log("i->", i);// 1
                break;
            }
            */
            fire = fires[i];
            enemy1 = enemy[j];

            var fx = fire.x;// Cannot read property 'x' of undefined
            var fy = fire.y;

            var ex = enemy1.x;
            var ey = enemy1.y;
            var ew = enemy1.getBounds().width;
            var eh = enemy1.getBounds().height;
            /* 需要放置在外层，不然清除操作，只会触发，在已经发射子弹的条件下
            if(ey>=sHeight+100 || ex>=sWidth-100){// 移除 enemy 元素，同时从数组和画布里面；
                enemy.splice(j,1);
                stg.removeChild(enemy1);
            }
            */

            // 通过图形矩形区域交叉条件，判定碰撞情况
            if(fy < ey+eh && fy > ey // 垂直方向交叉
                && fx>ex && fx<ex+ew // 水平方向交叉
                && ey > 0){
                score += 10;

                fire.y= -0;//不直接通过 fires.splice(i,1) 移除 ; 而是让其满足在 updateFire 函数的移除条件，即可
                //stg.removeChild(fire);

                enemy.splice(j,1);
                stg.removeChild(enemy1);

                // enemy1.y= sHeight+100; // 而这里的通过更新 y 位置，则会马上被外面的 Tween 函数中的 to 刷新 y 值覆盖掉；
                                          // 所以，单次击中时不会生效；

                cjs.Sound.play("explosion");// 触发音效
                var exp1 = new cjs.Sprite(spriteConfig, "exp");// 触发爆破动画帧播放
                exp1.x = ex;
                exp1.y = ey;
                exp1.addEventListener('animationend',function(e){
                    stg.removeChild(e.target);
                });
                stg.addChild(exp1);
            }

        }
    }
}
function updateMsg(){
    scoreTxt.text = "score:" + score;
    livesTxt.text = "lives:" + lives;
}

/*
 *
 * 三）循环游戏
     召唤新机
     继续添加敌机
 *
 */
function startGame(){

}
function checkGame(){
    /*
    检查一下游戏运行的状态，如果所有敌机都被消灭或者已经飞出屏幕，再添加新的敌机;
    敌机与玩家的碰撞情况：玩家飞机被撞毁后，召唤新的战机，并在一段时间内无敌
    */
    var i,en,pl;
    if(enemy.length==0){
        buildEnemis();// 继续添加敌机
    }
    pl = player;
    plx = player.x;
    ply = player.y;
    plw = player.getBounds().width;
    plh = player.getBounds().height;

    for(i=0;i<enemy.length;i++){
        en = enemy[i];
        enx = en.x;
        eny = en.y;
        enw = en.getBounds().width;
        enh = en.getBounds().height;

        if(eny+enh<sHeight+100 && eny+enh > ply && enx > plx && enx < plx+plw && breakAble){
            stg.removeChild(player);
            pl = null;
            player = null;
            fireAble = false;
            breakAble = false;
            setTime = setTimeout(createPlayer,10);// 召唤新的战机
            break;
        }

    }

}
function createPlayer(){
    clearTimeout(setTime);
    player = new cjs.Sprite(spriteConfig, "ship");
    player.x = sWidth/2- player.getBounds().width;
    player.y = sHeight - player.getBounds().height;
    player.alpha = 0;
    cjs.Tween.get(player).to({alpha:1}, 1000, cjs.Ease.getPowIn(1)).call(function(){
        lives--;
        fireAble = true;
        breakAble = true;
    });
    stg.addChildAt(player,0);
}

init();
