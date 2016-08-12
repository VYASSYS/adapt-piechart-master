/*
 * adapt-piechart
 * License - http://github.com/adaptlearning/adapt_framework/LICENSE
 * Maintainers - Martin Sandberg <martin.sandberg@xtractor.se>
 */
define(function(require) {
    var ComponentView = require('coreViews/componentView');
    var Adapt = require('coreJS/adapt');

    var Piechart = ComponentView.extend({

        preRender: function() {
            this.listenTo(Adapt, 'device:changed', this.printChart);
            this.checkIfResetOnRevisit();
        },

        /* this is use to set ready status for current component on postRender */
        postRender: function() {
            this.setReadyStatus();

            this.printChart();
            this.$('.component-widget').on('inview', _.bind(this.inview, this));
        },

        // Used to check if the accordion should reset on revisit
        checkIfResetOnRevisit: function() {
            var isResetOnRevisit = this.model.get('_isResetOnRevisit');

            // If reset is enabled set defaults
            if (isResetOnRevisit) {
                this.model.reset(isResetOnRevisit);

                _.each(this.model.get('_items'), function(item) {
                    item._isVisited = false;
                });
            }
        },

        printChart: function() {
            var canvas;
            var ctx;
            var lastend = 0;
            var myTotal = this.getTotal();

            canvas = document.getElementById("piechart_" + this.model.get('_id'));

            width = $(canvas).parent().width();
            if (width > parseInt(this.model.get('maxsize')))
            {
                width = parseInt(this.model.get('maxsize'));
            }
            canvas.width = width;
            canvas.height = width;

            ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);

             var myItemData = this.model.get('_items');

            for (var i = 0; i < myItemData.length; i++) {
                ctx.fillStyle = myItemData[i].colour;
                var currValue = myItemData[i].value;
                ctx.beginPath();
                ctx.moveTo(width/2,width/2);
                ctx.arc(width/2,width/2,width/2,lastend,lastend+
                  (Math.PI*2*(currValue/myTotal)),false);
                ctx.lineTo(width/2,width/2);
                ctx.fill();
                lastend += Math.PI*2*(currValue/myTotal);
            }
        },

        getTotal: function(){
           var myTotal = 0;
           var myItemData = this.model.get('_items');

            for (var i = 0; i < myItemData.length; i++) {
                var myvalue = parseInt(myItemData[i].value);
                myTotal += (typeof myvalue === 'number') ? myvalue : 0;
            }
            return myTotal;
        },

        inview: function(event, visible, visiblePartX, visiblePartY) {
            if (visible) {
                if (visiblePartY === 'top') {
                    this._isVisibleTop = true;
                } else if (visiblePartY === 'bottom') {
                    this._isVisibleBottom = true;
                } else {
                    this._isVisibleTop = true;
                    this._isVisibleBottom = true;
                }

                if (this._isVisibleTop && this._isVisibleBottom) {
                    this.$(this.model.get('.component-widget')).off('inview');
                    this.setCompletionStatus();
                }
            }
        }

    });

    Adapt.register("piechart", Piechart);
    return Piechart;
});
