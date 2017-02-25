# iCanvas
iCanvas is wrapper over canvas, Make working 
with canvas a little bit easier as we all know 
anyone who has worked with canvas , its quite a low level 
api its sometimes quite hard to maintain state of canvas,
 i was facing the same problem when i decided to make a 
 mini game in canvas , so i first created a small library
 which woukd make working with canvas a breez.
 
 ## Installation
 ```$xslt
<script src="iCanvas.js"></script>
```
or
```$xslt
npm install iCanvas
```
 ## Usage
 #### Basic

 ```
        // create the iCanvas object
		var canvas1 = new iCanvas();
		// append to body 
		canvas1.appendTo(document.body);
		// draws function
		canvas1.draw(function (ctx, canvas) {
			ctx.fillStyle = "#000";
			ctx.strokeStyle = "#000";
		    ctx.fillRect(200,200,200,200);
		    ctx.arc(100,100,20,0,Math.PI*2,false);
		    ctx.stroke();
        });
```
 #### Basic chaining
```$xslt
		var canvas1 = new iCanvas();
        canvas1.appendTo(document.body);
        canvas1.draw(function (ctx, canvas) {
            ctx.fillStyle = "#000";
            ctx.strokeStyle = "#000";
            ctx.fillRect(200,200,200,200);
        })
          .draw(function (ctx, canvas) {
                ctx.fillStyle = "#000";
                ctx.strokeStyle = "#000";
                ctx.arc(100,100,20,0,Math.PI*2,false);
                ctx.stroke();
            }).render();
```

 #### callback handler
```$xslt
        var canvas1 = new iCanvas();
        canvas1.appendTo(document.body);
        canvas1.draw(handler1)
			   .draw(handler2)
			   .render();

        function handler1 (ctx, canvas) {
            ctx.fillStyle = "#000";
            ctx.strokeStyle = "#000";
            ctx.fillRect(200,200,200,200);
        }

        function handler2(ctx, canvas) {
            ctx.fillStyle = "#000";
            ctx.strokeStyle = "#000";
            ctx.arc(100,100,20,0,Math.PI*2,false);
            ctx.stroke();
        }
```
 #### Animation or Game loop
 ```$xslt
        var pos = 0;
		var canvas1 = new iCanvas();
		canvas1.appendTo(document.body);
		canvas1.background("#000").draw(function (ctx, canvas) {
			ctx.fillStyle = "#fff";
			ctx.strokeStyle = "#fff";
			pos++;
		    ctx.fillRect(100+pos,100,100,100);
        }).update();
```
 #### Methods
 ```$xslt
        var canvas1 = new iCanvas();
		canvas1.appendTo(document.body);
		canvas1.draw(function (ctx, canvas) {
			ctx.clearRect(0,0,canvas.width,canvas.height)
		    ctx.fillStyle = "#000";
			ctx.strokeStyle = "#000";
            this.strokeText("Hello",300,100);
            ctx.stroke();

		    this.circle(100,100,20);
		    this.line(100,100,400,400);
		    this.rect(500,100,100,100)

			ctx.stroke();
        }).render();
```
### 
I am still working on the documentation, and fixing any 
bugs.  


