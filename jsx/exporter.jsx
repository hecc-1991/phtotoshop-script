if (typeof ($) == 'undefined')
    $ = {};

$.Exporter = (function (exports) {

    function checkResource(files, filename) {
        for (idx in files) {
            var file = files[idx]
            var pos = file.name.indexOf(filename + ".")
            if (pos == 0) {
                return file.name
            }
        }

        return ""
    }

    function checkResources(srcDir) {

        var files = srcDir.getFiles()

        var layers = app.activeDocument.layers

        for (var i = 0; i < layers.length; i++) {

            var layer = layers[i]

            var dstName = checkResource(files, layer.name)

            if (dstName == "") {

                var error_info = "错误:找不到图层<" + layer.name + ">的源文件,请检查路径是否正确"
                var result = {
                    stat: 1,
                    info: error_info,
                    data: {}
                }

                return result
            }
        }

        var info = "图层源文件全部匹配"

        var data = {
            absoluteURI: srcDir.absoluteURI,
            fsName: srcDir.fsName,
            fullName: srcDir.fullName,
            name: srcDir.name,
            path: srcDir.path
        }

        var result = {
            stat: 0,
            info: info,
            data: data
        }

        return result
    }

    exports.openResourcePath = function () {

        var srcDir = Folder.selectDialog()

        //if(type(srcdir) == "File"){ 
        //}

        var ret = checkResources(srcDir)

        return JSON.stringify(ret)
    }

    function copyResource(files, filename, path) {
        for (idx in files) {
            var file = files[idx]
            var pos = file.name.indexOf(filename + ".")
            if (pos == 0) {
                file.copy(path + "/" + file.name)
                return file.name
            }
        }

        return ""
    }

    function writeFile(fileObj, fileContent, encoding) {

        encoding = encoding || "utf-8"

        fileObj = (fileObj instanceof File) ? fileObj : new File(fileObj)

        var parentFolder = fileObj.parent

        if (!parentFolder.exists && !parentFolder.create())

            throw new Error("Cannot create file in path " + fileObj.fsName)

        fileObj.encoding = encoding

        fileObj.open("w")

        fileObj.write(fileContent)

        fileObj.close()

        return fileObj

    }

    function bounds2Rect(bounds) {
        var bds = []
        for (var i = 0; i < bounds.length; i++) {
            bds.push(bounds[i].as("px"))
        }

        var rect = {
            x: bds[0],
            y: bds[1],
            w: bds[2] - bds[0],
            h: bds[3] - bds[1]
        }
        return rect
    }

    exports.exportConfig = function (resourcePath) {

        try {

            var srcDir = new Folder(resourcePath)
            var files = srcDir.getFiles()

            //var jsonFile = new File("config.json").saveDlg("", "Save As Type:*.json")
            var dstDir = Folder.selectDialog()

            if (dstDir == null) {
                var error_info = '错误:请设置"导出文件路径"'
                var result = {
                    stat: 1,
                    info: error_info
                }

                return JSON.stringify(result)
            }

            var jsonFile = new File(dstDir.absoluteURI + "/config.json")

            var pPath = jsonFile.parent
            var subPath = "image"
            var imgPath = pPath + "/" + subPath

            var imgDir = new Folder(imgPath)
            if (!imgDir.exists) {
                imgDir.create()
            }

            var config = {}


            var doc = app.activeDocument

            var layers = doc.layers

            var layInfos = []

            var bg_width = 0
            var bg_height = 0

            if (layers.length > 0) {
                var last = layers[layers.length - 1]
                var rect = bounds2Rect(last.bounds)
                bg_width = rect.w
                bg_height = rect.h
            }

            for (var i = 0; i < layers.length; i++) {

                var layer = layers[i]

                var dstName = copyResource(files, layer.name, imgPath)
                /*
                if (dstName == "") {
                    var error_info = "错误:找不到图层<" + layer.name + ">的源文件,请检查目录是否正确"
                    var result = {
                        stat: 1,
                        info: error_info
                    }

                    return JSON.stringify(result)
                }
                */

                var index = i + 1
                var type = 1
                var isfixed = i == layers.length - 1 ? true : false
                var rotation = 0
                var path = "image" + "/" + dstName
                var padding = [0, 0, 0, 0]

                var rect = bounds2Rect(layer.bounds)
                var x = rect.x / bg_width
                var y = rect.y / bg_height
                var w = rect.w / bg_width
                var h = rect.h / bg_height

                var recc_arr = [parseFloat(x.toFixed(6)),
                                parseFloat(y.toFixed(6)),
                                parseFloat(w.toFixed(6)),
                                parseFloat(h.toFixed(6))]

                var layInfo = {
                    index: index,
                    type: type,
                    isFixed: isfixed,
                    rotation: rotation,
                    path: path,
                    rect: recc_arr,
                    padding: padding

                }

                layInfos.push(layInfo)
                var jlayInfo = JSON.stringify(layInfo)

            }

            config['info'] = {
                w: bg_width,
                h: bg_height,
                pitsCount: layers.length - 1,
                name: doc.name
            }

            config['layers'] = layInfos

            var jconfig = JSON.stringify(config)
            //alert(jconfig)

            writeFile(jsonFile, jconfig)

            var result = {
                stat: 0,
                info: "成功：输出目录 " + pPath.fsName
            }

            return JSON.stringify(result)


        } catch (e) {
            alert(e)
        }
    }


    return exports

})($.Exporter || {});
