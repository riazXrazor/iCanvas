/**
 * iCanvas Library is wrapper over canvas, Make working with canvas a little bit
 * easier for developing small games that dosen't require a engine
 *
 * @version 0.0.1
 * @license GNU Lesser General Public License, http://www.gnu.org/copyleft/lesser.html
 * @author  Riaz Ali Laskar
 * @created 2016-09-14
 * @link    http://github.com/riazXrazor/icanvas
 */


;(function(window,document,undefined){

    if(!window || !document)
    {
        throw Error("window and document objects are required, which cound not be found");
    }

var PI = Math.PI;

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
    this.canvas.setAttribute('id',name || Date.now());
    this.canvas.width = width || 800;
    this.canvas.height = height || 600;
    this.context = this.canvas.getContext(type || '2d');


    // private properties
    this._animationLoop = null;
    this._drawQueue = [];
    this._stopLooping = false;

    this._grid = [];
    this._size = 25;

    this._regionsToClear = [];
    this._temporaryArray = [];

    this._init(this.context);
  }

    iCanvas.prototype.reset = function(){
        // reset properties

        this._drawQueue = [];
        this._stopLooping = false;

        this._grid = [];
        this._size = 25;

        this._regionsToClear = [];
        this._temporaryArray = [];

        if(this._animationLoop)
        {
            window.cancelAnimationFrame(this._animationLoop);
            this._animationLoop = null;
        }
        return this;
    };

    iCanvas.prototype.cleanCanvas = function(){
        this._regionsToClear = [];
        this.context.save();
        this.context.setTransform(1, 0, 0, 1, 0, 0);   // reset the origine to 0,0

        this.context.clearRect(0, 0, this.canvas.width,this.canvas.height);

        this.context.restore();

        return this;
    };

    iCanvas.prototype.getWidth = function(){
        return this.canvas.width;
    };
    iCanvas.prototype.getHeight = function(){
        return this.canvas.height;
    };
/**
 * [setGridSize description]
 * @param {[type]} size [description]
 */
  iCanvas.prototype.setGridSize = function(size){
      this._size = size || this._size;
      this._grid = [];
      this._generateGrids();
  };

    iCanvas.prototype.drawGrid = function(color){
        this._drawQueue.push(function(){
            this.context.strokeStyle = color || '#ccc';
           for(var i = 0; i < this._grid.length ; i++)
           {
               for(var j = 0; j < this._grid[i].length ; j++)
               {
                   this.context.strokeRect(this._grid[i][j].x,this._grid[i][j].y,this._size,this._size);
               }
           }
        });
    };

/**
 * [onCanvas description]
 * @param  {[type]} x [description]
 * @param  {[type]} y [description]
 * @return {[type]}   [description]
 */
  iCanvas.prototype.onCanvas = function(x,y){
      return (x > 0 && y > 0 && x < this.canvas.width && y < this.canvas.height)
   };

/**
 * [background description]
 * @param  {[type]} color [description]
 * @param  {[type]} x     [description]
 * @param  {[type]} y     [description]
 * @param  {[type]} w     [description]
 * @param  {[type]} h     [description]
 * @return {[type]}       [description]
 */
  iCanvas.prototype.background = function(color,x,y,w,h){

          this._drawQueue.push(function(){
                    this.context.save();
                    this.context.setTransform(1, 0, 0, 1, 0, 0);   // reset the origine to 0,0
                    this.context.fillStyle = color;
                    this.context.fillRect(x || 0, y || 0, w || this.canvas.width,h || this.canvas.height);
                    this.context.restore();
          });

     return this;
  };


/**
 * [clear description]
 * @param  {[type]} x [description]
 * @param  {[type]} y [description]
 * @param  {[type]} w [description]
 * @param  {[type]} h [description]
 * @return {[type]}   [description]
 */
  iCanvas.prototype.clear = function(x,y,w,h){

        this._drawQueue.push(function(){
           this._regionsToClear = [];
                this.context.save();
                this.context.setTransform(1, 0, 0, 1, 0, 0);   // reset the origine to 0,0

                this.context.clearRect(x || 0, y || 0, w || this.canvas.width,h || this.canvas.height);

                this.context.restore();
        });

     return this;
  };

    iCanvas.prototype.clean = function(x,y,w,h){

            this.context.save();
            this.context.setTransform(1, 0, 0, 1, 0, 0);   // reset the origine to 0,0

            this.context.clearRect(x || 0, y || 0, w || this.canvas.width,h || this.canvas.height);

            this.context.restore();

        return this;
    };

/**
 * [smartClear description]
 * @return {[type]} [description]
 */
  iCanvas.prototype.smartClear = function(){
      this._drawQueue.push(function(){
            var i = this._regionsToClear.length;

            while (i--) {
              var g = this._regionsToClear[i];
              if(g.i && g.j)
              {
                this._grid[g.i][g.j].drawn = 0;
                this.context.clearRect(g.x,g.y,this._size,this._size);
              }
              else {
                g.x -= 1;
                g.y -= 1;
                g.w += 2;
                g.h += 2;

                if(g.x < 0) {g.x = -1};
                if(g.y < 0) {g.y = -1};

                this.context.clearRect(g.x,g.y,g.w,g.h);
              }
            }

            this._regionsToClear = [];

      });
    return this;
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

    return this;
  };

/**
 * [render description]
 * @return {[type]} [description]
 */
iCanvas.prototype.render = function(){
  for (var i = 0; i < this._drawQueue.length; i++) {
    this._drawQueue[i].call(this,this.context,this.canvas);
  }
};

/**
 * [update description]
 * @return {[type]} [description]
 */
  iCanvas.prototype.update = function(){

      this.render();

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
  iCanvas.prototype.stop = function(clearqueue){
      var clearqueue = clearqueue || 0;
    if(clearqueue)
    {
        this._drawQueue = [];
    }
    this._stopLooping = true;
     return this;
  };

/**
 * [showDrawnRegion description]
 * @param  {[type]} color [description]
 * @return {[type]}       [description]
 */
  iCanvas.prototype.showDrawnRegion = function(color){


    this._drawQueue.push(function(){
          var i = this._regionsToClear.length;
         this.context.save();
         this.context.globalCompositeOperation = 'destination-over';
         this.context.fillStyle = color || "#ccc";
                  while (i--) {
                    var g = this._regionsToClear[i];
                    if(g.i && g.j)
                    {
                      this.context.fillStyle = color || "#ccc";
                      this.context.fillRect(g.x,g.y,this._size,this._size);
                    }
                    else {
                      g.x -= 1;
                      g.y -= 1;
                      g.w += 2;
                      g.h += 2;

                      if(g.x < 0) {g.x = -1};
                      if(g.y < 0) {g.y = -1};

                      this.context.fillStyle = color || "#ccc";
                      this.context.fillRect(g.x,g.y,g.w,g.h);
                    }
                  }

        this.context.restore();
    });

  return this;
  };


  /**
   * [init description]
   * @param  {[Obj]} ctx [description]
   * @return {[Obj]}     [description]
   */
    iCanvas.prototype._init = function(ctx){
      var self = this;
          /**
           * [line description]
           * @param  {[type]} x1 [description]
           * @param  {[type]} y1 [description]
           * @param  {[type]} x2 [description]
           * @param  {[type]} y2 [description]
           * @return {[type]}    [description]
           */
          this.line = function(x1,y1,x2,y2){

            ctx.moveTo(x1,y1);
            ctx.lineTo(x2,y2);

            self._regionDrawnTo(x1,y1,x2,y2);

          };


          /**
           * [circle description]
           * @param  {[type]} x      [description]
           * @param  {[type]} y      [description]
           * @param  {[type]} radius [description]
           * @return {[type]}        [description]
           */
          this.circle = function(x,y,radius){

            ctx.arc(x,y,radius ,PI*2,false);

            this._regionsToClear.push({
              x :  x > 0 ? x - radius : x + radius,
              y :  y > 0 ? y - radius : y + radius,
              w : radius * 2,
              h : radius * 2
            });

          };


          /**
           * [rect description]
           * @param  {[type]} x [description]
           * @param  {[type]} y [description]
           * @param  {[type]} w [description]
           * @param  {[type]} h [description]
           * @return {[type]}   [description]
           */
          this.rect = function(x,y,w,h){

                ctx.rect(x,y,w,h);

                this._regionsToClear.push({
                  x : x,
                  y : y,
                  w : w,
                  h : h
                });

          };

      /**
       * [strokeRect description]
       * @param  {[type]} x [description]
       * @param  {[type]} y [description]
       * @param  {[type]} w [description]
       * @param  {[type]} h [description]
       * @return {[type]}   [description]
       */
      this.strokeRect = function(x,y,w,h){

        ctx.strokeRect(x,y,w,h);

        this._regionsToClear.push({
          x : x,
          y : y,
          w : w,
          h : h
        });

      };

      /**
       * [fillRect description]
       * @param  {[type]} x [description]
       * @param  {[type]} y [description]
       * @param  {[type]} w [description]
       * @param  {[type]} h [description]
       * @return {[type]}   [description]
       */
      this.fillRect = function(x,y,w,h){

                ctx.fillRect(x,y,w,h);

                this._regionsToClear.push({
                  x : x,
                  y : y,
                  w : w,
                  h : h
                });
      };

           this.strokeText = function(text,x,y,mx){

             var w = ctx.measureText(text).width;
             var h = ctx.font.split('px')[0];
             var align = ctx.textAlign;
             var basline = ctx.textBaseline;
             if(mx)
             {
                ctx.strokeText(text,x,y,mx);
             } else {
               ctx.strokeText(text,x,y);
             }

             if(align === 'center')
             {
                 x = x-w/2;
             }
             else if( align === 'end' || align == 'right')
             {
                 x = x-w;
             }


             if(basline === 'middle')
             {
                y = y-h/2;
             }
             else if( basline === 'alphabetic' || basline == 'bottom')
             {
                 y = y-h;
             }




             this._regionsToClear.push({
               x : x,
               y : y,
               w : w,
               h : h
             });

            self._fillInnerGrids(centerx,centery);

           };
      /**
       * [fillText description]
       * @param  {[type]} text [description]
       * @param  {[type]} x    [description]
       * @param  {[type]} y    [description]
       * @param  {[type]} mx   [description]
       * @return {[type]}      [description]
       */
     this.fillText = function(text,x,y,mx){

             var w = ctx.measureText(text).width;
             var h = ctx.font.split('px')[0];
             var align = ctx.textAlign;
             var basline = ctx.textBaseline;
             if(mx)
             {
                ctx.fillText(text,x,y,mx);
             } else {
               ctx.fillText(text,x,y);
             }


             if(align === 'center')
             {
                 x = x-w/2;
             }
             else if( align === 'end' || align == 'right')
             {
                 x = x-w;
             }


             if(basline === 'middle')
             {
                y = y-h/2;
             }
             else if( basline === 'alphabetic' || basline == 'bottom')
             {
                 y = y-h;
             }

             this._regionsToClear.push({
               x : x,
               y : y,
               w : w,
               h : h
             });

           };
      /**
       * [drawImage description]
       * @param  {[type]} image [description]
       * @param  {[type]} sx    [description]
       * @param  {[type]} sy    [description]
       * @param  {[type]} sw    [description]
       * @param  {[type]} sh    [description]
       * @param  {[type]} dx    [description]
       * @param  {[type]} dy    [description]
       * @param  {[type]} dw    [description]
       * @param  {[type]} dh    [description]
       * @return {[type]}       [description]
       */
      this.drawImage = function(image, sx, sy, sw, sh, dx, dy, dw, dh){

              var w = image.width;
              var h = image.height;

              if(dx && dy)
              {
                var x = dx;
                var y = dy;

                  if(dw && dh)
                  {
                    w = dw;
                    h = dh;
                    ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
                  }
                  else {
                    ctx.drawImage(image, sx, sy, sw, sh, dx, dy);
                  }

              } else {
                var x = sx;
                var y = sy;
                if(sw && sh)
                {
                  w = sw;
                  h = sh;
                  ctx.drawImage(image, sx, sy, sw, sh);
                }
                else {
                  ctx.drawImage(image, sx, sy);
                }

              }


              this._regionsToClear.push({
                x : x,
                y : y,
                w : w,
                h : h
              });

        };

        this._generateGrids();

    };

/**
 * [_generateGrids description]
 * @return {[type]} [description]
 */
  iCanvas.prototype._generateGrids = function(){
    for (var i = 0; i < (this.canvas.width/this._size); i++) {
      this._grid[i] = [];
        for (var j = 0; j < (this.canvas.height/this._size); j++) {
          this._grid[i][j] = {
            x : this._size*i,
            y : this._size*j,
            i : i,
            j : j,
            drawn : 0
          };
        }
    }
  };

/**
 * [_normalizeX description]
 * @return {[type]} [description]
 */
  iCanvas.prototype._normalizeX = function(){
    return this.context.lineWidth+this.context.shadowOffsetX+this.context.shadowBlur;
  };

/**
 * [_normalizeY description]
 * @return {[type]} [description]
 */
  iCanvas.prototype._normalizeY = function(){
    return this.context.lineWidth+this.context.shadowOffsetY+this.context.shadowBlur;
  };

/**
 * [_regionDrawn description]
 * @param  {[type]} x [description]
 * @param  {[type]} y [description]
 * @return {[type]}   [description]
 */
  iCanvas.prototype._regionDrawn = function(x,y){

    var i = ~~(x / this._size);
    var j = ~~(y / this._size);

    if(!this.onCanvas(x,y)) return false;
    if(this._grid[i][j].drawn) return false;

    this._grid[i][j].drawn = 1;

        this._regionsToClear.push(this._grid[i][j]);

    var neighbours = this._getNeighbours(this._grid[i][j]);

    for (var k = 0; k < neighbours.length; k++) {
      if(!neighbours[k].drawn)
      {
         x = ~~(neighbours[k].x / this._size);
         y = ~~(neighbours[k].y / this._size);
         this._grid[x][y].drawn = 1;
        this._regionsToClear.push(this._grid[x][y]);
      }
    }


  return this;
  };

/**
 * [_getNeighbours description]
 * @param  {[type]} g [description]
 * @return {[type]}   [description]
 */
iCanvas.prototype._getNeighbours = function(g){

 var neighbours = [];
 var cx = g.x;
 var cy = g.y;
 var i = ~~(cx / this._size);
 var j = ~~(cy / this._size);


  var rowLimit = this._grid.length-1;
  var columnLimit = this._grid[0].length-1;

   for(var x = Math.max(0, i-2); x <= Math.min(i+2, rowLimit); x++) {
     for(var y = Math.max(0, j-2); y <= Math.min(j+2, columnLimit); y++) {
       if(x !== i || y !== j && this.onCanvas(x,y)) {
         neighbours.push(this._grid[x][y]);
       }
     }
   }

return neighbours;
};

/**
 * [_regionDrawnTo description]
 * @param  {[type]} x1 [description]
 * @param  {[type]} y1 [description]
 * @param  {[type]} x2 [description]
 * @param  {[type]} y2 [description]
 * @return {[type]}    [description]
 */
  iCanvas.prototype._regionDrawnTo = function(x1,y1,x2,y2){
          var dx = x2 - x1;
          var dy = y2 - y1;
          var x = (x1 + dx * 0.05);
          var y = (y1 + dy * 0.05);

             this._temporaryArray.push([x,y]);

          var dis = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
          if(dis >= 1)
          {
              this._regionDrawn(x,y);
              this._regionDrawnTo(x,y,x2,y2);
          }
          else {
                return;
          }

    };

    /**
     * exports the module
     */
    if( typeof exports !== 'undefined' ) {
        if( typeof module !== 'undefined' && module.exports ) {
            exports = module.exports = iCanvas
        }
        exports.iCanvas = iCanvas
    }
    else {
        window.iCanvas = iCanvas
    }
}(window,document));
