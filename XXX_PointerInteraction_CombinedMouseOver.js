
var XXX_PointerInteraction_CombinedMouseOver = function (elements, mouseOverEnterDelay, mouseOverLeaveDelay)
{
	XXX_PointerInteraction_CombinedMouseOver.parentConstructor.call(this);
	
	this.CLASS_NAME = 'XXX_PointerInteraction_CombinedMouseOver';
	
	this.elements = elements;
	this.elementsReady = true;
	
	this.states =
	{
		mouseOver: false,
		mouseOverCount: 0
	};
	
	for (var key in this.states)
	{
		var previousProperty = 'previous' + XXX_String.capitalize(key);
		
		this.states[previousProperty] = this.states[key];
	}
	
	this.mouseOverEnterDelay = XXX_Default.toMinimumInteger(mouseOverEnterDelay, 500);
	this.mouseOverLeaveDelay = XXX_Default.toMinimumInteger(mouseOverLeaveDelay, 500);
	
	this.mouseOverEnterDelayID = false;
	this.mouseOverLeaveDelayID = false;
	
	this.attachDefaultEventHandlers();
	
	this.suppressEvents = false;
	
};

XXX.extendClass(XXX_EventDispatcher, XXX_PointerInteraction_CombinedMouseOver);


XXX_PointerInteraction_CombinedMouseOver.prototype.dispatchEventToListeners = function (eventType, force)
{
	if (this.elementsReady)
	{
		if (!this.suppressEvents || force)
		{
			XXX_PointerInteraction_CombinedMouseOver.parent.dispatchEventToListeners.call(this, eventType);
		}
	}
};


XXX_PointerInteraction_CombinedMouseOver.prototype.detectChange = function (property, state)
{
	var currentProperty = property;
	var previousProperty = 'previous' + XXX_String.capitalize(property);
	
	var changed = false;
	
	switch (currentProperty)
	{
		case 'mouseOverCount':
			changed = true;
							
			if (state)
			{
				state = this.states.previousMouseOverCount + 1;
			}
			else
			{
				state = this.states.previousMouseOverCount - 1;
			}
			break;
		default:
			changed = (state != this.states[previousProperty]);
			break;
	}
	
	return changed;
};

XXX_PointerInteraction_CombinedMouseOver.prototype.changeState = function (trigger, property, state, dispatchEvent)
{
	trigger = XXX_Default.toOption(trigger, ['native', 'manual'], 'native');
	
	var currentProperty = property;
	var previousProperty = 'previous' + XXX_String.capitalize(property);
	
	var changed = this.detectChange(property, state);
					
	if (changed)
	{
		switch (trigger)
		{
			case 'native':
				this.states[currentProperty] = state;		
				this.states[previousProperty] = this.states[currentProperty];
				
				dispatchEvent = true;
				break;
			case 'manual':
				this.states[currentProperty] = state;
				this.states[previousProperty] = state;
				break;
		}
		
		switch (currentProperty)
		{
			case 'mouseOver':
				this.dispatchEventToListeners(trigger + (state ? 'MouseOverEnter' : 'MouseOverLeave'), true);
				
				if (dispatchEvent)
				{
					this.dispatchEventToListeners(state ? 'mouseOverEnter' : 'mouseOverLeave');
				}
				break;
			case 'mouseOverCount':
				if (state == 1)
				{
					this.dispatchEventToListeners(trigger + 'MouseOverCountEnter', true);
					
					if (dispatchEvent)
					{
						this.dispatchEventToListeners('mouseOverCountEnter');
					}
				}
				else if (state == 0)
				{
					this.dispatchEventToListeners(trigger + 'MouseOverCountLeave', true);
					
					if (dispatchEvent)
					{
						this.dispatchEventToListeners('mouseOverCountLeave');
					}
				}
				break;
		}
		
		this.dispatchEventToListeners('stateChange');
	}
};
	
XXX_PointerInteraction_CombinedMouseOver.prototype.getState = function (property)
{
	return this.states[property];
};

XXX_PointerInteraction_CombinedMouseOver.prototype.setMouseOver = function (mouseOver, dispatchEvent) { return this.changeState('manual', 'mouseOver', mouseOver ? true : false, dispatchEvent); };
XXX_PointerInteraction_CombinedMouseOver.prototype.mouseOverEnter = function (dispatchEvent) { return this.changeState('manual', 'mouseOver', true, dispatchEvent); };	
XXX_PointerInteraction_CombinedMouseOver.prototype.mouseOverLeave = function (dispatchEvent) { return this.changeState('manual', 'mouseOver', false, dispatchEvent); };
XXX_PointerInteraction_CombinedMouseOver.prototype.isMouseOver = function (dispatchEvent) { return this.getState('mouseOver'); };

