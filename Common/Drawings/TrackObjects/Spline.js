"use strict";

var K=1/4;

var mt=0, lt=1, cb=2, cl=3;

function SplineCommandMoveTo(x, y)
{
    this.id = 0;
    this.x = x;
    this.y = y;
}

function SplineCommandLineTo(x, y)
{
    this.id = 1;
    this.x = x;
    this.y = y;
    this.changeLastPoint = function(x, y)
    {
        this.x = x;
        this.y = y;
    }
}

function SplineCommandBezier(x1, y1, x2, y2, x3, y3)
{
    this.id = 2;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.x3 = x3;
    this.y3 = y3;

    this.changeLastPoint = function(x, y)
    {
        this.x3 = x;
        this.y3 = y;
        this.x2 = this.x1 + (this.x3 - this.x1)*0.5;
        this.y2 = this.y1 + (this.y3 - this.y1)*0.5;
    }
}

function Spline(drawingObjects, theme, master, layout, slide, pageIndex)
{

    this.pageIndex = pageIndex;
    this.path = [];

    this.drawingObjects = drawingObjects;

    this.Matrix = new CMatrix();
    this.TransformMatrix = new CMatrix();

    this.style  = CreateDefaultShapeStyle();

    var style = this.style;
    style.fillRef.Color.Calculate(theme, slide, layout, master, {R:0, G: 0, B:0, A:255});
    var RGBA = style.fillRef.Color.RGBA;
    var pen = theme.getLnStyle(style.lnRef.idx);
    style.lnRef.Color.Calculate(theme, slide, layout, master);
    RGBA = style.lnRef.Color.RGBA;

    if(pen.Fill)
    {
        pen.Fill.calculate(theme, slide, layout, master, RGBA);
    }

    this.pen = pen;
    this.splineForDraw = new SplineForDrawer(this);
    this.Draw = function(graphics)
    {
        graphics.SetIntegerGrid(false);
        graphics.transform3(this.Matrix);

        var shape_drawer = new CShapeDrawer();
        shape_drawer.fromShape(this, graphics);
        shape_drawer.draw(this);
    };
    this.draw = function(g)
    {
        if(isRealNumber(this.pageIndex) && g.SetCurrentPage)
        {
            g.SetCurrentPage(this.pageIndex);
        }
        this.splineForDraw.Draw(g);
        return;
        for(var i = 0; i < this.path.length; ++i)
        {
            var lastX, lastY;
            switch (this.path[i].id )
            {
                case 0 :
                {
                    g._m(this.path[i].x, this.path[i].y);
                    lastX = this.path[i].x;
                    lastY = this.path[i].y;
                    break;
                }
                case 1 :
                {
                    g._l(this.path[i].x, this.path[i].y);
                    lastX = this.path[i].x;
                    lastY = this.path[i].y;
                    break;
                }
                case 2 :
                {
                    g._c(this.path[i].x1, this.path[i].y1, this.path[i].x2, this.path[i].y2, this.path[i].x3, this.path[i].y3);
                    lastX = this.path[i].x3;
                    lastY = this.path[i].y3;
                    break;
                }
            }
        }
        g.ds();
    };

    this.getLeftTopPoint = function()
    {
        if(this.path.length < 1)
            return {x: 0, y: 0};

        var min_x = this.path[0].x;
        var max_x = min_x;
        var min_y = this.path[0].y;
        var max_y = min_y;
        var last_x = this.path[0].x, last_y = this.path[0].y;
        for(var index = 1; index < this.path.length; ++index)
        {
            var path_command = this.path[index];
            if(path_command.id === 1)
            {
                if(min_x > path_command.x)
                    min_x = path_command.x;
                if(max_x < path_command.x)
                    max_x = path_command.x;
                if(min_y > path_command.y)
                    min_y = path_command.y;
                if(max_y < path_command.y)
                    max_y = path_command.y;
            }
            else
            {
                var bezier_polygon = partition_bezier4(last_x, last_y, path_command.x1, path_command.y1, path_command.x2, path_command.y2, path_command.x3, path_command.y3, APPROXIMATE_EPSILON);
                for(var point_index = 1; point_index < bezier_polygon.length; ++point_index)
                {
                    var cur_point = bezier_polygon[point_index];
                    if(min_x > cur_point.x)
                        min_x = cur_point.x;
                    if(max_x < cur_point.x)
                        max_x = cur_point.x;
                    if(min_y > cur_point.y)
                        min_y = cur_point.y;
                    if(max_y < cur_point.y)
                        max_y = cur_point.y;

                }
            }
        }
        return {x: min_x, y: min_y};
    };

    this.getShape =  function(bWord, drawingDocument, drawingObjects)
    {
        var xMax = this.path[0].x, yMax = this.path[0].y, xMin = xMax, yMin = yMax;
        var i;

        var bClosed = false;
        if(this.path.length > 2)
        {
            var dx = this.path[0].x - this.path[this.path.length-1].x3;
            var dy = this.path[0].y - this.path[this.path.length-1].y3;
            if(Math.sqrt(dx*dx +dy*dy) < 3)
            {
                bClosed = true;
                this.path[this.path.length-1].x3 = this.path[0].x;
                this.path[this.path.length-1].y3 = this.path[0].y;
                if(this.path.length > 3)
                {
                    var vx = (this.path[1].x3 - this.path[this.path.length-2].x3)/6;
                    var vy = (this.path[1].y3 - this.path[this.path.length-2].y3)/6;
                }
                else
                {
                    vx = -(this.path[1].y3 - this.path[0].y)/6;
                    vy = (this.path[1].x3 - this.path[0].x)/6;
                }


                this.path[1].x1 = this.path[0].x +vx;
                this.path[1].y1 = this.path[0].y +vy;
                this.path[this.path.length-1].x2 = this.path[0].x -vx;
                this.path[this.path.length-1].y2 = this.path[0].y -vy;
            }
        }

        var min_x = this.path[0].x;
        var max_x = min_x;
        var min_y = this.path[0].y;
        var max_y = min_y;
        var last_x = this.path[0].x, last_y = this.path[0].y;
        for(var index = 1; index < this.path.length; ++index)
        {
            var path_command = this.path[index];
            if(path_command.id === 1)
            {
                if(min_x > path_command.x)
                    min_x = path_command.x;
                if(max_x < path_command.x)
                    max_x = path_command.x;
                if(min_y > path_command.y)
                    min_y = path_command.y;
                if(max_y < path_command.y)
                    max_y = path_command.y;

                last_x = path_command.x;
                last_y = path_command.y;
            }
            else
            {
                var bezier_polygon = partition_bezier4(last_x, last_y, path_command.x1, path_command.y1, path_command.x2, path_command.y2, path_command.x3, path_command.y3, APPROXIMATE_EPSILON);
                for(var point_index = 1; point_index < bezier_polygon.length; ++point_index)
                {
                    var cur_point = bezier_polygon[point_index];
                    if(min_x > cur_point.x)
                        min_x = cur_point.x;
                    if(max_x < cur_point.x)
                        max_x = cur_point.x;
                    if(min_y > cur_point.y)
                        min_y = cur_point.y;
                    if(max_y < cur_point.y)
                        max_y = cur_point.y;

                    last_x = path_command.x3;
                    last_y = path_command.y3;
                }
            }
        }

        xMin = min_x;
        xMax = max_x;
        yMin = min_y;
        yMax = max_y;
        var shape = new CShape();
        if(drawingObjects)
        {
            shape.setDrawingObjects(drawingObjects);
            shape.addToDrawingObjects();
        }
        shape.setSpPr(new CSpPr());
        shape.spPr.setParent(shape);
        shape.spPr.setXfrm(new CXfrm());
        shape.spPr.xfrm.setParent(shape.spPr);
        if(!bWord)
        {
            shape.spPr.xfrm.setOffX(xMin);
            shape.spPr.xfrm.setOffY(yMin);
        }
        else
        {
            shape.setWordShape(true);
            shape.spPr.xfrm.setOffX(0);
            shape.spPr.xfrm.setOffY(0);
        }
        shape.spPr.xfrm.setExtX(xMax-xMin);
        shape.spPr.xfrm.setExtY(yMax - yMin);
        shape.setStyle(CreateDefaultShapeStyle());

        var geometry = new Geometry();
        geometry.AddPathCommand(0, undefined, bClosed ? "norm": "none", undefined, xMax - xMin, yMax-yMin);
        geometry.AddRect("l", "t", "r", "b");
        for(i = 0;  i< this.path.length; ++i)
        {
            switch (this.path[i].id)
            {
                case 0 :
                {
                    geometry.AddPathCommand(1, (this.path[i].x - xMin) + "", (this.path[i].y - yMin) + "");
                    break;
                }
                case 1 :
                {
                    geometry.AddPathCommand(2, (this.path[i].x - xMin) + "", (this.path[i].y - yMin) + "");
                    break;
                }
                case 2:
                {
                    geometry.AddPathCommand(5, (this.path[i].x1 - xMin) + "", (this.path[i].y1 - yMin) + "", (this.path[i].x2 - xMin) + "", (this.path[i].y2 - yMin) + "", (this.path[i].x3 - xMin) + "", (this.path[i].y3 - yMin) + "");
                    break;
                }
            }
        }
        if(bClosed)
        {
            geometry.AddPathCommand(6);
        }
        shape.spPr.setGeometry(geometry);
        shape.setBDeleted(false);
        shape.recalculate();
        return shape;
    };

    this.addPathCommand = function(pathCommand)
    {
        this.path.push(pathCommand);
    };
    this.getBounds = function()
    {
        var boundsChecker = new  CSlideBoundsChecker();
        this.draw(boundsChecker);
        return boundsChecker.Bounds;
    };
}

