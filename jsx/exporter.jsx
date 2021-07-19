if (typeof ($) == 'undefined')
    $ = {};

$.Exporter = (function (exports) {

    exports.openResourcePath = function () {

        var srcdir = Folder.selectDialog()

        //if(type(srcdir) == "File"){ 
        //}

        var data = {
            absoluteURI: srcdir.absoluteURI,
            fsName: srcdir.fsName,
            fullName: srcdir.fullName,
            name: srcdir.name,
            path: srcdir.path

        }

        return JSON.stringify(data)
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

            var dir = new Folder(resourcePath)
            var files = dir.getFiles()

            var jsonFile = File.saveDialog("", "Save As Type:*.json")

            if (jsonFile == null) {
                var error_info = "错误:请设置配置文件"
                var result = {
                    stat: 1,
                    info: error_info
                }

                return JSON.stringify(result)
            }

            var pPath = jsonFile.parent
            var subPath = "image"
            var dstPath = pPath + "/" + subPath

            var dstDir = new Folder(dstPath)
            if (!dstDir.exists) {
                dstDir.create()
            }

            var config = {}


            var doc = app.activeDocument

            var actLay = doc.activeLayer

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

                var dstName = copyResource(files, layer.name, dstPath)

                if (dstName == "") {
                    var error_info = "错误:找不到图层<" + layer.name + ">的源文件,请检查目录是否正确"
                    var result = {
                        stat: 1,
                        info: error_info
                    }

                    return JSON.stringify(result)
                }

                var index = i + 1
                var type = 1
                var isfixed = i == layers.length - 1 ? true : false
                var rotation = 0
                var path = "image" + "/" + dstName

                var rect = bounds2Rect(layer.bounds)
                var x = rect.x / bg_width
                var y = rect.y / bg_height
                var w = rect.w / bg_width
                var h = rect.h / bg_height

                var recc_arr = [x.toFixed(6),
                                y.toFixed(6),
                                w.toFixed(6),
                                h.toFixed(6)]

                var layInfo = {
                    index: index,
                    type: type,
                    isfixed: isfixed,
                    rotation: rotation,
                    name: layer.name,
                    path: path,
                    rect: recc_arr

                }

                //var bounds = layer.bounds
                //layInfo.rect = bounds2Rect(bounds)

                layInfos.push(layInfo)
                var jlayInfo = JSON.stringify(layInfo)

            }

            config['info'] = {
                w: bg_width,
                h: bg_height,
                pitscount: layers.length - 1,
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