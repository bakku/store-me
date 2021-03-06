/**
 * Created by Marcel on 25.06.2015.
 */


/**
 * A Constructor for Log files, a log file describes what happened to the store, was there something stoked or depleted
 *
 * @param {Boolean} stored      - Shows if the data is stoked (true) or depleted (false)
 * @param {String} containerID  - The container where the movement happened
 * @param {String} itemName     - The item which stoked or depleted
 * @param {Number} amount       - The amount of the item which is stoked or depleted
 * @param {String} employee     - The name of the employee who stoked/depleted items
 * @prop {Boolean} stored       - Shows if the data is stoked (true) or depleted (false)
 * @prop {String} date          - The time when the movement in the store happened
 * @prop {String} itemName      - The item which stoked or depleted
 * @prop {Number} amount        - The amount of the item which is stoked or depleted
 * @prop {String} employee      - The name of the employee who stoked/depleted items
 * @constructor
 * @author Marcel Gross
 */
function LogContainer(stored, containerID, itemName, amount, employee)
{
    this.stored = stored;
    this.date = getCurrentTime();
    this.containerID = containerID;
    this.itemName = itemName;
    this.amount = amount;
    this.employee = employee;
}

/**
 * Returns a string representation for the current time stamp in the form dd.MM.yyyy hh:mm:ss.
 * @function
 * @returns {String} Time stamp
 * @author Marcel Groß, Marvin Therolf
 */
var getCurrentTime = function ()
{
    var now = new Date();
    var dd = now.getDate();
    var MM = now.getMonth()+1; //January is 0!
    var yyyy = now.getFullYear();
    var hh = now.getHours();
    var mm = now.getMinutes();
    var ss = now.getSeconds();

    if (dd < 10)
    {
        dd = "0" + dd;
    }
    if (MM < 10)
    {
        MM = "0" + MM;
    }
    if (hh < 10)
    {
        hh = "0" + hh;
    }
    if (mm < 10)
    {
        mm = "0" + mm;
    }
    if (ss < 10)
    {
        ss = "0" + ss;
    }
    var currentTime = dd + "." + MM + "." + yyyy + " " + hh + ":" + mm  + ":" + ss;
    return currentTime;
};

/**
 * A function to save a logContainer into the database
 * @function
 * @param {LogContainer} logContainer       - The logContainer which should be stored into the database
 * @param {Function} callBackFunction       - Necessary callBackFunction
 * @author Marcel Gross
 */
var saveLogContainer = function(logContainer, callBackFunction){
    $.couch.urlPrefix = strings.link.dbConnection;
    $.couch.db(strings.database.log).saveDoc(logContainer, {
        success: function(data) {
            callBackFunction(true);
        },
        error: function(error){
            console.log(error);
            callBackFunction(false);
        }
    })
};

/**
 * A function to load logContainer from the database
 * @function
 * @param {Function} callBackFunction       - Necessary callBackFunction
 * @author Marcel Gross
 */
var loadAllLogContainer = function (callBackFunction) {
    $.couch.urlPrefix = strings.link.dbConnection;

    var mapFunction = function(doc) {
        emit(null, doc);
    };
    $.couch.db(strings.database.log).query(mapFunction, "_count", "javascript", {
        success: function(data) {
            try {
                var logs = data["rows"];
                callBackFunction(true, logs);
            } catch(err){
                callBackFunction(true);
            }
        },
        error: function(status) {
            console.log(status);
            callBackFunction(false);
        },
        reduce: false
    });
};

