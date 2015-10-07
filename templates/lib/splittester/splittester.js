function SplitTester()
{
    this.menu;
    this.originalVariant;
    this.selectedVariant = 0;
    this.variants = [];
    this.elementID;

    this.createRectangle();
    this.createMenu();
    this.createModal();

    this.elements = {
        top: jQuery('#selector-top'),
        left: jQuery('#selector-left'),
        right: jQuery('#selector-right'),
        bottom: jQuery('#selector-bottom')
    };

    this.setupModalEvents();
}

SplitTester.prototype.setupModalEvents = function()
{
    var owner = this;

    jQuery(document.body).on("click", ".splittest-modal-variant", function() {
        owner.changeVariant(jQuery(this));
    });

    jQuery(document.body).on("click", "#splittest-modal-button-add", function() {
        owner.addVariant();
    });

    jQuery(document.body).on("click", "#splittest-modal-bar", function() {
        owner.postSplitTest();
    });
};

SplitTester.prototype.createRectangle = function()
{
    this.rectangle = jQuery(
        '<div id="selector">' +
            '<div id="selector-top"></div>' +
            '<div id="selector-left"></div>' +
            '<div id="selector-right"></div>' +
            '<div id="selector-bottom"></div>' +
        '</div>'
    );

    jQuery('body').append(this.rectangle);
};

SplitTester.prototype.createModal = function()
{
    $existingModal = jQuery("#splittest-modal");

    if ($existingModal.length) {
        $existingModal.remove();
    }

    this.modal = jQuery(
        '<div id="splittest-modal">' +
            '<div id="splittest-modal-bar">Save</div>' +
            '<div id="splittest-modal-menu">' +
                '<div id="splittest-modal-variants">' +
                    '<div id="splittest-modal-variant-0" class="splittest-modal-variant">Original</div>' +
                '</div>' +
                '<div id="splittest-modal-button-add">Add Variant</div>' +
            '</div>' +
            '<div id="splittest-modal-code"><textarea id="splittest-modal-input" name="splittest-modal-input"></textarea></div>' +
        '</div>'
    );

    jQuery('body').append(this.modal);
};

SplitTester.prototype.createMenu = function()
{
    this.menu = jQuery(
        '<div id="splittest-menu">' +
            '<img class="splittest-menu-item" src="img/test.png" width="25" heigth="25" />' +
            '<img class="splittest-menu-item" src="img/test.png" width="25" heigth="25" />' +
            '<a href="#splittest-modal" rel="modal:open"><img class="splittest-menu-item" src="img/test.png" width="25" heigth="25" /></a>' +
        '</div>'
    );

    jQuery("body").append(this.menu);
    this.menu.hide();
};

SplitTester.prototype.startMouseListening = function()
{
    var owner = this;

    $(document).mousemove(function(event) {
        owner.moveRectangle(event);
    });

    $(document).click(function(event) {
        owner.selectElement(event);
    });
};

SplitTester.prototype.selectElement = function(event)
{
    var owner = this;
    var $target = jQuery(event.target);

    /* If a menu button was clicked or modal is opened, don't select anything */
    if ($target.hasClass("splittest-menu-item") ||
        jQuery("#splittest-modal").is(":visible")) {
        return;
    }

    var hasSelectedElements = jQuery(".selected-split-test").length;
    this.unselectAllElements();

    /* If anything was selected, they're already unselected */
    if (hasSelectedElements) {
        this.menu.hide();
        return;
    }

    /* Nothing was selected, so select it */
    jQuery("#selector").hide();
    $target.addClass("selected-split-test");
    owner.showMenu(event);
    owner.getOriginalContent(event);
    owner.getElementPath(event);
};

SplitTester.prototype.unselectAllElements = function() {
    $selectedElements = jQuery(".selected-split-test");
    $selectedElements.removeClass("selected-split-test");
};

SplitTester.prototype.getOriginalContent = function(event)
{
    this.createModal();
    this.changeToVariant(0);
    this.originalVariant = event.target.outerHTML;
    this.variants[0] = this.originalVariant;
    jQuery("#splittest-modal-input").val(this.originalVariant);
};

SplitTester.prototype.showMenu = function(event) {
    targetPosition = event.target.getBoundingClientRect();

    this.menu.css("left", targetPosition.right);
    this.menu.css("top", targetPosition.bottom);
    this.menu.show();
};

SplitTester.prototype.moveRectangle = function(event)
{
    var owner = this;

    if (jQuery('.selected-split-test').length) {
        jQuery('#selector').hide();
        return;
    }

    jQuery('#selector').show();

    if (!owner.validateHoveredElement(event)) {
        return;
    }

    var $target = jQuery(event.target);
    owner.applyRectangleMovement($target);
};

SplitTester.prototype.validateHoveredElement = function(event)
{
    return !(event.target.id.indexOf('selector') !== -1 ||
        event.target.tagName === 'BODY' ||
        event.target.tagName === 'HTML' ||
        event.target.getAttribute("id") === "splittest-menu" ||
        event.target.classList.contains("splittest-menu-item") ||
        jQuery("#splittest-modal").is(":visible")
    );
};

