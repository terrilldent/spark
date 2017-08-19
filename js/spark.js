/*jslint bitwise: true, browser: true, continue: true, devel: true, newcap: true, nomen: true, plusplus: true, sloppy: true, white: true */
/*global mobile, blackberry, btoa, document, window, iScroll, spark */

var spark = spark || {};

Object.create = function(prototype) {
  var Obj = function() {};
  Obj.prototype = prototype;
  return new Obj();
};

String.prototype.trim = function() {
  return this.replace(/^\s+|\s+$/g,'');
};

var $ = function(id) {
  return document.getElementById(id);
};

spark.ajax = {
  request: function(url, successCallback, failureCallback, overrideMimeType, ignoreStatusCode) {
    var request = new XMLHttpRequest();

    request.open('GET', url, true);
    if (overrideMimeType) {
      request.overrideMimeType('text/plain;charset=x-user-defined');
    }

    request.onreadystatechange = function() {
      if (this.readyState === 4) {
        if (this.status === 200 || ignoreStatusCode) {
          if (successCallback) {
            successCallback( request.status, request.responseText, request.getResponseHeader('Content-Type') );
            successCallback = null; // prevent double calling for local ajax calls
          }
        } else if( failureCallback ) {
          failureCallback( request.status, request.responseText, request.getResponseHeader('Content-Type') );
        }
      }

    };
    request.send( true );
  }
};

spark.createEventSource = function( existingObject )
{
  var obj = existingObject || {};

  obj.listeners = [];

  obj.addListener = function( listener ) {
    obj.listeners.push( listener );
  };

  obj.fire = function( eventName, message ) {
    spark.forEach( obj.listeners, function( listener ) {
      if( listener[ eventName ] ) {
        listener[ eventName ]( message );
      }
    });
  };

  return obj;
};

spark.create = function( tagName, attributes )
{
  var element = document.createElement( tagName ),
      key;

  for( key in attributes ) {
    if( attributes.hasOwnProperty( key ) ) {
      element[ key ] = attributes[ key ];
    }
  }

  return element;
};

spark.getEvent = function( e )
{
  return e.touches ? e.touches[0] : e;
};

spark.getEventPosition = function( e )
{
  e = e.touches ? e.touches[0] : e;
  return { x : e.pageX , y : e.pageY };
};

spark.getEventTarget = function( e )
{
  if( event.touches && event.touches[0] && event.touches[0].target ) {
    return event.touches[0].target;
  }
  return e.target;
};

spark.getFirstChild = function( target )
{
  var child = target.firstChild;
  while( child && child.nodeType !== 1 ) {
    child = child.nextSibling;
  }
  return child;
};

spark.getFirstChildByTagName = function( target, tagName )
{
  var child = target.firstChild;
  tagName = tagName.toUpperCase();
  while( child && ( !child.tagName || child.tagName !== tagName ) )  {
    child = child.nextSibling;
  }
  return child;
};

spark.removeChildTags = function( element, tagNameToRemove, optionalReplacementText )
{
  var tags = element.getElementsByTagName( tagNameToRemove ),
      i;

  for( i = tags.length - 1; i >= 0; i-- ) {
    if( optionalReplacementText ) {
      tags[ i ].parentNode.insertBefore( document.createTextNode( optionalReplacementText ), tags[ i ] );
    }
    tags[ i ].parentNode.removeChild( tags[ i ] );
  }
};

spark.remove = function( element )
{
  if( element && element.parentNode ) {
    element.parentNode.removeChild( element );
  }
};

spark.getFirstComment = function( target )
{
  var child = target.firstChild;
  while( child ) {
    if( child.nodeType === 8 ) {
      return child;
    }
    child = child.nextSibling;
  }
  return null;
};

spark.forEach = function( arrayCollection, callback )
{
  var num = arrayCollection.length,
      i;

  for( i = 0; i < num; i++ ) {
    callback( arrayCollection[ i ] );
  }
};

spark.hasClass = function( element, className )
{
  return element.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
};

spark.addClass = function( element, className )
{
  if( !spark.hasClass( element, className ) ){
    element.className += ' ' + className;
  }
};

spark.removeClass = function( element, className )
{
  if( spark.hasClass( element, className ) ){
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
    element.className = element.className.replace( reg, ' ' );
  }
};

spark.setClass = function( element, className, addClass )
{
  if( addClass ) {
    spark.addClass( element, className );
  } else {
    spark.removeClass( element, className );
  }
};

spark.getStyle = function( element, style )
{
  if( element.currentStyle ) {
    return element.currentStyle[ style ];
  }
  if( window.getComputedStyle ) {
    return document.defaultView.getComputedStyle( element, null ).getPropertyValue( style );
  }
};

spark.getPosXY = function( element )
{
  var x = 0,
      y = 0;

  while( element ) {
    x += element.offsetLeft;
    y += element.offsetTop;
    element = element.offsetParent;
  }

  return { x : x, y : y };
};

spark.consumeEvent = function( e )
{
  e.stopPropagation();
  e.preventDefault();
};

spark.button = (function()
{
  var buttonPrototype,
      MOVEMENT_ALLOWED = 15;

  buttonPrototype = {

    handleEvent : function( e )
    {
      switch( e.type ) {
        case 'touchstart':
          this.handleTouchStart( e );
          break;
        case 'touchmove':
          this.handleTouchMove( e );
          break;
        case 'touchend':
          this.handleTouchEnd( e );
          break;
      }
    },

    reset : function()
    {
      var that = this;
      document.body.removeEventListener( 'touchmove', that, false );
      document.body.removeEventListener( 'touchend',  that, false );
    },

    handleTouchStart : function( e )
    {
      var that = this;

      that.previousEvent = e;
      that.touchStartXY = spark.getEventPosition( e );

      document.body.addEventListener( 'touchmove', that, false );
      document.body.addEventListener( 'touchend', that, false );

      return false;
    },

    handleTouchMove : function( e )
    {
      var that = this;

      that.previousEvent = e;

      if( that.outOfBounds( that.touchStartXY, spark.getEventPosition( e ) ) ) {
        that.reset();
      }

      return false;
    },

    handleTouchEnd : function( e )
    {
      var that = this;

      e.stopPropagation();
      e.preventDefault();

      that.reset();

      if( that.invokeCallback ) {
        that.invokeCallback( that.target, e );
      }

      return false;
    },

    outOfBounds : function( point1, point2 )
    {
      if( Math.abs( point2.x - point1.x ) > MOVEMENT_ALLOWED ||
        Math.abs( point2.y - point1.y ) > MOVEMENT_ALLOWED ) {
        return true;
      }
      return false;
    }
  };

  return {
    create : function( target, invokeCallback ) {

      var button = Object.create( buttonPrototype );

      button.target = target;
      button.invokeCallback = invokeCallback;
      target.ontouchstart = function( e ) {
        button.handleEvent( e );
      };

      if( !mobile ) {
        target.onclick = function( e ) {
          invokeCallback( target, e );
          e.preventDefault();
          return false;
        };
      }
    }
  };
}());
