/**
 * Created by ShirleyYang on 16/8/27.
 */
//创建飞船模块
function Craft(id,power,energy) {
    this.energy=100;
    this.energyAdd=energy;
    this.energyConsume=power[1];
    this.state='';
    this.id=id;
    this.speed=power[0];
    this.timer='';
    this.timerStop='';//这个timer变量是监视在launch时的时间间隔函数
    this.BUStimer='';//用于检查是否正在调用busSystem函数
}
/**
 * 创建飞船
 */
Craft.prototype.create=function () {
    this.state="stop";
    var div=$("<div></div>");//创建存放的飞船的div,内部包括span和div(能量条)两个子元素
    div.addClass("inner");
    var span=$("<span></span>");
    span.addClass("energy");
    span.text(this.energy);
    var energyDiv=$("<div></div>");
    energyDiv.addClass("energy");
    div.append(span);
    div.append(energyDiv);
    var divOuter=$("<div></div>");//将包含飞船的div再放到一个div中,单纯为了实现样式
    divOuter.addClass("craft"+this.id);
    divOuter.append(div);
    var parent=$("[class|='orbit']").get(this.id);
    $(parent).append(divOuter);
};
/**
 * 获取BUS格式的命令
 * @param BUS
 */
Craft.prototype.getCommand=function (BUS) {
    //首先将命令通过Adapter解码
    var commandOrder=this.Adapter(BUS);
    var id=commandOrder[0];
    var command=commandOrder[1];
    //每一个飞船都会接受下达的指令,先判断命令是不是发给自己的
    if(this.id===id){
        var orbit=$("[class|='orbit']").get(this.id);
        var orbitTarget=this;
        switch (command){
            case "create":
                this.create();
                this.busSystem();
                break;
            case "explode":
                this.state='explode';
                setTimeout(function(){
                    mediator.getInfo(orbitTarget.Adapter());
                    mediator.craftArray.splice(index,1);
                },1000);
                $(orbit).empty();
                var index=mediator.craftArray.indexOf(this);

                clearInterval(this.BUStimer);
                this.BUStimer='';
                clearInterval(this.timer);
                this.timer='';
                clearInterval(this.timerStop);
                this.timer='';//飞船销毁的时候,所有的时间间隔函数也都随之停止
                break;
            case "launch":
                this.state="launch";
                this.timer=this.launch(orbit);
                break;
            case "stop":
                this.state='stop';
                this.timerStop=this.stop(orbit);
                break;
        }
    }
};
/**
 * 启动飞船
 * @param orbit
 * @returns {number}
 */
Craft.prototype.launch=function (orbit) {
    var deg;
    var pattern=/\d{1,3}[.]\d{0,3}/;  //设定一个正则表达式
    var speed=parseFloat((this.speed*0.1*360/(230+this.id*80)/2/Math.PI).toFixed(3));
    var craft=$(orbit).children();//获得craft
    var craftInner=$(craft).children();
    var energyNumber=$(craftInner).children().first();
    var energyBar=$(craftInner).children().last();
    var obj=this;
    //如果之前是停飞状态要先将停飞状态的时间间隔函数取消
    if(this.timerStop){
        clearInterval(this.timerStop);
        this.timerStop='';
    }
    if($(craft).css("transform")=="none"){ //检查一下craft div是不是已经有了transform属性
        deg=0;  //没有的话将角度设置为0
    }else {
        deg=parseFloat(pattern.exec($(craft).attr("style"))[0]); //若已有transform属性,则将其值提取出来,注意转换成数字,如果度数超过4位数就会
        if(deg>360){
            deg -= 360;
        }
    }
    var timerLaunch=setInterval(function () {
        obj.timer=timerLaunch;

        $(craft).css("transform","rotate("+deg+"deg)");//设定飞船飞行动画
        deg=deg+speed;//每隔0.1s增加一定的角度
        var energyText=obj.getEnergy(obj.state);//获取能量值
        // if(energyText=="-0"){
        //     energyText=0;
        // }
        $(energyNumber).text(energyText);//将获得的能量值反应到飞船上
        $(energyBar).css("height",0.4*energyText+"px");//将获得的能量值反应到飞船的能量条上
        if(energyText<=30){
            $(energyBar).css("background-color","rgb(200,59,56)");//若能量低于30%,提示变红
        }
        if(energyText==0){
            // clearInterval(timerLaunch);
            // $(".craft-orbit"+(obj.id+1)+" input[name='launch']").val("飞行");
            obj.stop(orbit,timerLaunch);//将状态更改为stop开始调用stop时的命令
        }
    },100);
    return timerLaunch;
};
/**
 * 停飞飞船
 * 当飞行状态更改为停止时,有两种情况,一个是能量耗尽,更改为停止;另外一种是本来是在飞行中,更改为停止
 * @param orbit
 * @returns {number}
 */
