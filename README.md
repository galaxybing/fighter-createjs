关于 lanix516的系列博客《如何使用Createjs来编写HTML5游戏》的游戏制作示例
＝

##最初的框架：7 个步骤
-
```Javascript
var stage;
function init(){
    //1.导入资源，并在资源加载完成后调用处理函数handleComplete  
    //2.创建舞台stage
}

function handleComplete(){
    buildGame();//3.创建游戏界面，星空，玩家飞机，敌机，计分版等
    setContorl();//4.设置按键控制，让玩家可以左右移动并发射子弹
    startGame();//5.进入游戏循环，使用tick事件实现游戏的变化，发展
}

function startGame(event){
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener('tick',function(){
        updateGame();//6.更新游戏元素的位置，更新分数等
        checkGame();//7.检查游戏中的元素是否发生碰撞，敌机被击落，还是飞出屏幕等等
        stage.update();
    });
}
```

###[如何使用Createjs来编写HTML5游戏（六）完成一个简单的打飞机游戏（上）][lanix516-article-6]
所有的创建工作
###[如何使用Createjs来编写HTML5游戏（七）完成一个简单的打飞机游戏（下）][lanix516-article-7]
后面要做的就是：
* 让星空、子弹动起来
* 判断子弹是否与敌机相撞
* 敌机是否与玩家相撞
* 更新得分
* 继续添加敌机

##Cannot read property 'x' of undefined
-
在 updateEnemy() 这个方法中，一颗子弹（fires数组中只有一个fire元素）打中一个敌方飞机后，fires数组没有元素了报错（Uncaught TypeError: Cannot read property 'x' of undefined）解决：
```
这个属于两个嵌套循环执行时，一旦进入了内层时，它的条件就不受外面循环控制了。
即，在内层循环时去掉数组元素对象，但内部循环没有跳出；具体处理，在 updateEnemy 函数内部：
```Javascript
   ...
    fire.y= -0;// 不直接通过 fires.splice(i,1) 移除 ; 而是让其满足在 updateFire 函数的移除条件，即可
    //stg.removeChild(fire);
    ...
```
--------------------------------------------------------------------------------
[lanix516-article-6]:http://blog.csdn.net/lanix516/article/details/47357747
[lanix516-article-7]:http://blog.csdn.net/lanix516/article/details/47382401
