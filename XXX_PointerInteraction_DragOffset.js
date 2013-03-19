var XXX_PointerInteraction_DragOffset = function (offsetElement, offsetMode, allowDefaultActions, pointer)
{
	XXX_PointerInteraction_DragOffset.parentConstructor.call(this);	
	
	if (!(offsetMode == 'page' || offsetMode == 'viewPort' || offsetMode == 'element'))
	{
		offsetMode = 'page';
	}
	
	this.offsetMode = offsetMode;
	
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
	this.elements.offsetElement = XXX_DOM.get(offsetElement);
	
	var XXX_PointerInteraction_DragOffset_instance = this;
	
	this.eventFunctions = {};
	this.eventFunctions.start = function (nativePointerEvent)
	{
		if (!allowDefaultActions)
		{
			nativePointerEvent.preventDefault();
			nativePointerEvent.stopPropagation();
		}
		
		XXX_PointerInteraction_DragOffset_instance.startDrag(nativePointerEvent);
	};
	this.eventFunctions.change = function (nativePointerEvent)
	{
		if (!allowDefaultActions)
		{
			nativePointerEvent.preventDefault();
			nativePointerEvent.stopPropagation();
		}
		
		XXX_PointerInteraction_DragOffset_instance.drag(nativePointerEvent);
	};
	this.eventFunctions.end = function (nativePointerEvent)
	{
		if (!allowDefaultActions)
		{
			nativePointerEvent.preventDefault();
			nativePointerEvent.stopPropagation();
		}
		
		XXX_PointerInteraction_DragOffset_instance.endDrag(nativePointerEvent);
	};
	
	this.addStartListener();
};

XXX.extendClass(XXX_EventDispatcher, XXX_PointerInteraction_DragOffset);

XXX_PointerInteraction_DragOffset.prototype.getOffset = function ()
{
	var x = this.pointerPosition.current.x - this.pointerPosition.start.x;
	var y = this.pointerPosition.current.y - this.pointerPosition.start.y;
	
	var result =
	{
		x: x,
		y: y,
		horizontal: x,
		vertical: y
	};
	
	return result;
};

XXX_PointerInteraction_DragOffset.prototype.getStartPosition = function ()
{
	return this.pointerPosition.start;
};

XXX_PointerInteraction_DragOffset.prototype.getCurrentPosition = function ()
{
	return this.pointerPosition.current;
};

XXX_PointerInteraction_DragOffset.prototype.getDragTime = function ()
{
	return (XXX_TimestampHelpers.getCurrentMillisecondTimestamp() - this.dragStartTimestamp) / 1000;
};

// In pixels per second
XXX_PointerInteraction_DragOffset.prototype.getDragSpeed = function ()
{
	var dragTime = this.getDragTime();
	
	var distance = XXX_Calculate.getDiagonalDistance(this.pointerPosition.start.x, this.pointerPosition.start.y, this.pointerPosition.current.x, this.pointerPosition.current.y);
	
	var speed = distance / dragTime;
	
	return speed;
};

XXX_PointerInteraction_DragOffset.prototype.getDirection = function ()
{
	var direction = XXX_Calculate.getAngleDirection(this.pointerPosition.start.x, this.pointerPosition.start.y, this.pointerPosition.current.x, this.pointerPosition.current.y);
	
	return direction;
};

XXX_PointerInteraction_DragOffset.prototype.addStartListener = function ()
{
	switch (this.pointer)
	{
		case 'touch':
			XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.offsetElement, 'touchStart', this.eventFunctions.start);
			break;
		case 'mouse':
			XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.offsetElement, 'mouseDown', this.eventFunctions.start);
			break;
	}
};

XXX_PointerInteraction_DragOffset.prototype.addChangeAndEndListeners = function ()
{
	switch (this.pointer)
	{
		case 'touch':
			XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.offsetElement, 'touchMove', this.eventFunctions.change);
			XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.offsetElement, 'touchEnd', this.eventFunctions.end);
			break;
		case 'mouse':
			XXX_DOM_NativeEventDispatcher.addEventListener(document, 'mouseMove', this.eventFunctions.change);
			XXX_DOM_NativeEventDispatcher.addEventListener(document, 'mouseUp', this.eventFunctions.end);
			break;
	}
};

XXX_PointerInteraction_DragOffset.prototype.removeChangeAndEndListeners = function ()
{
	switch (this.pointer)
	{
		case 'touch':
			XXX_DOM_NativeEventDispatcher.removeEventListener(this.elements.offsetElement, 'touchMove', this.eventFunctions.change);
			XXX_DOM_NativeEventDispatcher.removeEventListener(this.elements.offsetElement, 'touchEnd', this.eventFunctions.end);
			break;
		case 'mouse':
			XXX_DOM_NativeEventDispatcher.removeEventListener(document, 'mouseMove', this.eventFunctions.change);
			XXX_DOM_NativeEventDispatcher.removeEventListener(document, 'mouseUp', this.eventFunctions.end);
			break;
	}	
};

XXX_PointerInteraction_DragOffset.prototype.getPointerPosition = function (nativePointerEvent)
{
	var pointerPosition;
	
	switch (this.pointer)
	{
		case 'touch':
			switch (this.offsetMode)
			{
				case 'page':
					pointerPosition = XXX_Device_TouchSurface.getPositionRelativeToPage(nativePointerEvent);
					break;
				case 'viewPort':
					pointerPosition = XXX_Device_TouchSurface.getPositionRelativeToViewPort(nativePointerEvent);
					break;
				case 'element':
					pointerPosition = XXX_Device_TouchSurface.getPositionRelativeToElement(nativePointerEvent, this.elements.offsetElement);
					break;
			}
			break;
		case 'mouse':
			switch (this.offsetMode)
			{
				case 'page':
					pointerPosition = XXX_Device_Mouse.getPositionRelativeToPage(nativePointerEvent);
					break;
				case 'viewPort':
					pointerPosition = XXX_Device_Mouse.getPositionRelativeToViewPort(nativePointerEvent);
					break;
				case 'element':
					pointerPosition = XXX_Device_Mouse.getPositionRelativeToElement(nativePointerEvent, this.elements.offsetElement);
					break;
			}
			break;
	}
	
	return pointerPosition;
};

XXX_PointerInteraction_DragOffset.prototype.startDrag = function (nativePointerEvent)
{
	var pointerPosition = this.getPointerPosition(nativePointerEvent);
	
	this.pointerPosition =
	{
		start: pointerPosition,
		current: pointerPosition
	};
	
	this.dispatchEventToListeners('dragOffsetStart');
		
	this.drag(nativePointerEvent);
	
	this.addChangeAndEndListeners();
};

XXX_PointerInteraction_DragOffset.prototype.drag = function (nativePointerEvent)
{
	var pointerPosition = this.getPointerPosition(nativePointerEvent);
	
	this.pointerPosition.current = pointerPosition;
	
	this.dispatchEventToListeners('dragOffsetMove');
		
};

XXX_PointerInteraction_DragOffset.prototype.endDrag = function (nativePointerEvent)
{	
	if (this.pointer != 'touch')
	{
		this.drag(nativePointerEvent);
	}
	
	this.removeChangeAndEndListeners();
	
	this.dispatchEventToListeners('dragOffsetEnd');
};