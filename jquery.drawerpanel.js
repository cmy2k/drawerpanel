(function($){
    //
    // Statics
    //
    var POSITIONS = {
        RIGHT: 'right',
        LEFT: 'left'
    };

    var STATES = {
        OPENED: 'opened',
        CLOSED: 'closed'
    };

    //
    // Widget
    //
    $.widget( 'nemac.drawerPanel', {
        //
        // Defaults
        //
        options: {
            position: POSITIONS.RIGHT,
            state: STATES.OPENED,
            resizable: false,
            width: 300,
            minWidth: 200,
            maxWidth: 600,
            color: '#eef',
            templateLocation: '',
            title: 'Title',
            openerImage: '',
            openerHeight: 110,
            animationDuration: 400,
            onResizeStop: null
        },

        //
        // Private vars
        //
        placement: {},
        state: STATES.OPENED,
        template: '',

        //
        // Private methods
        //
        _create: function() {
            // init, validate local vars
            this.options.position = this._validateInput( this.options.position, POSITIONS, POSITIONS.RIGHT);
            this.options.state = this._validateInput( this.options.state, STATES, STATES.OPENED);
            this.options.templateLocation = this._validateTemplateLocation( this.options.templateLocation );
            this.placement = {
                closed: {},
                closedTransition: {},
                openedTransition: {}
            };
            this.placement.closed[this.options.position] = '-' + this.options.width + 'px';
            this.placement.closedTransition[this.options.position] = '-=' + this.options.width + 'px';
            this.placement.openedTransition[this.options.position] = '+=' + this.options.width + 'px';

            // async call that handles loading the template, and then performs deploy on success
            var instance = this;
            $.get( this.options.templateLocation, function( template ) {
                instance.template = template;
                instance._deployDOM( template, instance.element.html(), instance.options.state ); 
            });
        },

        _deployDOM: function( template, contents, state ) {
            this.element.empty();
            this.element.html(
                Mustache.render(
                    template, {
                        position: this.options.position,
                        title: this.options.title,
                        contents: contents
                    }
                )
            );

            // set initial state, if differs from desired state
            if ( this.state !== state ) {
                this.togglePanelState( true );
            }

            var instance = this;
            // bind closer/opener
            $( 'div.drawer-closer', this.element )
                .on( "click", function() {
                    instance.close();
            });
            $( 'div.drawer-opener', this.element )
                .on( "click", function() {
                    instance.open();
            });

            // init styling
            if (typeof this.options.openerImage === 'string' && this.options.openerImage.length > 0) {
                $( 'div.drawer-opener-image', this.element )
                    .css( 'background-image', 'url(\'' + this.options.openerImage + '\')')
                    .css( 'height', this.options.openerHeight );
            }

            $( 'div.drawer-opener', this.element )
                .css( "background-color", this.options.color )
                .css( 'height', this.options.openerHeight );
            $( 'div.drawer', this.element )
                .css( "background-color", this.options.color )
                .width( this.options.width );

            // resize handler
            if ( this.options.resizable === true ) {
                var handle;
                if ( this.options.position === POSITIONS.RIGHT ) {
                    handle = 'w';
                } else {
                    handle = 'e';
                }
                
                var stopCallback = null;
                if (this.options.onResizeStop !== null && typeof this.options.onResizeStop === 'function') {
                    stopCallback = this.options.onResizeStop;
                }

                $( 'div.drawer', this.element ).resizable({
                    handles: handle,
                    maxWidth: this.options.maxWidth,
                    minWidth: this.options.minWidth,
                    stop: stopCallback
                });
            }
        },

        // validators
        _validateInput: function( input, constants, defaultValue ) {
            input = input.toUpperCase();
            if ( constants.hasOwnProperty( input ) ) {
                return constants[input];
            } else {
                return defaultValue;
            }
        },

        _validateTemplateLocation: function( templateLocation ) {
            if ( typeof templateLocation === 'string' && templateLocation.length > 0 ) {
                return templateLocation;
            } else {
                // attempt to find the template relative to this file
                return $( 'script[src*=drawerpanel]' )
                        .attr( 'src' )
                        .replace( 'jquery.drawerpanel.js', 'panel.tpl.html' );
            }
        },

        //
        // Public methods
        //
        
        getState: function() {
            return this.state;
        },

        close: function( doImmediately ) {
            if ( this.state === STATES.OPENED ) {
                if ( doImmediately ) {
                    $( 'div.drawer', this.element ).css( this.placement.closed ).css({
                        display: 'none'
                    });
                    $( '.drawer-opener', this.element ).show();
                } else {
                    var reference = this;
                    $( 'div.drawer', this.element )
                        .animate( this.placement.closedTransition, this.options.animationDuration, function() {
                            $( 'div.drawer', reference.element ).css({
                                display: 'none'
                            });
                        $( '.drawer-opener', reference.element ).show();
                    });
                }

                this.state = STATES.CLOSED;
            }
        },

        open: function( doImmediately ) {
            if ( this.state === STATES.CLOSED ) {
                if ( doImmediately ) {
                    $( 'div.drawer', this.element )
                        .css( this.placement.opened )
                        .css({ display: 'block' });
                } else {
                    $( 'div.drawer', this.element ).css({ display: 'block' });
                    $( 'div.drawer', this.element )
                        .animate( this.placement.openedTransition );
                }

                $( '.drawer-opener', this.element ).hide();
                this.state = STATES.OPENED;
            }
        },

        togglePanelState: function( doImmediately ) {
            if ( this.state === STATES.OPENED ) {
                this.close( doImmediately );
            } else {
                this.open( doImmediately );
            }
        },

        setContents: function( contents ) {
            $('div.drawer-contents', this.element).html( contents );
        },
        
        clearContents: function() {
            $('div.drawer-contents', this.element).empty();
        },
        
        getContentsReference: function() {
            return $('div.drawer-contents', this.element);
        },
        
        appendContents: function( newContents ) {
            this.getContentsReference().append(newContents);
        }

    });
})(jQuery);
