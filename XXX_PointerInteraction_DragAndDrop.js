/*

draggableElement -> the draggable element itself

draggableElement -> array
	draggableElement
	triggerElement

*/

var XXX_PointerInteraction_DragAndDrop = function (draggableElement, allowDefaultActions, pointer)
{
	XXX_PointerInteraction_DragAndDrop.parentConstructor.call(this);	
	
	if (!(pointer == 'mouse' || pointer == 'touch'))
	{
		pointer = XXX_HTTP_Browser.pointerInterface == 'touch' ? 'touch' : 'mouse';
	}
	
	this.pointer = pointer;
	
	this.direction = 'free';
	
	this.boundaries =
	{
		minimumPosition:
		{
			x: false,
			y: false
		},
		maximumPosition:
		{
			x: false,
			y: false
		}
	};
	
	this.draggableElementPosition =
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
	
	this.elements = {};
	
	if (draggableElement.draggableElement)
	{
		this.elements.draggableElement = XXX_DOM.get(draggableElement.draggableElement);
		
		if (draggableElement.triggerElement)
		{
			this.elements.triggerElement = XXX_DOM.get(draggableElement.triggerElement);
		}
		else
		{
			this.elements.triggerElement = this.elements.draggableElement;
		}
		
		if (draggableElement.trackElement)
		{
			this.elements.trackElement = XXX_DOM.get(draggableElement.trackElement);
		}
	}
	else
	{
		this.elements.draggableElement = XXX_DOM.get(draggableElement);
		this.elements.triggerElement = this.elements.draggableElement;
	}
	
	this.startElement = '';
	
	var XXX_PointerInteraction_DragAndDrop_instance = this;
	
	this.eventFunctions = {};
	this.eventFunctions.start = function (nativePointerEvent)
	{
		if (!allowDefaultActions)
		{
			nativePointerEvent.preventDefault();
			nativePointerEvent.stopPropagation();
		}
		
		XXX_PointerInteraction_DragAndDrop_instance.startDrag(nativePointerEvent);
	};
	this.eventFunctions.change = function (nativePointerEvent)
	{
		if (!allowDefaultActions)
		{
			nativePointerEvent.preventDefault();
			nativePointerEvent.stopPropagation();
		}
		
		XXX_PointerInteraction_DragAndDrop_instance.drag(nativePointerEvent);
	};
	this.eventFunctions.end = function (nativePointerEvent)
	{
		if (!allowDefaultActions)
		{
			nativePointerEvent.preventDefault();
			nativePointerEvent.stopPropagation();
		}
		
		XXX_PointerInteraction_DragAndDrop_instance.endDrag(nativePointerEvent);
	};
	
	this.addStartListener();
};

XXX.extendClass(XXX_EventDispatcher, XXX_PointerInteraction_DragAndDrop);