function SplineForDrawer(spline)
{
    this.spline = spline;
    this.pen = spline.pen;
    this.brush = spline.brush;
    this.TransformMatrix = spline.TransformMatrix;
    this.Matrix = spline.Matrix;

    this.Draw = function(graphics)
    {
        graphics.SetIntegerGrid(false);
        graphics.transform3(this.Matrix);

        var shape_drawer = new CShapeDrawer();
        shape_drawer.fromShape(this, graphics);
        shape_drawer.draw(this);
    };

    this.draw = function(g)
    {
        g._e();
        for(var i = 0; i < this.spline.path.length; ++i)
        {
            var lastX, lastY;
            switch (this.spline.path[i].id )
            {
                case 0 :
                {
                    g._m(this.spline.path[i].x, this.spline.path[i].y);
                    lastX = this.spline.path[i].x;
                    lastY = this.spline.path[i].y;
                    break;
                }
                case 1 :
                {
                    g._l(this.spline.path[i].x, this.spline.path[i].y);
                    lastX = this.spline.path[i].x;
                    lastY = this.spline.path[i].y;
                    break;
                }
                case 2 :
                {
                    g._c(this.spline.path[i].x1, this.spline.path[i].y1, this.spline.path[i].x2, this.spline.path[i].y2, this.spline.path[i].x3, this.spline.path[i].y3);
                    lastX = this.spline.path[i].x3;
                    lastY = this.spline.path[i].y3;
                    break;
                }
            }
        }
        g.ds();
    }
}