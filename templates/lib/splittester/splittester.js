/**
 * Allows page to be used with a selector for AB Tests with different
 * elements from it.
 *
 * @name SplitTester
 * @constructor
 */
function SplitTester() {
    this.menu;
    this.originalVariant;
    this.selectedVariant = 0;
    this.variants = [];
    this.elementID;
    this.currentElement;
    this.splitTests = {};

    this.createRectangle();
    this.createModal();

    this.elements = {
        top: jQuery('#selector-top'),
        left: jQuery('#selector-left'),
        right: jQuery('#selector-right'),
        bottom: jQuery('#selector-bottom')
    };

    this.setupModalEvents();
    this.setupMenuEvents();

    jQuery(document.body).on("click", "#splittest-menu-edit a", function () {
        jQuery("#splittest-modal").modal({
            closeText: ''
        });
//        $("#splittest-modal").css("top", "25%");
    });
}

/**
 * Adds and setups events for the modal.
 *
 * @name setupModalEvents
 */
SplitTester.prototype.setupModalEvents = function () {
    var owner = this;

    jQuery(document.body).on("click", ".splittest-modal-variant", function () {
        owner.changeVariant(jQuery(this));
    });

    jQuery(document.body).on("click", "#splittest-modal-button-add", function () {
        owner.addVariant();
    });

    jQuery(document.body).on("click", "#splittest-modal-save", function () {

        owner.changeToVariant(0);

        /* Only save if there are variants */
        if (owner.variants.length > 1) {
            owner.postSplitTest();
            $("#splittest-modal a").trigger("click");
        } else {
            alert("Please, add one or more variants to save a Split Test.");
        }
    });
};

SplitTester.prototype.setupMenuEvents = function() {
    var owner = this;

    jQuery(document.body).on("click", "#splittest-menu-variants .splittest-menu-item", function () {
        owner.showVariantInPage(jQuery(this));
    });
};

/**
 * Creates rectangle that will be around hovered elements.
 *
 * @name createRectangle
 */
