/**
 * Created by christian on 6/8/15.
 */

var inventoryContainer = Ractive.extend({
    template: '\
        <div class="container">\
            <div class="row">\
                <div class="col-sm-3">\
                \
                    <div id="filter" class="input-group">\
                        <input on-change="filterItemsFull()" value={{filter}} type="text" class="form-control" placeholder="Filter...">\
                        <span class="input-group-addon glyphicon glyphicon-search"></span>\
                    </div>\
                    \
                    <div class="panel panel-default attribute-panel">\
                        <div class="panel-heading">\
                            {{panel.title.attribute}}\
                        </div>\
                        \
                        <div class="panel-body">\
                            <div class="checkbox attributes-entry">\
                                <label>\
                                    <input on-change="filterItemsFull()" checked={{allAttributes}} type="checkbox"><p class="checkbox-label">  Show All Attributes</p>\
                                </label>\
                            </div>\
                            {{#each attributes:i}}\
                                <div class="checkbox attributes-entry">\
                                    <label>\
                                        <input on-change="filterItemsFull()" checked={{.status}} type="checkbox"><p class="checkbox-label">  {{attributeName}}</p>\
                                    </label>\
                                </div>\
                            {{/each}}\
                        </div>\
                    </div>\
                </div>\
                \
                <div class="col-sm-9">\
                    <div id="inventory-panel-table" class="panel panel-default">\
                        <table id="inventory-table" class="table table-bordered">\
                            <thead>\
                                <tr>\
                                    <th>ID</th>\
                                    <th>Name</th>\
                                    <th>Category</th>\
                                    <th>Parent Container</th>\
                                    <th>Amount</th>\
                                </tr>\
                            </thead>\
                            \
                            <tbody>\
                                {{#each items:i}}\
                                    <tr id="item_{{i}}">\
                                        <td>{{_id}}</td>\
                                        <td>{{name}}</td>\
                                        <td>{{category_id}}</td>\
                                        <td>{{parentContainerName}}</td>\
                                        <td>{{amount}}</td>\
                                    </tr>\
                                {{/each}}\
                            </tbody>\
                        </table>\
                    </div>\
                </div>\
            </div>\
        </div>\
        ',

    data: {
        items: null,         // all items for item table
        filteredItems: null,
        backupItems: null,
        attributes: null,    // all attributes for attributes panel
        allAttributes: true,
        filteredItemsByAttribute: null
    },

    oninit: function() {
        window.currentRactive = this;           // often can't access ractive so we save it using a global var
        window.currentRactive.refreshItems();
        //window.currentRactive.refreshAttributes();
    },

    oncomplete: function() {

    },

    /* items */

    refreshItems: function() {
        loadStore(function(success, container) {
            window.storage = container;
            var allContainerItems = getAllItems(window.storage);
            window.containerItems = allContainerItems;

            getDataItems(allContainerItems,function(success, data) {
                if(success) {
                    for(i = 0; i < window.containerItems.length; ++i){

                        data[i].amount = window.containerItems[i].amount;
                        data[i].parentContainerID = window.containerItems[i].parentContainerID;
                        var containerName = getContainerById(window.storage, data[i].parentContainerID).containerName;
                        data[i].parentContainerName = containerName;
                    }

                    window.currentRactive.set('items', data);

                    /* deep clone */
                    var backup = JSON.parse(JSON.stringify(data));

                    for (i = 0; i < data.length; i++) {
                        if (data[i].attributes)
                            backup[i].attributes = JSON.parse(JSON.stringify(data[i].attributes));
                    }



                    window.currentRactive.set('backupItems', backup);
                }
                else {
                    window.currentRactive.set('items', data);
                    var backup = JSON.parse(JSON.stringify(data));
                    window.currentRactive.set('backupItems', backup);
                }

                window.currentRactive.refreshAttributes();
            });
        });
    },

    /* attributes */

    refreshAttributes: function() {
        /* load all items */
        var allItems = window.currentRactive.get('items');
        var allAttributes = [];

        /* iterate over every item */
        allItems.map(function (item) {
            if (item.attributes != null) {

                /* nested for loops to check whether an attribute is already in the attributes array */
                for (var i = 0; i < item.attributes.length; i++) {
                    var newAttribute = true;

                    for (var j = 0; j < allAttributes.length; j++) {
                        if (item.attributes[i].attributeName == allAttributes[j].attributeName) {
                            newAttribute = false;
                        }
                    }

                    if (newAttribute) {
                        item.attributes[i].status = true;
                        allAttributes.push(item.attributes[i]);
                    }
                }
            }
        });

        window.currentRactive.set('attributes', allAttributes);
    },

    /* filter */
    filterItems: function() {

        /* restore backup in case there was already a filter (call by reference --> copy) */
        var backupItemsArray = window.currentRactive.get('backupItems');

        /* deep clone */
        var copy = JSON.parse(JSON.stringify(backupItemsArray));


        window.currentRactive.set('items', copy);

        /* copy current items to new filter array */
        var allItemsArray = window.currentRactive.get('items');
        var filterArray = allItemsArray.slice();
        var filterText = window.currentRactive.get('filter');

        /* filter */
        for (var i = 0; i < filterArray.length; i++) {

            if (window.currentRactive.isFiltered(filterArray[i], filterText)) {
                filterArray.splice(i, 1);
                i--;
            }
        }

        /* set filter array to current items */
        window.currentRactive.set('items', filterArray);
    },

    /* filter condition */
    isFiltered: function(item, filter) {
        if (
            (item.name.indexOf(filter) == -1) &&
            (item._id.indexOf(filter) == -1) &&
            (item.category_id.indexOf(filter) == -1) &&
            (item.parentContainerName.indexOf(filter) == -1)
        ) {
            return true;
        }
        else {
            return false;
        }
    },

    filterItemsFull: function() {
        var allAttributesGetShown = window.currentRactive.get('allAttributes');

        if (!allAttributesGetShown) {
            /* call text filter to first filter by text */
            window.currentRactive.filterItems();

            /* copy items in new filter Array */
            var currentItems = window.currentRactive.get('items');
            var filterArray = currentItems.slice();
            var filteredAttributes = window.currentRactive.get('attributes');

            console.log("before");
            console.log(filterArray);

            /* extract all attributes with status false from items in filter Array */
            filteredAttributes.map(function (attr) {
                if (attr.status == false) {
                    console.log("will check " + attr.attributeName);
                    for (var i = 0; i < filterArray.length; i++) {
                        if (filterArray[i].attributes != null) {
                            window.currentRactive.checkAndRemoveAttributes(filterArray[i], attr.attributeName);
                        }
                    }
                }
            });

            console.log(filterArray);

            /* now extract all items with now attributes from the filter Array */
            for (var i = 0; i < filterArray.length; i++) {
                if (filterArray[i].attributes == null || filterArray[i].attributes.length == 0) {
                    filterArray.splice(i, 1);
                    i--;
                }
            }

            /* set the filter array to the normal items object */
            window.currentRactive.set('items', filterArray);
        }
        else {
            window.currentRactive.filterItems();
        }
    },

    checkAndRemoveAttributes: function(item, attrName) {
        if (item.attributes != null) {
            for (var i = 0; i < item.attributes.length; i++) {
                if (item.attributes[i].attributeName == attrName) {
                    item.attributes.splice(i, 1);
                    i--;
                    console.log('spliced attribute');
                }
            }
        }
    }
});
