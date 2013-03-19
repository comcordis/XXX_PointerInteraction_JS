var XXX_PointerInteraction_DragWithin = function (withinElement, withinMode, allowDefaultActions, pointer)
{
	XXX_PointerInteraction_DragWithin.parentConstructor.call(this);	
	
	if (!(withinMode == 'element' || withinMode == 'page' || withinMode == 'viewPort'))
	{
		withinMode = 'element';
	}
	
	this.withinMode = withinMode;
	
	if (!(pointer == 'mouse' || pointer == 'touch'))
	{
		pointer = XXX_HTTP_Browser.pointerInterface == 'touch' ? 'touch' : 'mouse';
	}
	
	this.pointer = pointer;
	
	this.pointerPosition =
	{
		start:
		{
			x: 0,
			y: 0
		},
		current:
		{
			x: 0,
			y: 0
		}
	};
	
	this.dragStartTimestamp = 0;
	
	this.elements = {};	
	this.elements.withinElement = XXX_DOM.get(withinElement);
	
	var XXX_PointerInteraction_DragWithin_instance = this;
	
	this.eventFunctions = {};
	this.eventFunctions.start = function (nativePointerEvent)
	{
		if (!allowDefaultActions)
		{
			nativePointerEvent.preventDefault();
			nativePointerEvent.stopPropagation();
		}
		
		XXX_PointerInteraction_DragWithin_instance.startDrag(nativePointerEvent);
	};
	this.eventFunctions.change = function (nativePointerEvent)
	{
		if (!allowDefaultActions)
		{
			nativePointerEvent.preventDefault();
			nativePointerEvent.stopPropagation();
		}
		
		XXX_PointerInteraction_DragWithin_instance.drag(nativePointerEvent);
	};
	this.eventFunctions.end = function (nativePointerEvent)
	{
		if (!allowDefaultActions)
		{
			nativePointerEvent.preventDefault();
			nativePointerEvent.stopPropagation();
		}
		
		XXX_PointerInteraction_DragWithin_instance.endDrag(nativePointerEvent);
	};
	
	this.addStartListener();
};

XXX.extendClass(XXX_EventDispatcher, XXX_PointerInteraction_DragWithin);

XXX_PointerInteraction_DragWithin.prototype.getPosition = function ()
{
	return this.pointerPosition.current;
};

XXX_PointerInteraction_DragWithin.prototype.getStartPosition = function ()
{
	return this.pointerPosition.start;
};

XXX_PointerInteraction_DragWithin.prototype.getCurrentPosition = function ()
{
	return this.pointerPosition.current;
};

XXX_PointerInteraction_DragWithin.prototype.getDragTime = function ()
{
	return (XXX_TimestampHelpers.getCurrentMillisecondTimestamp() - this.dragStartTimestamp) / 1000;
};

// In pixels per second
XXX_PointerInteraction_DragWithin.prototype.getDragSpeed = function ()
{
	var dragTime = this.getDragTime();
	
	var distance = XXX_Calculate.getDiagonalDistance(this.pointerPosition.start.x, this.pointerPosition.start.y, this.pointerPosition.current.x, this.pointerPosition.current.y);
	
	var speed = distance / dragTime;
	
	return speed;
};

XXX_PointerInteraction_DragWithin.prototype.getDirection = function ()
{
	var direction = XXX_Calculate.getAngleDirection(this.pointerPosition.start.x, this.pointerPosition.start.y, this.pointerPosition.current.x, this.pointerPosition.current.y);
	
	return direction;
};

XXX_PointerInteraction_DragWithin.prototype.addStartListener = function ()
{
	switch (this.pointer)
	{
		case 'touch':
			XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.withinElement, 'touchStart', this.eventFunctions.start);
			break;
		case 'mouse':
			XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.withinElement, 'mouseDown', this.eventFunctions.start);
			break;
	}
};

XXX_PointerInteraction_DragWithin.prototype.addChangeAndEndListeners = function ()
{
	switch (this.pointer)
	{
		case 'touch':
			XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.withinElement, 'touchMove', this.eventFunctions.change);
			XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.withinElement, 'touchEnd', this.eventFunctions.end);
			break;
		case 'mouse':
			XXX_DOM_NativeEventDispatcher.addEventListener(XXX_DOM.getBody(), 'mouseMove', this.eventFunctions.change);
			XXX_DOM_NativeEventDispatcher.addEventListener(XXX_DOM.getBody(), 'mouseUp', this.eventFunctions.end);
			break;
	}
};

XXX_PointerInteraction_DragWithin.prototype.removeChangeAndEndListeners = function ()
{
	switch (this.pointer)
	{
		case 'touch':
			XXX_DOM_NativeEventDispatcher.removeEventListener(this.elements.withinElement, 'touchMove', this.eventFunctions.change);
			XXX_DOM_NativeEventDispatcher.removeEventListener(this.elements.withinElement, 'touchEnd', this.eventFunctions.end);
			break;
		case 'mouse':
			XXX_DOM_NativeEventDispatcher.removeEventListener(XXX_DOM.getBody(), 'mouseMove', this.eventFunctions.change);
			XXX_DOM_NativeEventDispatcher.removeEventListener(XXX_DOM.getBody(), 'mouseUp', this.eventFunctions.end);
			break;
	}
};

XXX_PointerInteraction_DragWithin.prototype.getPointerPosition = function (nativePointerEvent)
{
	var pointerPosition;
	
	switch (this.pointer)
	{
		case 'touch':
			switch (this.withinMode)
			{
				case 'page':
					pointerPosition = XXX_Device_TouchSurface.getPositionWithinPage(nativePointerEvent);
					break;
				case 'viewPort':
					pointerPosition = XXX_Device_TouchSurface.getPositionWithinViewPort(nativePointerEvent);
					break;
				case 'element':
					pointerPosition = XXX_Device_TouchSurface.getPositionWithinElement(nativePointerEvent, this.elements.withinElement);
					break;
			}
			break;
		case 'mouse':
			switch (this.withinMode)
			{
				case 'page':
					pointerPosition = XXX_Device_Mouse.getPositionWithinPage(nativePointerEvent);
					break;
				case 'viewPort':
					pointerPosition = XXX_Device_Mouse.getPositionWithinViewPort(nativePointerEvent);
					break;
				case 'element':
					pointerPosition = XXX_Device_Mouse.getPositionWithinElement(nativePointerEvent, this.elements.withinElement);
					break;
			}
			break;
	}
	
	return pointerPosition;
};

XXX_PointerInteraction_DragWithin.prototype.startDrag = function (nativePointerEvent)
{
	var pointerPosition = this.getPointerPosition(nativePointerEvent);
	
	this.pointerPosition =
	{
		start: pointerPosition,
		current: pointerPosition
	};
	
	this.dispatchEventToListeners('dragWithinStart');
		
	this.drag(nativePointerEvent);
	
	this.addChangeAndEndListeners();
};

XXX_PointerInteraction_DragWithin.prototype.drag = function (nativePointerEvent)
{
	var pointerPosition = this.getPointerPosition(nativePointerEvent);
	
	this.pointerPosition.current = pointerPosition;
	
	this.dispatchEventToListeners('dragWithinMove');
		
};

XXX_PointerInteraction_DragWithin.prototype.endDrag = function (nativePointerEvent)
{
	// Doesn't work for touch because the touch has left the touch surface already, so nothing to read.
	if (this.pointer != 'touch')
	{
		this.drag(nativePointerEvent);
	}
	
	this.removeChangeAndEndListeners();
	
	this.dispatchEventToListeners('dragWithinEnd');
};