Craft.prototype.stop=function (orbit) {
    if(this.timer){//判断是不是原来是正在飞行的飞船
        clearInterval(this.timer);
        this.timer='';
    }
    var craft=$(orbit).children();//获得craft,可能同一个轨道不止一个craft
    var craftInner=$(craft).children();
    var energyNumber=$(craftInner).children().first();
    var energyBar=$(craftInner).children().last();
    var obj=this;
    var timerStop=setInterval(function () {
        obj.timerStop=timerStop;

        var energyText=obj.getEnergy(obj.state);//获取能量值
        if(energyText=="-0"){
            energyText=0;
        }
        $(energyNumber).text(energyText);//将获得的能量值反应到飞船上
        $(energyBar).css("height",0.4*energyText+"px");//将获得的能量值反应到飞船的能量条上
        if(energyText<=30){
            $(energyBar).css("background-color","rgb(200,59,56)");//若能量低于30%,能量条变红
        }else {
            $(energyBar).css("background-color","#2fa06c");
        }
        // if(energyText==100){
        //     clearInterval(timerStop);
        // }
    },100);
    return timerStop;
};


/**
 * 获取能量
 * @param state
 * @returns {string}
 */
Craft.prototype.getEnergy=function (state) {
    if(state=="launch"){//如果状态是飞行
        this.energy=this.energy-(this.energyConsume-this.energyAdd)*0.1;
        if(this.energy<0){
            this.energy=0;
            // 能量变为0的时候,将飞行的控制器的时间时间取消
            clearInterval(this.timer);
            this.timer='';
            this.state='stop';
            var launchBtn=$("[class|='craft']").get(this.id);//获得这个飞船对应的飞行按钮
            $(launchBtn.lastElementChild).val("飞行");
        }
    }else {
        this.energy=this.energy+this.energyAdd*0.1;
        if(this.energy>100){
            this.energy=100;
            clearInterval(this.timerStop);
            this.timerStop='';
        }

    }
    return this.energy.toFixed(0);

};
//调用的时候不添加BUS说明是要生成二进制代码,如果加BUS说明是要解码
/**
 * 解码或者编码
 * @param BUS
 * @returns {*}
 * @constructor
 */
Craft.prototype.Adapter=function (BUS) {
    var returnData;
    if(BUS){
        var id=parseInt(BUS.slice(0,2),2);
        var commandNumber=BUS.slice(2);
        var command;
        switch (commandNumber){
            case "00":
                command="create";
                break;
            case "01":
                command="explode";
                break;
            case "10":
                command="launch";
                break;
            case "11":
                command="stop";
                break;
        }
        return [id,command];
    }else{
        var idNumber=this.id.toString(2);
        if(idNumber.length===1){
            idNumber = '0' + idNumber;
        }
        switch (this.state){
            case 'explode':
                commandNumber='1100';
                break;
            case 'stop':
                commandNumber='0010';
                break;
            case 'launch':
                commandNumber='0001';
                break;
            default:
                break;
        }
        var energy=parseInt(this.energy).toString(2);
        if(energy.length<8){
            for(var i=8-energy.length;i>0;i--){
                energy = '0'+energy;
            }
        }
        returnData='00'+idNumber+commandNumber+energy;
        return returnData;
    }

};

/**
 * 定义飞船的BUS系统
 */

Craft.prototype.busSystem=function () {
    var craft = this;
    var stateCode="";//用于记录飞船状态的二维码
    this.BUStimer = setInterval(function () {
        stateCode=craft.Adapter();
        mediator.getInfo(stateCode);
    }, 1000);
};