// Adding/Removing listeners

	XXX_PointerInteraction_DragAndDrop.prototype.addStartListener = function ()
	{
		
		var XXX_PointerInteraction_DragAndDrop_instance = this;
		
		switch (this.pointer)
		{
			case 'touch':
				XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.triggerElement, 'touchStart', this.eventFunctions.start);
				
				if (this.elements.trackElement)
				{
					XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.trackElement, 'touchStart', function (nativePointerEvent)
					{
						nativePointerEvent.preventDefault();
						nativePointerEvent.stopPropagation();
						
						XXX_PointerInteraction_DragAndDrop_instance.startElement = 'track';
						
						var pointerPosition = XXX_Device_TouchSurface.getPositionWithinElement(nativePointerEvent, this);
						
						XXX_PointerInteraction_DragAndDrop_instance.setPositionByFractions(pointerPosition.horizontalFraction, pointerPosition.verticalFraction);
						
						XXX_PointerInteraction_DragAndDrop_instance.startDrag(nativePointerEvent);
					});
				}
				break;
			case 'mouse':
				XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.triggerElement, 'mouseDown', this.eventFunctions.start);
				
				if (this.elements.trackElement)
				{
					XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.trackElement, 'mouseDown', function (nativePointerEvent)
					{
						nativePointerEvent.preventDefault();
						nativePointerEvent.stopPropagation();
						
						XXX_PointerInteraction_DragAndDrop_instance.startElement = 'track';
						
						var pointerPosition = XXX_Device_Mouse.getPositionWithinElement(nativePointerEvent, this);
						
						XXX_PointerInteraction_DragAndDrop_instance.setPositionByFractions(pointerPosition.horizontalFraction, pointerPosition.verticalFraction);
						
						XXX_PointerInteraction_DragAndDrop_instance.startDrag(nativePointerEvent);
					});
				}
				break;
		}
	};
	
	XXX_PointerInteraction_DragAndDrop.prototype.addChangeAndEndListeners = function ()
	{
		switch (this.pointer)
		{
			case 'touch':
				if (this.elements.trackElement && this.startElement == 'track')
				{
					XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.trackElement, 'touchMove', this.eventFunctions.change);
					XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.trackElement, 'touchEnd', this.eventFunctions.end);
				}
				else
				{
					XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.triggerElement, 'touchMove', this.eventFunctions.change);
					XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.triggerElement, 'touchEnd', this.eventFunctions.end);
				}
				break;
			case 'mouse':
				XXX_DOM_NativeEventDispatcher.addEventListener(XXX_DOM.getBody(), 'mouseMove', this.eventFunctions.change);
				XXX_DOM_NativeEventDispatcher.addEventListener(XXX_DOM.getBody(), 'mouseUp', this.eventFunctions.end);
				break;
		}
	};
	
	XXX_PointerInteraction_DragAndDrop.prototype.removeChangeAndEndListeners = function ()
	{
		switch (this.pointer)
		{
			case 'touch':
				if (this.elements.trackElement && this.startElement == 'track')
				{
					XXX_DOM_NativeEventDispatcher.removeEventListener(this.elements.trackElement, 'touchMove', this.eventFunctions.change);
					XXX_DOM_NativeEventDispatcher.removeEventListener(this.elements.trackElement, 'touchEnd', this.eventFunctions.end);
				}
				else
				{
					XXX_DOM_NativeEventDispatcher.removeEventListener(this.elements.triggerElement, 'touchMove', this.eventFunctions.change);
					XXX_DOM_NativeEventDispatcher.removeEventListener(this.elements.triggerElement, 'touchEnd', this.eventFunctions.end);
				}
				break;
			case 'mouse':
				XXX_DOM_NativeEventDispatcher.removeEventListener(XXX_DOM.getBody(), 'mouseMove', this.eventFunctions.change);
				XXX_DOM_NativeEventDispatcher.removeEventListener(XXX_DOM.getBody(), 'mouseUp', this.eventFunctions.end);
				break;
		}
	};

// Setting limits

	XXX_PointerInteraction_DragAndDrop.prototype.limitDirection = function (direction)
	{
		if (direction == 'horizontal' || direction == 'vertical')
		{
			if (direction == 'horizontal')
			{
				var y = XXX_Type.makeInteger(XXX_CSS.getStyle(this.elements.draggableElement, 'top'));
				
				this.boundaries.minimumPosition.y = y ? y : 0;
				this.boundaries.maximumPosition.y = y ? y : 0;
			}
			else if (direction == 'vertical')
			{
				var x = XXX_Type.makeInteger(XXX_CSS.getStyle(this.elements.draggableElement, 'left'));
				
				this.boundaries.minimumPosition.x = x ? x : 0;
				this.boundaries.maximumPosition.x = x ? x : 0;
			}
			
			this.direction = direction;	
		}
	};
	
	XXX_PointerInteraction_DragAndDrop.prototype.setBoundaries = function (minimumX, maximumX, minimumY, maximumY)
	{
		if (XXX_Type.isInteger(minimumX))
		{
			this.boundaries.minimumPosition.x = minimumX;
		}
				
		if (XXX_Type.isInteger(maximumX))
		{
			this.boundaries.maximumPosition.x = maximumX;
		}
				
		if (XXX_Type.isInteger(minimumY))
		{
			this.boundaries.minimumPosition.y = minimumY;
		}
		
		if (XXX_Type.isInteger(maximumY))
		{
			this.boundaries.maximumPosition.y = maximumY;
		}
	};

