// TODO maximize on element size

var XXX_PointerInteraction_MouseOverWithin = function (withinElement, allowDefaultActions)
{
	XXX_PointerInteraction_MouseOverWithin.parentConstructor.call(this);	
	
	this.mousePosition = false;
	
	this.elements = {};	
	this.elements.withinElement = XXX_DOM.get(withinElement);
		
	var XXX_PointerInteraction_MouseOverWithin_instance = this;
	
	this.eventFunctions = {};
	this.eventFunctions.start = function (nativeMouseEvent)
	{
		if (!allowDefaultActions)
		{
			nativeMouseEvent.preventDefault();
			nativeMouseEvent.stopPropagation();
		}
		
		XXX_PointerInteraction_MouseOverWithin_instance.startWithin(nativeMouseEvent);
	};
	this.eventFunctions.change = function (nativeMouseEvent)
	{
		if (!allowDefaultActions)
		{
			nativeMouseEvent.preventDefault();
			nativeMouseEvent.stopPropagation();
		}
		
		XXX_PointerInteraction_MouseOverWithin_instance.withinMove(nativeMouseEvent);
	};
	this.eventFunctions.end = function (nativeMouseEvent)
	{
		if (!allowDefaultActions)
		{
			nativeMouseEvent.preventDefault();
			nativeMouseEvent.stopPropagation();
		}
		
		XXX_PointerInteraction_MouseOverWithin_instance.endWithin(nativeMouseEvent);
	};
	
	this.addStartListener();
};

XXX.extendClass(XXX_EventDispatcher, XXX_PointerInteraction_MouseOverWithin);

XXX_PointerInteraction_MouseOverWithin.prototype.addStartListener = function ()
{
	XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.withinElement, 'mouseOver', this.eventFunctions.start);
};

XXX_PointerInteraction_MouseOverWithin.prototype.addChangeAndEndListeners = function ()
{
	XXX_DOM_NativeEventDispatcher.addEventListener(XXX_DOM.getBody(), 'mouseMove', this.eventFunctions.change);
	XXX_DOM_NativeEventDispatcher.addEventListener(XXX_DOM.getBody(), 'mouseOut', this.eventFunctions.end);
};

XXX_PointerInteraction_MouseOverWithin.prototype.removeChangeAndEndListeners = function ()
{
	XXX_DOM_NativeEventDispatcher.removeEventListener(XXX_DOM.getBody(), 'mouseMove', this.eventFunctions.change);
	XXX_DOM_NativeEventDispatcher.removeEventListener(XXX_DOM.getBody(), 'mouseOut', this.eventFunctions.end);
};

XXX_PointerInteraction_MouseOverWithin.prototype.getPosition = function ()
{
	return this.mousePosition;
};

XXX_PointerInteraction_MouseOverWithin.prototype.startWithin = function (nativeMouseEvent)
{
	this.mousePosition = XXX_Device_Mouse.getPositionWithinElement(nativeMouseEvent, this.elements.withinElement);
	
	this.dispatchEventToListeners('mouseEnter');
	
	this.withinMove(nativeMouseEvent);
	
	this.addChangeAndEndListeners();
};

XXX_PointerInteraction_MouseOverWithin.prototype.withinMove = function (nativeMouseEvent)
{
	this.mousePosition = XXX_Device_Mouse.getPositionWithinElement(nativeMouseEvent, this.elements.withinElement);
	
	this.dispatchEventToListeners('mouseMove');
};

XXX_PointerInteraction_MouseOverWithin.prototype.endWithin = function (nativeMouseEvent)
{
	this.withinMove(nativeMouseEvent);
	
	this.removeChangeAndEndListeners();
	
	this.dispatchEventToListeners('mouseLeave');
	
	this.mousePosition = false;
	
};