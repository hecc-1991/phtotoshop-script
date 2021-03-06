if (typeof ($) == 'undefined')
    $ = {};

$._ext = (function (exports) {
    //Evaluate a file and catch the exception.
    exports.evalFile = function (path) {
            try {
                $.evalFile(path);

            } catch (e) {
                alert("Exception:" + e);
            }
        },
        // Evaluate all the files in the given folder 
        exports.evalFiles = function (jsxFolderPath) {
            var folder = new Folder(jsxFolderPath);

            if (folder.exists) {
                var jsxFiles = folder.getFiles("*.jsx");

                for (var i = 0; i < jsxFiles.length; i++) {
                    var jsxFile = jsxFiles[i];
                    $._ext.evalFile(jsxFile);
                }
            }
        }
    return exports;
})($._ext || {});