// Get/set position
	
	XXX_PointerInteraction_DragAndDrop.prototype.getPosition = function ()
	{
		var x = this.draggableElementPosition.current.x;
		var y = this.draggableElementPosition.current.y;
		
		var horizontalFraction = false;
		var horizontalPercentage = false;
		
		if (!(this.boundaries.minimumPosition.x === false && this.boundaries.maximumPosition.x === false))
		{
			horizontalFraction = (x - this.boundaries.minimumPosition.x) / (this.boundaries.maximumPosition.x - this.boundaries.minimumPosition.x);
			horizontalPercentage = horizontalFraction * 100;
		}
		
		var verticalFraction = false;
		var verticalPercentage = false;
		
		if (!(this.boundaries.minimumPosition.y === false && this.boundaries.maximumPosition.y === false))
		{
			verticalFraction = (y - this.boundaries.minimumPosition.y) / (this.boundaries.maximumPosition.y - this.boundaries.minimumPosition.y);
			verticalPercentage = verticalFraction * 100;
		}
		
		var result =
		{
			x: x,
			y: y,
			horizontalFraction: horizontalFraction,
			verticalFraction: verticalFraction,
			horizontalPercentage: horizontalPercentage,
			verticalPercentage: verticalPercentage
		};
		
		return result;
	};
	
	XXX_PointerInteraction_DragAndDrop.prototype.getDragTime = function ()
	{
		return (XXX_TimestampHelpers.getCurrentMillisecondTimestamp() - this.dragStartTimestamp) / 1000;
	};
	
	// In pixels per second
	XXX_PointerInteraction_DragAndDrop.prototype.getDragSpeed = function ()
	{
		var dragTime = this.getDragTime();
		
		var distance = XXX_Calculate.getDiagonalDistance(this.pointerPosition.start.x, this.pointerPosition.start.y, this.pointerPosition.current.x, this.pointerPosition.current.y);
		
		var speed = distance / dragTime;
		
		return speed;
	};
	
	XXX_PointerInteraction_DragAndDrop.prototype.getDirection = function ()
	{
		var direction = XXX_Calculate.getAngleDirection(this.pointerPosition.start.x, this.pointerPosition.start.y, this.pointerPosition.current.x, this.pointerPosition.current.y);
		
		return direction;
	};
	
	XXX_PointerInteraction_DragAndDrop.prototype.setHorizontalPositionByFraction = function (horizontalFraction)
	{
		if (!(this.boundaries.minimumPosition.x === false && this.boundaries.maximumPosition.x === false) && (horizontalFraction >= 0 || horizontalFraction <= 1))
		{
			var x = XXX_Number.floor(this.boundaries.minimumPosition.x + ((this.boundaries.maximumPosition.x - this.boundaries.minimumPosition.x) * horizontalFraction));
			
			XXX_CSS.setStyle(this.elements.draggableElement, 'x', x + 'px');
		}
	};
	
	XXX_PointerInteraction_DragAndDrop.prototype.setHorizontalPositionByPercentage = function (horizontalPercentage)
	{
		this.setHorizontalPositionByFraction(horizontalPercentage / 100);
	};
	
	XXX_PointerInteraction_DragAndDrop.prototype.setVerticalPositionByFraction = function (verticalFraction)
	{
		if (!(this.boundaries.minimumPosition.y === false && this.boundaries.maximumPosition.y === false) && (verticalFraction >= 0 || verticalFraction <= 1))
		{
			var y = XXX_Number.floor(this.boundaries.minimumPosition.y + ((this.boundaries.maximumPosition.y - this.boundaries.minimumPosition.y) * verticalFraction));
			
			XXX_CSS.setStyle(this.elements.draggableElement, 'y', y + 'px');
		}
	};
	
	XXX_PointerInteraction_DragAndDrop.prototype.setVerticalPositionByPercentage = function (verticalPercentage)
	{
		this.setVerticalPositionByFraction(verticalPercentage / 100);
	};
	
	XXX_PointerInteraction_DragAndDrop.prototype.setPositionByFractions = function (horizontalFraction, verticalFraction)
	{
		this.setHorizontalPositionByFraction(horizontalFraction);
		this.setVerticalPositionByFraction(verticalFraction);
	};
	
	XXX_PointerInteraction_DragAndDrop.prototype.setPositionByPercentages = function (horizontalPercentage, verticalPercentage)
	{
		this.setPositionByFractions(horizontalPercentage / 100, verticalPercentage / 100);
	};
	
	XXX_PointerInteraction_DragAndDrop.prototype.getPointerPosition = function (nativePointerEvent)
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
	
