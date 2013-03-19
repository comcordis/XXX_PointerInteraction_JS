
var XXX_PointerInteraction_DragCircleWithin = function (circleElement, allowDefaultActions, pointer)
{
	XXX_PointerInteraction_DragCircleWithin.parentConstructor.call(this);	
	
	if (!(pointer == 'mouse' || pointer == 'touch'))
	{
		pointer = XXX_HTTP_Browser.pointerInterface == 'touch' ? 'touch' : 'mouse';
	}
	
	this.pointer = pointer;
	
	this.circleCenter =
	{
		x: 0,
		y: 0
	};
	
	this.lastAngle = 0;
	this.angleOffset = 0;
	this.ignoreLastAngle = true;
	
	this.dragStartTimestamp = 0;
	
	this.elements = {};
	this.elements.circleElement = XXX_DOM.get(circleElement);
	
	this.width = XXX_Type.makeInteger(XXX_CSS.getStyle(this.elements.circleElement, 'width'));
	this.height = XXX_Type.makeInteger(XXX_CSS.getStyle(this.elements.circleElement, 'height'));
	
	this.halfWidth = XXX_Number.floor(this.width / 2);
	this.halfHeight = XXX_Number.floor(this.height / 2);
	
	this.circleCenter = XXX_CSS_Position.getRelativeToPage(this.elements.circleElement);
		
	var XXX_PointerInteraction_DragCircleWithin_instance = this;
	
	this.eventFunctions = {};
	this.eventFunctions.start = function (nativePointerEvent)
	{
		if (!allowDefaultActions)
		{
			nativePointerEvent.preventDefault();
			nativePointerEvent.stopPropagation();
		}
		
		XXX_PointerInteraction_DragCircleWithin_instance.startDrag(nativePointerEvent);
	};
	this.eventFunctions.change = function (nativePointerEvent)
	{
		if (!allowDefaultActions)
		{
			nativePointerEvent.preventDefault();
			nativePointerEvent.stopPropagation();
		}
		
		XXX_PointerInteraction_DragCircleWithin_instance.drag(nativePointerEvent);
	};
	this.eventFunctions.end = function (nativePointerEvent)
	{
		if (!allowDefaultActions)
		{
			nativePointerEvent.preventDefault();
			nativePointerEvent.stopPropagation();
		}
		
		XXX_PointerInteraction_DragCircleWithin_instance.endDrag(nativePointerEvent);
	};
	
	this.elements.circleElement._XXX_PointerInteraction_DragCircleWithin = this;
	
	this.addStartListener();
};

XXX.extendClass(XXX_EventDispatcher, XXX_PointerInteraction_DragCircleWithin);


XXX_PointerInteraction_DragCircleWithin.prototype.addStartListener = function ()
{
	switch (this.pointer)
	{
		case 'touch':
			XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.circleElement, 'touchStart', this.eventFunctions.start);
			break;
		case 'mouse':
			XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.circleElement, 'mouseDown', this.eventFunctions.start);
			break;
	}
};

XXX_PointerInteraction_DragCircleWithin.prototype.addChangeAndEndListeners = function ()
{
	switch (this.pointer)
	{
		case 'touch':
			XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.circleElement, 'touchMove', this.eventFunctions.change);
			XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.circleElement, 'touchEnd', this.eventFunctions.end);
			break;
		case 'mouse':
			XXX_DOM_NativeEventDispatcher.addEventListener(XXX_DOM.getBody(), 'mouseMove', this.eventFunctions.change);
			XXX_DOM_NativeEventDispatcher.addEventListener(XXX_DOM.getBody(), 'mouseUp', this.eventFunctions.end);
			break;
	}
};

XXX_PointerInteraction_DragCircleWithin.prototype.removeChangeAndEndListeners = function ()
{
	switch (this.pointer)
	{
		case 'touch':
			XXX_DOM_NativeEventDispatcher.removeEventListener(this.elements.circleElement, 'touchMove', this.eventFunctions.change);
			XXX_DOM_NativeEventDispatcher.removeEventListener(this.elements.circleElement, 'touchEnd', this.eventFunctions.end);
			break;
		case 'mouse':
			XXX_DOM_NativeEventDispatcher.removeEventListener(XXX_DOM.getBody(), 'mouseMove', this.eventFunctions.change);
			XXX_DOM_NativeEventDispatcher.removeEventListener(XXX_DOM.getBody(), 'mouseUp', this.eventFunctions.end);
			break;
	}
};

XXX_PointerInteraction_DragCircleWithin.prototype.getAngle = function ()
{
	return this.lastAngle;
};

XXX_PointerInteraction_DragCircleWithin.prototype.getAngleOffset = function ()
{
	return this.angleOffset;
};

XXX_PointerInteraction_DragCircleWithin.prototype.getDirection = function ()
{
	return this.angleOffset >= 0 ? 'clockWise' : 'counterClockWise';
};

XXX_PointerInteraction_DragCircleWithin.prototype.getDragTime = function ()
{
	return (XXX_TimestampHelpers.getCurrentMillisecondTimestamp() - this.dragStartTimestamp) / 1000;
};

// In angle per second
XXX_PointerInteraction_DragCircleWithin.prototype.getDragSpeed = function ()
{
	var dragTime = this.getDragTime();
	
	var speed = this.angleOffset / dragTime;
	
	return speed;
};

XXX_PointerInteraction_DragCircleWithin.prototype.getPointerPosition = function (nativePointerEvent)
{
	var pointerPosition;
	
	switch (this.pointer)
	{
		case 'touch':
			pointerPosition = XXX_Device_TouchSurface.getPositionRelativeToPage(nativePointerEvent);
			break;
		case 'mouse':
			pointerPosition = XXX_Device_Mouse.getPositionRelativeToPage(nativePointerEvent);
			break;
	}
	
	return pointerPosition;
};

XXX_PointerInteraction_DragCircleWithin.prototype.startDrag = function (nativePointerEvent)
{	
	this.dispatchEventToListeners('dragCircleWithinStart');
	
	this.drag(nativePointerEvent);
	
	this.addChangeAndEndListeners();
};

XXX_PointerInteraction_DragCircleWithin.prototype.drag = function (nativePointerEvent)
{
	var pointerPosition = this.getPointerPosition(nativePointerEvent);
		
	var angle = XXX_Calculate.getAngle(this.circleCenter.x + this.halfWidth, this.circleCenter.y + this.halfHeight, pointerPosition.x, pointerPosition.y);
	
	if (this.ignoreLastAngle)
	{
		this.angleOffset = 0;
				
		this.ignoreLastAngle = false;
	}
	else
	{
		this.angleOffset = XXX_Calculate.processAngleOffset(this.angleOffset, this.lastAngle, angle);
	}
	
	this.lastAngle = angle;
		
	this.dispatchEventToListeners('dragCircleWithinMove');
};

XXX_PointerInteraction_DragCircleWithin.prototype.endDrag = function (nativePointerEvent)
{
	if (this.pointer != 'touch')
	{
		this.drag(nativePointerEvent);
	}
		
	this.ignoreLastAngle = true;
		
	this.removeChangeAndEndListeners();
	
	this.dispatchEventToListeners('dragCircleWithinEnd');
};
