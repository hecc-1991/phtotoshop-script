/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

(function () {
    'use strict';

    var csInterface = new CSInterface()

    var resourcePath = ''
    var dstPath = ''
    var layInfos = []

    function callExtendScript(method) {
        var args = [].splice.call(arguments, 1)
        var callback = undefined

        var params = []
        for (var idx in args) {
            var arg = args[idx]
            if (typeof (arg) == 'function') {
                callback = arg
            } else {
                params.push(JSON.stringify(arg))
            }
        }
        var functionArgs = params.length ? '(' + params.join(',') + ')' : '()'
        var script = method + functionArgs
        csInterface.evalScript(script)
    }

    function log_clear() {
        $("#div_log").attr("class", "")
        $("#p_log").text("")
    }

    function log_info(content) {
        $("#div_log").attr("class", "alert alert-dismissible alert-success")
        $("#p_log").text(content)
    }

    function log_error(content) {
        $("#div_log").attr("class", "alert alert-dismissible alert-danger")
        $("#p_log").text(content)
    }

    function setSourcePath(path) {
        $("#p_source_dir").text(path)
    }

    function setDstPath(path) {
        $("#p_dst_dir").text(path)
    }

    function listLayers(layInfos) {

        $("#tb_layers").html("")

        for (var i = 0; i < layInfos.length; i++) {
            var index = i + 1

            var layer = layInfos[i]

            var tr = document.createElement("tr")

            var tdNum = document.createElement("td")
            tdNum.innerHTML = index
            tr.appendChild(tdNum)

            var tdLayer = document.createElement("td")
            tdLayer.innerHTML = layer.name
            tr.appendChild(tdLayer)

            var tdFix = document.createElement("td")
            var checkBox = document.createElement("input")
            checkBox.setAttribute("type", "checkbox")

            checkBox.onchange = function (lay) {
                if (this.checked)
                    lay.isFixed = false
                else
                    lay.isFixed = true
                //alert(lay.name + " : " +lay.isFixed)
            }.bind(checkBox, layer)

            tdFix.appendChild(checkBox)
            tr.appendChild(tdFix)

            $("#tb_layers").append(tr)
        }

    }

    function fetchDocInfo() {

        csInterface.evalScript('$.Exporter.fetchDocInfo()',
            function (result) {

                var ret = JSON.parse(result)

                layInfos = []

                for (var i = 0; i < ret.length; i++) {

                    var layer = {
                        name: ret[i],
                        isFixed: true
                    }

                    layInfos.push(layer)
                }

                listLayers(layInfos)

            })
    }


    function init() {

        themeManager.init()

        var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + "/jsx"
        callExtendScript('$._ext.evalFiles', extensionRoot)

        $("#btn_reset").click(function () {

            log_clear()
            fetchDocInfo()

        })

        $("#btn_source_dir").click(function () {

            log_clear()
            resourcePath = ""
            setSourcePath("")

            csInterface.evalScript('$.Exporter.openResourcePath()',
                function (result) {
                    //alert(result)
                    var ret = JSON.parse(result)

                    if (ret.stat != 0) {
                        resourcePath = ""
                        log_error(ret.info)

                    } else {
                        resourcePath = ret.data.absoluteURI
                        setSourcePath(ret.data.fsName)
                        log_info(ret.info)
                    }

                })
        })

        $("#btn_dst_dir").click(function () {

            log_clear()
            dstPath = ""
            setDstPath()

            csInterface.evalScript('$.Exporter.openDstPath()',
                function (result) {
                    //alert(result)

                    var ret = JSON.parse(result)
                    if (ret.stat != 0) {
                        dstPath = ""
                        log_error(ret.info)

                    } else {
                        dstPath = ret.data.absoluteURI
                        setDstPath(ret.data.fsName)
                        log_info(ret.info)
                    }

                })
        })


        $("#btn_gen_config").click(function () {

            log_clear()
            //resourcePath = '/g/ps/pingtu/jigsaw_ex/image'
            if (resourcePath == '') {
                log_error('错误:请先设置"原始素材路径"')
                return
            }
            //dstPath = '/g/ps/pingtu/OUT'
            if (dstPath == '') {
                log_error('错误:请先设置"导出文件路径"')
                return
            }

            var data = {
                resourcePath: resourcePath,
                dstPath: dstPath,
                layInfos: layInfos
            }

            var jdata = JSON.stringify(data)
            //log_info(jdata)
            csInterface.evalScript('$.Exporter.exportConfig(' + jdata + ')',
                function (result) {
                    var ret = JSON.parse(result)
                    if (ret.stat != 0) {
                        log_error(ret.info)
                    } else {
                        log_info(ret.info)
                    }
                })
        })

        // 初始化时，加载图层列表
        fetchDocInfo()
    }

    init()

}());
