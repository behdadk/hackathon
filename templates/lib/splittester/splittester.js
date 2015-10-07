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

    jQuery(document.body).on("click", "#splittest-modal-bar", function () {
        owner.postSplitTest();
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

/**
 * Creates menu that will show for a selected element.
 *
 * @name createMenu
 */
SplitTester.prototype.createMenu = function () {
    this.menu = jQuery(
        '<div id="splittest-menu">' +
        '<img class="splittest-menu-item" src="/templates/img/test.png" width="25" heigth="25" />' +
        '<img class="splittest-menu-item" src="/templates/img/test.png" width="25" heigth="25" />' +
        '<a href="#splittest-modal" rel="modal:open"><img class="splittest-menu-item" src="/templates/img/test.png" width="25" heigth="25" /></a>' +
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
    this.originalVariant = event.target.outerHTML;
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
    targetPosition = event.target.getBoundingClientRect();

    this.menu.css("left", targetPosition.right);
    this.menu.css("top", targetPosition.bottom);
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
    e.preventDefault();
    clickedElement = e.target;

    var elementId = this.getElementId(clickedElement);

    console.log(elementId);

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
    var numberOfVariants = $variantsList.find("div").length;
    $newVariant = jQuery('<div id="splittest-modal-variant-' + numberOfVariants + '" class="splittest-modal-variant">Variant ' + numberOfVariants + '</div>');

    $variantsList.append($newVariant);
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

    $from.css("background-color", "");
    $from.css("color", "white");
    $to.css("background-color", "#aaa");
    $to.css("color", "black");
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
    this.changeToVariant(0);

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
    var requestBody = JSON.stringify({
        variation: {
            splitTestID: splitTestId,
            title: "Variation from Split Test #" + splitTestId,
            content: variation
        }
    });

    $.post("/variation", requestBody).done(function (data) {
        data = JSON.parse(data);
        console.log(data);
    });
};

/* Initializes */
splitTester = new SplitTester();
splitTester.startMouseListening();