SplitTester.prototype.createRectangle = function () {
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

/**
 * Creates modal that will be shown when an element is selected.
 *
 * @name createModal
 */
SplitTester.prototype.createModal = function () {
    $existingModal = jQuery("#splittest-modal");

    if ($existingModal.length) {
        $existingModal.remove();
    }

    var variants = "";

    if (this.variants !== undefined && this.variants != null) {
        for (i = 1; i < this.variants.length; i++) {
            variants += '<div id="splittest-modal-variant-'+i+'" class="splittest-modal-variant">Variant '+i+'</div>';
        }
    }

    this.modal = jQuery(
        '<div id="splittest-modal">' +
        '<div id="splittest-modal-top-bar">' +
        '<div id="splittest-modal-title">Edit Variants</div>' +
        '<div id="splittest-modal-save" class="splittest-modal-top-item">Save</div>' +
        '<div id="splittest-modal-close" class="splittest-modal-top-item"><a rel="modal:close">Close</a></div>' +
        '</div>' +
        '<div id="splittest-modal-menu">' +
        '<div id="splittest-modal-variants">' +
        '<div id="splittest-modal-variant-0" class="splittest-modal-variant">Original</div>' +
            variants +
        '<div id="splittest-modal-button-add">+ add variant</div>' +
        '</div>' +
        '</div>' +
        '<div id="splittest-modal-code"><textarea id="splittest-modal-input" name="splittest-modal-input"></textarea></div>' +
        '</div>'
    );

    jQuery('body').append(this.modal);
};

/**
 * Creates menu that will show for a selected element.
 *
 * @name createMenu
 */
SplitTester.prototype.createMenu = function () {

    var menuItems = "";

    if (this.variants !== undefined && this.variants != null) {
        for (i = 1; i < this.variants.length; i++) {
            menuItems += '<div class="splittest-menu-item">'+i+'</div>';
        }
    }

    this.menu = jQuery(
        '<div id="splittest-menu">' +
        '<div id="splittest-menu-variants" class="splittest-menu-sub">' +
        '<div class="splittest-menu-item">C</div>' +
            menuItems +
        '</div>' +
        '<div id="splittest-menu-edit" class="splittest-menu-sub">' +
        '<div class="splittest-menu-item"><a>Edit</a></div>' +
        '</div>' +
        '</div>'
    );

    jQuery("body").append(this.menu);
    this.menu.hide();
};

/**
 * Activates everything.
 *
 * @name startMouseListening
 */
SplitTester.prototype.startMouseListening = function () {
    var owner = this;

    $(document).mousemove(function (event) {
        owner.moveRectangle(event);
    });

    $(document).click(function (event) {
        event.preventDefault();
        owner.selectElement(event);
    });
};

/**
 * Selects (or unselects) an element after a click.
 *
 * @name selectElement
 * @param event
 */
SplitTester.prototype.selectElement = function (event) {
    var owner = this;
    var $target = jQuery(event.target);

    /* If a menu button was clicked or modal is opened, don't do anything */
    if ($target.hasClass("splittest-menu-item") ||
        $target.attr("id") == "splittest-modal-save" ||
        $target.attr("rel") == "modal:close" ||
        jQuery("#splittest-modal").is(":visible")) {
        return;
    }


    var hasSelectedElements = jQuery(".selected-split-test").length;
    this.unselectAllElements();

    /* If anything was found to be selected, don't worry.
    They've just been unselected a couple of lines ago */
    if (hasSelectedElements) {
        this.saveCurrentTest();
        this.unselectCurrentTest();
        this.hideMenu();
        return;
    }

    /* Nothing was selected, so select the clicked element */
    jQuery("#selector").hide();
    $target.addClass("selected-split-test");
    var elementID = owner.getElementPath(event);
    owner.switchToTest(elementID);
    owner.getOriginalContent(event);
    owner.showMenu(event);
};

SplitTester.prototype.switchToTest = function(elementID)
{;
    this.saveCurrentTest();

    /* Ensures variants for this test */
    if (this.splitTests[elementID] === undefined) {
        this.splitTests[elementID] = [];
    }

    /* Changes */
    this.variants = this.splitTests[elementID];
    this.elementID = elementID;

};

SplitTester.prototype.saveCurrentTest = function()
{
    /* Save previous one, if any */
    if (this.variants && this.variants !== undefined && this.variants != []) {
        this.splitTests[this.elementID] = this.variants;
    }
}

/**
 * Unselects all selected elements.
 *
 * @name unselectAllElements
 */
SplitTester.prototype.unselectAllElements = function () {
    $selectedElements = jQuery(".selected-split-test");
    $selectedElements.removeClass("selected-split-test");
};

/**
 * Gets html content from selected element.
 *
 * @name getOriginalContent
 * @param event
 */
SplitTester.prototype.getOriginalContent = function (event) {
    this.createModal();
    this.changeToVariant(0);
    this.originalVariant = event.target.outerHTML.replace("selected-split-test", "");
    this.variants[0] = this.originalVariant;
    jQuery("#splittest-modal-input").val(this.originalVariant);
};

/**
 * Shows menu for selected element.
 *
 * @name showMenu
 * @param event
 */
SplitTester.prototype.showMenu = function (event) {
    this.createMenu();
    targetPosition = event.target.getBoundingClientRect();

    this.menu.css("left", targetPosition.left + jQuery(document).scrollLeft());
    this.menu.css("top", targetPosition.bottom + jQuery(document).scrollTop());
    this.menu.show();
};

/**
 * Moves rectangle through elements as mouse moves.
 *
 * @name moveRectangle
 * @param event
 */
SplitTester.prototype.moveRectangle = function (event) {
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

/**
 * Validates if hovered element should be marked for possible selection.
 *
 * @name validateHoveredElement
 * @param event
 * @returns {boolean}
 */
SplitTester.prototype.validateHoveredElement = function (event) {
    return !(event.target.id.indexOf('selector') !== -1 ||
        event.target.tagName === 'BODY' ||
        event.target.tagName === 'HTML' ||
        event.target.getAttribute("id") === "splittest-menu" ||
        event.target.classList.contains("splittest-menu-item") ||
        jQuery("#splittest-modal").is(":visible")
    );
};

/**
 * Transforms divs into right sized rectangle as mouse hovers.
 *
 * @name applyRectangleMovement
 * @param $target
 */
SplitTester.prototype.applyRectangleMovement = function ($target) {
    targetOffset = $target[0].getBoundingClientRect(),
        targetHeight = targetOffset.height,
        targetWidth = targetOffset.width;

    this.elements.top.css({
        left: (targetOffset.left - 4),
        top: (targetOffset.top - 4),
        width: (targetWidth + 5)
    });
    this.elements.bottom.css({
        top: (targetOffset.top + targetHeight + 1),
        left: (targetOffset.left - 3),
        width: (targetWidth + 4)
    });
    this.elements.left.css({
        left: (targetOffset.left - 5),
        top: (targetOffset.top - 4),
        height: (targetHeight + 8)
    });
    this.elements.right.css({
        left: (targetOffset.left + targetWidth + 1),
        top: (targetOffset.top - 4),
        height: (targetHeight + 8)
    });
};

/**
 * Finds and stores element path that will be sent to the database for the Split Test.
 *
 * @name getElementPath
 * @param e
 */
SplitTester.prototype.getElementPath = function (e) {
    clickedElement = e.target;

    this.currentElement = jQuery(clickedElement);
    var elementId = this.getXPath(clickedElement);

    console.log(elementId);

    if (!elementId) {
        alert("This element cannot be selected. Please, try another one.");
        this.unselectAllElements();
        this.unselectCurrentTest();
        this.hideMenu();
    }

    return elementId;
};

/**
 * Tries to find the element ID, if any, and then returns the CSS selector with it.
 *
 * @name getElementId
 * @param element
 * @returns {*}
 */
SplitTester.prototype.getElementId = function (element) {
    var elementId = clickedElement.getAttribute("id");

    if (!elementId) {
        return null;
    }

    return element.tagName.toLowerCase() + "#" + elementId;
};

/**
 * Tries to get the full Xpath for the element.
 *
 * @name getXPath
 * @param element
 * @returns {string}
 */
SplitTester.prototype.getXPath = function (element) {
    var val = element.value;
    var xpath = '';
    for (; element && element.nodeType == 1; element = element.parentNode) {
        //alert(element);
        var id = $(element.parentNode).children(element.tagName).index(element) + 1;
        id > 1 ? (id = '[' + id + ']') : (id = '');
        xpath = '/' + element.tagName.toLowerCase() + id + xpath;
    }
    return xpath;
};

/**
 * Adds new variant to the Split Test in the modal.
 *
 * @name addVariant
 */
SplitTester.prototype.addVariant = function () {
    $variantsList = jQuery("#splittest-modal-variants");
    var numberOfVariants = $variantsList.find("div.splittest-modal-variant").length;
    $newVariant = jQuery('<div id="splittest-modal-variant-' + numberOfVariants + '" class="splittest-modal-variant">Variant ' + numberOfVariants + '</div>');

    jQuery("#splittest-modal-button-add").before($newVariant);

    this.changeToVariant(numberOfVariants);
};

/**
 * Changes selected variant to newly clicked.
 *
 * @name changeVariant
 * @param $clicked
 */
SplitTester.prototype.changeVariant = function ($clicked) {
    /* Finds newly selected variant */
    var idArray = $clicked.attr("id").split("-");
    var newlySelected = idArray[idArray.length - 1];

    this.changeToVariant(newlySelected);
};

/**
 * Changes selected variant to the one of the passed position.
 *
 * @name changeToVariant
 * @param newlySelected
 */
SplitTester.prototype.changeToVariant = function (newlySelected) {
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

/**
 * Marks a new variant as selected.
 *
 * @name changeSelectedBackground
 * @param from
 * @param to
 */
SplitTester.prototype.changeSelectedBackground = function (from, to) {
    $from = jQuery("#splittest-modal-variant-" + from);
    $to = jQuery("#splittest-modal-variant-" + to);

    $from.css("background-color", "#F0F0F0");
    $to.css("background-color", "white");
};

/**
 * Saves SplitTest into the database.
 *
 * @name postSplitTest
 */
SplitTester.prototype.postSplitTest = function () {
    var owner = this;

    var requestBody = JSON.stringify({
        splittest: {
            url: window.location.href,
            elementID: this.elementID
        }
    });

    $.post("/splittest", requestBody).done(function (data) {
        data = JSON.parse(data);
        owner.postVariations(data.id);
    });
};

/**
 * Saves SplitTest variations into the database.
 *
 * @param splitTestId
 */
SplitTester.prototype.postVariations = function (splitTestId) {
    for (i = 1; i < this.variants.length; i++) {
        this.postVariation(this.variants[i], splitTestId);
    }
};

/**
 * Saves SplitTest variation into the database.
 *
 * @param variation
 * @param splitTestId
 */
SplitTester.prototype.postVariation = function (variation, splitTestId) {

    var owner = this;

    var requestBody = JSON.stringify({
        variation: {
            splitTestID: splitTestId,
            title: "Variation from Split Test #" + splitTestId,
            content: variation
        }
    });

    $.post("/variation", requestBody).done(function (data) {
        data = JSON.parse(data);
        if (data.id) {
            owner.addVariantToMenu(variation);
        }
    });
};

SplitTester.prototype.addVariantToMenu = function(variant)
{
    console.log("addVariantToMenu");
    $menuItems = jQuery("#splittest-menu-variants .splittest-menu-item");
    $lastMenuItem = $menuItems.last();
    var numberOfMenuItems = $menuItems.length;

    $newMenuItem = jQuery('<div class="splittest-menu-item">'+numberOfMenuItems+'</div>');
    $lastMenuItem.after($newMenuItem);
};

SplitTester.prototype.showVariantInPage = function($clicked) {
    var variantPosition = $clicked.html().split(" ").slice(-1).pop();

    if (isNaN(variantPosition)) {
        variantPosition = 0;
    }

    this.currentElement.html(this.variants[variantPosition]);
};

SplitTester.prototype.hideMenu = function() {
    this.menu.remove();
};

SplitTester.prototype.unselectCurrentTest = function() {
    this.variants = [];
};

/* Initializes */
splitTester = new SplitTester();
splitTester.startMouseListening();