SplitTester.prototype.applyRectangleMovement = function($target)
{
    targetOffset = $target[0].getBoundingClientRect(),
        targetHeight = targetOffset.height,
        targetWidth  = targetOffset.width;

    this.elements.top.css({
        left:  (targetOffset.left - 4),
        top:   (targetOffset.top - 4),
        width: (targetWidth + 5)
    });
    this.elements.bottom.css({
        top:   (targetOffset.top + targetHeight + 1),
        left:  (targetOffset.left  - 3),
        width: (targetWidth + 4)
    });
    this.elements.left.css({
        left:   (targetOffset.left  - 5),
        top:    (targetOffset.top  - 4),
        height: (targetHeight + 8)
    });
    this.elements.right.css({
        left:   (targetOffset.left + targetWidth + 1),
        top:    (targetOffset.top  - 4),
        height: (targetHeight + 8)
    });
};

SplitTester.prototype.getElementPath = function(e)
{
    e.preventDefault();
    clickedElement = e.target;

    var elementId = this.getElementId(clickedElement);

    if (!elementId) {
        alert("This element cannot be selected. Please, try another one.");
        this.unselectAllElements();
        this.menu.hide();
    }

    this.elementID = elementId;
};

/**
 * Tries to find the element ID, if any, and then returns the CSS selector with it.
 *
 * @param element
 * @returns {*}
 */
SplitTester.prototype.getElementId = function(element)
{
    var elementId = clickedElement.getAttribute("id");

    if (!elementId) {
        return null;
    }

    return element.tagName.toLowerCase() + "#" + elementId;
};

/**
 * Tries to get the full Xpath for the element.
 *
 * @param element
 * @returns {string}
 */
SplitTester.prototype.getXPath = function(element )
{
    var val=element.value;
    var xpath = '';
    for ( ; element && element.nodeType == 1; element = element.parentNode )
    {
        //alert(element);
        var id = $(element.parentNode).children(element.tagName).index(element) + 1;
        id > 1 ? (id = '[' + id + ']') : (id = '');
        xpath = '/' + element.tagName.toLowerCase() + id + xpath;
    }
    return xpath;
};

SplitTester.prototype.addVariant = function()
{
    $variantsList = jQuery("#splittest-modal-variants");
    var numberOfVariants = $variantsList.find("div").length;
    $newVariant = jQuery('<div id="splittest-modal-variant-'+numberOfVariants+'" class="splittest-modal-variant">Variant '+numberOfVariants+'</div>');

    $variantsList.append($newVariant);
    this.changeToVariant(numberOfVariants);
};

SplitTester.prototype.changeVariant = function($clicked)
{
    /* Finds newly selected variant */
    var idArray = $clicked.attr("id").split("-");
    var newlySelected = idArray[idArray.length-1];

    this.changeToVariant(newlySelected);
};

SplitTester.prototype.changeToVariant = function(newlySelected)
{
    $textArea = jQuery("#splittest-modal-input");

    /* Finds previously selected variant */
    var previouslySelected = this.selectedVariant;

    /* If a selected variant isn't */
    if (isNaN(newlySelected)) {
        newlySelected = 0;
    }

    /* Save current contents */
    this.variants[previouslySelected] = $textArea.val();

    /* Change contents */
    $textArea.val(this.variants[newlySelected]);

    /* Updates currently selected */
    this.selectedVariant = newlySelected;

    this.changeSelectedBackground(previouslySelected, newlySelected);
};

SplitTester.prototype.changeSelectedBackground = function(from, to)
{
    $from = jQuery("#splittest-modal-variant-"+ from);
    $to = jQuery("#splittest-modal-variant-"+ to);

    $from.css("background-color", "");
    $from.css("color", "white");
    $to.css("background-color", "#aaa");
    $to.css("color", "black");
};

SplitTester.prototype.postSplitTest = function()
{
    console.log({
    url: window.location.href,
        elementID: this.elementID
});
    $.ajax({
        type: "POST",
        url: "/splittest",
        data: {
            url: window.location.href,
            elementID: this.elementID
        },
        dataType: "json",
        done: function(data) {
            owner.postVariations(data.id);
        },
        fail: function(error) {
            alert("Error while trying to save Split Test.");
        }
    });
};

SplitTester.prototype.postVariations = function(splitTestId)
{
    for (i in this.variants) {
        this.postVariation(this.variants[i], splitTestId);
    }
}

SplitTester.prototype.postVariation = function(variation, splitTestId)
{
    $.ajax({
        type: "POST",
        url: "/variation",
        data: {
            variation: {
                splitTestID: splitTestId,
                title: "Variation from Split Test #" + splitTestId,
                content: ""
            }
        },
        dataType: "json",
        done: function(data) {
            console.log("Variation posted successfully.");
        },
        fail: function(error) {
            alert("Error while trying to save Variation.");
        }
    });
}

splitTester = new SplitTester();
splitTester.startMouseListening();