XXX_PointerInteraction_CombinedMouseOver.prototype.attachDefaultEventHandlers = function ()
{
	for (var i in this.elements)
	{
		var element = this.elements[i];
		
		var XXX_PointerInteraction_CombinedMouseOver_instance = this;
		
		XXX_DOM_NativeEventDispatcher.addEventListener(element, 'mouseOver', function (nativeEvent)
		{
			var targetElement = XXX_DOM_NativeEventDispatcher.getTarget(nativeEvent);				
			var isTargetElement = (targetElement && targetElement == this);				
			var isTargetElementADescendant = (targetElement && XXX_DOM.isDescendant(targetElement, this));
			
			if (isTargetElement || isTargetElementADescendant)
			{
				XXX_PointerInteraction_CombinedMouseOver_instance.changeState('native', 'mouseOverCount', true);
			}
		});
		
		XXX_DOM_NativeEventDispatcher.addEventListener(element, 'mouseOut', function (nativeEvent)
		{
			var targetElement = XXX_DOM_NativeEventDispatcher.getTarget(nativeEvent);				
			var isTargetElement = (targetElement && targetElement == this);				
			var isTargetElementADescendant = (targetElement && XXX_DOM.isDescendant(targetElement, this));
			
			if (isTargetElement || isTargetElementADescendant)
			{
				XXX_PointerInteraction_CombinedMouseOver_instance.changeState('native', 'mouseOverCount', false);
			}
		});
	}
	
	this.addEventListener('nativeMouseOverCountEnter', function ()
	{
		XXX_PointerInteraction_CombinedMouseOver_instance.startMouseOverEnterDelay();
	});
	
	this.addEventListener('nativeMouseOverCountLeave', function ()
	{
		XXX_PointerInteraction_CombinedMouseOver_instance.startMouseOverLeaveDelay();
	});
};
	
	XXX_PointerInteraction_CombinedMouseOver.prototype.setDelay = function (mouseOverEnterDelay, mouseOverLeaveDelay)
	{
		this.mouseOverEnterDelay = XXX_Default.toMinimumInteger(mouseOverEnterDelay, 500);
		this.mouseOverLeaveDelay = XXX_Default.toMinimumInteger(mouseOverLeaveDelay, 500);
	};

	XXX_PointerInteraction_CombinedMouseOver.prototype.startMouseOverEnterDelay = function ()
	{
		this.cancelMouseOverLeaveDelay();
				
		if (this.mouseOverEnterDelay == 0)
		{
			this.changeState('native', 'mouseOver', true);
		}
		else
		{
			this.cancelMouseOverEnterDelay();
			
			var XXX_PointerInteraction_CombinedMouseOver_instance = this;
			
			this.mouseOverEnterDelayID = XXX_Timer.startDelay(this.mouseOverEnterDelay, function ()
			{
				XXX_PointerInteraction_CombinedMouseOver_instance.endMouseOverEnterDelay();
			});
		}
	};
	
	XXX_PointerInteraction_CombinedMouseOver.prototype.endMouseOverEnterDelay = function ()
	{
		this.changeState('native', 'mouseOver', true);
	};
	
	XXX_PointerInteraction_CombinedMouseOver.prototype.cancelMouseOverEnterDelay = function ()
	{
		if (this.mouseOverEnterDelayID)
		{
			XXX_Timer.cancelDelay(this.mouseOverEnterDelayID);
		}
	};
	
	
	XXX_PointerInteraction_CombinedMouseOver.prototype.startMouseOverLeaveDelay = function ()
	{
		this.cancelMouseOverEnterDelay();
		
		if (this.mouseOverLeaveDelay == 0)
		{
			this.changeState('native', 'mouseOver', false);
		}
		else
		{
			this.cancelMouseOverLeaveDelay();
			
			var XXX_PointerInteraction_CombinedMouseOver_instance = this;
			
			this.mouseOverLeaveDelayID = XXX_Timer.startDelay(this.mouseOverLeaveDelay, function ()
			{
				XXX_PointerInteraction_CombinedMouseOver_instance.endMouseOverLeaveDelay();
			});
		}
	};
	
	XXX_PointerInteraction_CombinedMouseOver.prototype.endMouseOverLeaveDelay = function ()
	{
		this.changeState('native', 'mouseOver', false);
	};
	
	XXX_PointerInteraction_CombinedMouseOver.prototype.cancelMouseOverLeaveDelay = function ()
	{
		if (this.mouseOverLeaveDelayID)
		{
			XXX_Timer.cancelDelay(this.mouseOverLeaveDelayID);
		}
	};