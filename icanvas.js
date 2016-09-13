/**
 * iCanvas is wrapper over canvas, Make working with canvas a little bit easier
 *
 * @version 0.0.1
 * @license GNU Lesser General Public License, http://www.gnu.org/copyleft/lesser.html
 * @author  Riaz Ali Laskar
 * @created 2016-09-14
 * @link    http://github.com/riazXrazor/icanvas
 */


;(function(window,document,undefined){

/**
 * [iCanvas description]
 * @param  {[String]} name   [description]
 * @param  {[Number]} width  [description]
 * @param  {[Number]} height [description]
 * @param  {[String]} type   [description]
 * @return {[Obj]}        [description]
 */
  function iCanvas(name,width,height,type)
  {
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('id',name || new Date().getTime());
    this.width = this.canvas.width = width || 800;
    this.height = this.canvas.height = height || 600;
    this.context = this.canvas.getContext(type || '2d');

    // private properties
    this._animationLoop = null;
    this._drawQueue = [];
    this._stopLooping = false;

    this.init(this.context);
  }

/**
 * [init description]
 * @param  {[Obj]} ctx [description]
 * @return {[Obj]}     [description]
 */
  iCanvas.prototype.init = function(ctx){

    if(!this.context.line)
    {
        this.context.line = function(x1,y1,x2,y2){
          ctx.beginPath();
          ctx.moveTo(x1,y1);
          ctx.lineTo(x2,y2);
          ctx.closePath();
        };
    }

    if(!this.context.circle)
    {
        this.context.circle = function(x,y,radius){
          ctx.beginPath();
          ctx.arc(x,y,radius,Math.PI*2,false);
          ctx.closePath();
        };
    }

  };

/**
 * [appendTo description]
 * @param  {[Obj]} domElement [description]
 * @return {[Obj]}            [description]
 */
  iCanvas.prototype.appendTo = function(domElement){
    domElement.appendChild(this.canvas);

    return this;
  };

/**
 * [draw description]
 * @param  {Function} callback   [description]
 * @param  {[Bool]}   addToQueue [description]
 * @return {[Obj]}              [description]
 */
  iCanvas.prototype.draw = function(callback,addToQueue){

    var queue = true;

    if(typeof addToQueue !== 'undefined')
    {
      queue = addToQueue;
    }

    if(queue)
    {
      this._drawQueue.push(callback);
    }
    callback(this.context,this);

    this.context.stroke();
    this.context.fill();

    return this;
  };

/**
 * [update description]
 * @return {[type]} [description]
 */
  iCanvas.prototype.update = function(){
  var self = this;
     self._drawQueue.forEach(function(callback){
        callback(self.context,self);
      });

      this.context.stroke();
      this.context.fill();

  this._animationLoop = window.requestAnimationFrame(iCanvas.prototype.update.bind(this),this.canvas);
  if(this._stopLooping)
  {
    window.cancelAnimationFrame(this._animationLoop);
    this._stopLooping = false;
  }
  return this;
  };

/**
 * [stop description]
 * @return {[type]} [description]
 */
  iCanvas.prototype.stop = function(){
    this._stopLooping = true;
     return this;
  };




 window.iCanvas = iCanvas;
}(window,document,undefined));
