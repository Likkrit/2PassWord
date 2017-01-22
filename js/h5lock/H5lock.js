(function(){
        window.H5lock = function(obj){
            this.height = obj.height || 320;
            this.width = obj.width || 320;
            this.chooseType = obj.chooseType || 3;
            this.container = obj.container;
            this.resetTime = obj.resetTime || 300;
            this.strokeStyle = obj.strokeStyle || 'rgba(0,0,0,.3)' || '#CFE6FF';
            this.fillStyle = obj.fillStyle || 'rgba(0,0,0,.3)' || '#CFE6FF';
            this.backgroundStyle = obj.backgroundStyle || '#fff' || '#305066';
            this.successStyle = obj.successStyle || '#21BA45' || '#2CFF26';
            this.failStyle = obj.failStyle || '#DB2828' || 'red';
            this.unlockFunc = obj.unlock || function(){};
            this.resetFunc = obj.reset || function(){};
            this.type = obj.type || 'unlock';
        };


        H5lock.prototype.drawCle = function(x, y) { // 初始化解锁密码面板
            this.ctx.strokeStyle = this.strokeStyle;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.r, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
        }
        H5lock.prototype.drawPoint = function() { // 初始化圆心

            for (var i = 0 ; i < this.lastPoint.length ; i++) {
                this.ctx.fillStyle = this.fillStyle;
                this.ctx.beginPath();
                this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r / 2, 0, Math.PI * 2, true);
                this.ctx.closePath();
                this.ctx.fill();
            }
        }
        H5lock.prototype.drawStatusPoint = function(type) { // 初始化状态线条
            for (var i = 0 ; i < this.lastPoint.length ; i++) {
                this.ctx.strokeStyle = type;
                this.ctx.beginPath();
                this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r, 0, Math.PI * 2, true);
                this.ctx.closePath();
                this.ctx.stroke();
            }
        }
        H5lock.prototype.drawLine = function(po, lastPoint) {// 解锁轨迹
            this.ctx.beginPath();
            this.ctx.lineWidth = 3;
            this.ctx.moveTo(this.lastPoint[0].x, this.lastPoint[0].y);
            // console.log(this.lastPoint.length);
            for (var i = 1 ; i < this.lastPoint.length ; i++) {
                this.ctx.lineTo(this.lastPoint[i].x, this.lastPoint[i].y);
            }
            this.ctx.lineTo(po.x, po.y);
            this.ctx.stroke();
            this.ctx.closePath();
        }

        H5lock.prototype.createCircle = function() {// 创建解锁点的坐标，根据canvas的大小来平均分配半径
            var n = this.chooseType;
            var count = 0;
            this.r = this.ctx.canvas.width / (2 + 4 * n);// 公式计算
            this.lastPoint = [];
            this.arr = [];
            this.restPoint = [];
            var r = this.r;
            var offsetX =  3 * r;
            var offsetY =  (this.height / 2) - 4 * r;
            for (var i = 0 ; i < n ; i++) {
                for (var j = 0 ; j < n ; j++) {
                    count++;
                    var obj = {
                        x: j * 4 * r + offsetX,
                        y: i * 4 * r + offsetY,
                        index: count
                    };
                    this.arr.push(obj);
                    this.restPoint.push(obj);
                }
            }
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            for (var i = 0 ; i < this.arr.length ; i++) {
                this.drawCle(this.arr[i].x, this.arr[i].y);
            }
            //return arr;
        }
        H5lock.prototype.getPosition = function(e) {// 获取touch点相对于canvas的坐标
            var rect = e.currentTarget.getBoundingClientRect();
            var po = {
                x: (e.touches ? e.touches[0].clientX : e.clientX) - rect.left,
                y: (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
              };
            return po;
        }
        H5lock.prototype.update = function(po) {// 核心变换方法在touchmove时候调用
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

            for (var i = 0 ; i < this.arr.length ; i++) { // 每帧先把面板画出来
                this.drawCle(this.arr[i].x, this.arr[i].y);
            }
            this.drawPoint(this.lastPoint);// 每帧花轨迹
            this.drawLine(po , this.lastPoint);// 每帧画圆心
            for (var i = 0 ; i < this.restPoint.length ; i++) {
                if (Math.abs(po.x - this.restPoint[i].x) < this.r && Math.abs(po.y - this.restPoint[i].y) < this.r) {
                    // this.drawPoint(this.restPoint[i].x, this.restPoint[i].y);
                    this.lastPoint.push(this.restPoint[i]);
                    this.restPoint.splice(i, 1);
                    break;
                }
            }
        }
        H5lock.prototype.checkPass = function(psw1, psw2) {// 检测密码
            var p1 = '',
            p2 = '';
            for (var i = 0 ; i < psw1.length ; i++) {
                p1 += psw1[i].index + psw1[i].index;
            }
            for (var i = 0 ; i < psw2.length ; i++) {
                p2 += psw2[i].index + psw2[i].index;
            }
            return psw1 === psw2;
        }
        H5lock.prototype.encodePass = function(psw) {// 检测密码
          if(typeof CryptoJS){
            return CryptoJS.MD5(psw + '000').toString();
          }
          else{
            return psw + '000';
          }
        }
        H5lock.prototype.storePass = function(psw) {// touchend结束之后对密码和状态的处理
          var password = '';
          for (var i = 0 ; i < psw.length ; i++) {
              password += psw[i].index + psw[i].index;
          }
            if (this.pswObj.step == 1) { // 输入了一次,这次是第二次
                if (this.checkPass(this.pswObj.fpassword, this.encodePass(password))) {
                    this.pswObj.step = 2;
                    this.pswObj.spassword = this.pswObj.fpassword;
                    document.getElementById('h5title').innerHTML = '密码保存成功';
                    this.drawStatusPoint(this.successStyle);
                    window.localStorage.setItem('h5lock_password', this.pswObj.spassword);
                    this.resetFunc(password);
                } else { // 第二次输入不一致，清空
                  document.getElementById('h5title').innerHTML = '两次不一致，重新输入';
                    this.drawStatusPoint(this.failStyle);
                    delete this.pswObj.step;
                }
            } else if (this.pswObj.step == 2) { // 待解锁状态
                if (this.checkPass(this.pswObj.spassword, this.encodePass(password))) {
                    document.getElementById('h5title').innerHTML = '解锁成功';
                    this.drawStatusPoint(this.successStyle);
                    this.unlockFunc(password);
                } else {
                    this.drawStatusPoint(this.failStyle);
                    document.getElementById('h5title').innerHTML = '解锁失败';
                }
            } else { // 第一次输入密码
                this.pswObj.step = 1;
                this.pswObj.fpassword = this.encodePass(password);
                document.getElementById('h5title').innerHTML = '再次输入';
            }
        }
        H5lock.prototype.makeState = function() {
            if (this.pswObj.step == 2) {
                // document.getElementById('updatePassword').style.display = 'block';
                // document.getElementById('title').innerHTML = '请解锁';
            } else if (this.pswObj.step == 1) {
                // document.getElementById('updatePassword').style.display = 'none';
            } else {
                // document.getElementById('updatePassword').style.display = 'none';
            }
        }
        H5lock.prototype.setChooseType = function(type){
            chooseType = type;
            init();
        }
        H5lock.prototype.updatePassword = function(){
            window.localStorage.removeItem('h5lock_password');
            this.pswObj = {};
            // document.getElementById('title').innerHTML = '绘制解锁图案';
            this.reset();
        }
        H5lock.prototype.removeH5lock = function(){
          var wrap = document.getElementById(this.container);
          var canvas = document.getElementById("canvas");
          if(canvas){
            wrap.removeChild(canvas);
          }
        }
        H5lock.prototype.initDom = function(){
          var wrap = document.getElementById(this.container);
          var bg = 'background: ' + this.backgroundStyle + ';';
          var str = '<div id="h5title">绘制解锁图案</div><canvas id="canvas" width="' + this.width + '" height="' + this.height + '" style="' + bg + 'display: inline-block;margin-top: 15px;"></canvas>';
          // wrap.setAttribute('style','position: absolute;top:0;left:0;right:0;bottom:0;');
          wrap.innerHTML = str;
          return;
            var wrap = document.createElement('div');
            var str = '<h4 id="title" class="title">绘制解锁图案</h4>'+
                      '<a id="updatePassword" style="position: absolute;right: 5px;top: 5px;color:#fff;font-size: 10px;display:none;">重置密码</a>'+
                      '<canvas id="canvas" width="300" height="300" style="background-color: #305066;display: inline-block;margin-top: 15px;"></canvas>';
            wrap.setAttribute('style','position: absolute;top:0;left:0;right:0;bottom:0;');
            wrap.innerHTML = str;
            document.body.appendChild(wrap);
        }
        H5lock.prototype.init = function() {
            this.initDom();
            this.pswObj = window.localStorage.getItem('h5lock_password') ? {
                step: 2,
                spassword: window.localStorage.getItem('h5lock_password')
            } : {};
            if(this.type != "unlock"){
              this.pswObj = {};
            }
            this.lastPoint = [];
            this.makeState();
            this.touchFlag = false;
            this.checkingFlag = false;
            this.canvas = document.getElementById('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.createCircle();
            this.bindEvent();
        }
        H5lock.prototype.reset = function() {
            this.touchFlag = false;
            this.checkingFlag = false;
            this.makeState();
            this.createCircle();
        }
        H5lock.prototype.bindEvent = function() {
            var self = this;

            this.canvas.addEventListener("touchstart", function (e) {
                e.preventDefault();// 某些android 的 touchmove不宜触发 所以增加此行代码
                 var po = self.getPosition(e);
                 for (var i = 0 ; i < self.arr.length ; i++) {
                    if (Math.abs(po.x - self.arr[i].x) < self.r && Math.abs(po.y - self.arr[i].y) < self.r) {
                        self.touchFlag = true;
                        self.drawPoint(self.arr[i].x,self.arr[i].y);
                        self.lastPoint.push(self.arr[i]);
                        self.restPoint.splice(i,1);
                        break;
                    }
                 }
             }, false);
             this.canvas.addEventListener("touchmove", function (e) {
                if (self.touchFlag) {
                    self.update(self.getPosition(e));
                }
             }, false);
             this.canvas.addEventListener("touchend", function (e) {
                 if (self.touchFlag) {
                     self.touchFlag = false;
                     self.storePass(self.lastPoint);
                     setTimeout(function(){
                        self.reset();
                    }, self.resetTime);
                 }


             }, false);
             document.addEventListener('touchmove', function(e){
                // e.preventDefault();
             },false);

             // PC
             this.canvas.addEventListener("mousedown", function (e) {
                 e.preventDefault();
                 var po = self.getPosition(e);
                  for (var i = 0 ; i < self.arr.length ; i++) {
                     if (Math.abs(po.x - self.arr[i].x) < self.r && Math.abs(po.y - self.arr[i].y) < self.r && !self.checkingFlag) {
                         self.touchFlag = true;
                         self.drawPoint(self.arr[i].x,self.arr[i].y);
                         self.lastPoint.push(self.arr[i]);
                         self.restPoint.splice(i,1);
                         break;
                     }
                  }
              }, false);
              this.canvas.addEventListener("mousemove", function (e) {
                 if (self.touchFlag) {
                   self.update(self.getPosition(e));
                 }
              }, false);
              this.canvas.addEventListener("mouseup", function (e) {
                  if (self.touchFlag) {
                      self.checkingFlag = true;
                      self.touchFlag = false;
                      self.storePass(self.lastPoint);
                      setTimeout(function(){
                         self.reset();
                     }, self.resetTime);
                  }

              }, false);
              document.addEventListener('mousemove', function(e){
                //  e.preventDefault();
              },false);
            //  document.getElementById('updatePassword').addEventListener('click', function(){
                //  self.updatePassword();
              // });
        }
})();
