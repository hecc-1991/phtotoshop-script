/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

(function () {
    'use strict';

    var csInterface = new CSInterface();

    function callExtendScript(method) {
        var args = [].splice.call(arguments, 1);
        var callback = undefined;

        var params = [];
        for (var idx in args) {
            var arg = args[idx];
            if (typeof (arg) == 'function') {
                callback = arg;
            } else {
                params.push(JSON.stringify(arg));
            }
        }
        var functionArgs = params.length ? '(' + params.join(',') + ')' : '()';
        var script = method + functionArgs;
        // evaluate against the ExtendScript context.
        csInterface.evalScript(script);
    }

    function log_info(content) {
        $("#p_log").css("color", "#86F283")
        $("#p_log").text(content)
    }

    function log_error(content) {
        $("#p_log").css("color", "#F28383")
        $("#p_log").text(content)
    }

    function setSourcePath(path) {
        $("#p_source_dir").text(path)
    }


    function init() {

        themeManager.init();

        var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + "/jsx";
        callExtendScript('$._ext.evalFiles', extensionRoot);

        var resourcePath = ''

        $("#btn_source_dir").click(function () {
            
            log_info("")

            csInterface.evalScript('$.Exporter.openResourcePath()',
                function (result) {
                    //alert(result)
                    var data = JSON.parse(result)
                    resourcePath = data.absoluteURI
                    setSourcePath(data.fsName)
                })
        })


        $("#btn_gen_config").click(function () {
            
            log_info("")

            if (resourcePath == '') {
                log_error("错误:请先设置图片资源文件目录")
                return
            }
            csInterface.evalScript('$.Exporter.exportConfig("' + resourcePath + '")',
                function(result){
                    var data = JSON.parse(result)
                    if(data.stat != 0){
                        log_error(data.info)
                    }else{
                        log_info(data.info)
                    }
            })
        })
    }

    init()

}());