// Events
	
	XXX_PointerInteraction_DragAndDrop.prototype.startDrag = function (nativePointerEvent)
	{
		this.dragStartTimestamp = XXX_TimestampHelpers.getCurrentMillisecondTimestamp();
		
		var draggableElementPosition =
		{
			x: XXX_Type.makeInteger(XXX_CSS.getStyle(this.elements.draggableElement, 'x')),
			y: XXX_Type.makeInteger(XXX_CSS.getStyle(this.elements.draggableElement, 'y'))
		};
		
		this.draggableElementPosition.start = this.draggableElementPosition.current = draggableElementPosition;
		
		var pointerPosition = this.getPointerPosition(nativePointerEvent);
		
		this.pointerPosition.start = this.pointerPosition.current = pointerPosition;
		
		this.dispatchEventToListeners('dragAndDropStart');
		
		this.drag(nativePointerEvent);
		
		this.addChangeAndEndListeners();
	};
	
	XXX_PointerInteraction_DragAndDrop.prototype.drag = function (nativePointerEvent)
	{
		var pointerPosition = this.getPointerPosition(nativePointerEvent);
		
		this.pointerPosition.current = pointerPosition;
		
			var deltaX = this.pointerPosition.current.x - this.pointerPosition.start.x;
			var deltaY = this.pointerPosition.current.y - this.pointerPosition.start.y;
			
			var draggableElementX = this.draggableElementPosition.start.x + deltaX;
			var draggableElementY = this.draggableElementPosition.start.y + deltaY;
		
			if (XXX_Type.isInteger(this.boundaries.minimumPosition.x))
			{
				draggableElementX = XXX_Number.highest(draggableElementX, this.boundaries.minimumPosition.x);
			}		
			
			if (XXX_Type.isInteger(this.boundaries.maximumPosition.x))
			{
				draggableElementX = XXX_Number.lowest(draggableElementX, this.boundaries.maximumPosition.x);
			}		
			
			if (XXX_Type.isInteger(this.boundaries.minimumPosition.y))
			{
				draggableElementY = XXX_Number.highest(draggableElementY, this.boundaries.minimumPosition.y);
			}		
			
			if (XXX_Type.isInteger(this.boundaries.maximumPosition.y))
			{
				draggableElementY = XXX_Number.lowest(draggableElementY, this.boundaries.maximumPosition.y);
			}
		
		this.draggableElementPosition.current =
		{
			x: draggableElementX,
			y: draggableElementY
		};
		
		XXX_CSS.setStyle(this.elements.draggableElement, 'x', draggableElementX + 'px');
		XXX_CSS.setStyle(this.elements.draggableElement, 'y', draggableElementY + 'px');
		
		this.dispatchEventToListeners('dragAndDropMove');
	};
	
	XXX_PointerInteraction_DragAndDrop.prototype.endDrag = function (nativePointerEvent)
	{
		if (this.pointer != 'touch')
		{
			this.drag(nativePointerEvent);
		}
			
		this.removeChangeAndEndListeners();
		
		this.dispatchEventToListeners('dragAndDropEnd');
		
		this.dragStartTimestamp = 0;
	};