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

    function checkfixed(layInfos, name) {
        for (i in layInfos) {
            var layer = layInfos[i]
            if (layer.name == name) {
                return layer.isFixed
            }
        }

        return 1
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
            h: bds[3] - bds[1],
            l: bds[0],
            t: bds[1],
            r: bds[2],
            b: bds[3]
        }
        return rect
    }

    exports.fetchDocInfo = function () {

        var doc = app.activeDocument

        var layers = doc.layers

        var layInfos = []

        for (var i = 0; i < layers.length; i++) {

            var layer = layers[i]

            layInfos.push(layer.name)

        }

        return JSON.stringify(layInfos)
    }

    exports.openResourcePath = function () {

        var srcDir = Folder.selectDialog()
        if (srcDir == null) {
            var error_info = '错误:请设置"原始素材路径"'
            var result = {
                stat: 1,
                info: error_info
            }

            return JSON.stringify(result)
        }

        var result = checkResources(srcDir)

        return JSON.stringify(result)
    }

    exports.openDstPath = function () {

        var dstDir = Folder.selectDialog()

        if (dstDir == null) {
            var error_info = '错误:请设置"导出文件路径"'
            var result = {
                stat: 1,
                info: error_info
            }

            return JSON.stringify(result)
        }


        var info = '设置"导出文件路径"完成'

        var data = {
            absoluteURI: dstDir.absoluteURI,
            fsName: dstDir.fsName,
            fullName: dstDir.fullName,
            name: dstDir.name,
            path: dstDir.path
        }
        var result = {
            stat: 0,
            info: info,
            data: data
        }

        return JSON.stringify(result)

    }

    exports.exportConfig = function (data) {

        try {

            var srcDir = new Folder(data.resourcePath)
            var files = srcDir.getFiles()

            var dstDir = new Folder(data.dstPath)

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

            var bg_width = doc.width.as("px")
            var bg_height =  doc.height.as("px")

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

                var index = layers.length - i
                var type = 1
                var isfixed = checkfixed(data.layInfos, layer.name)
                var rotation = 0
                var path = "image" + "/" + dstName
                var padding = [0, 0, 0, 0]

                var rect = bounds2Rect(layer.bounds)
                var l = rect.l / bg_width
                var t = rect.t / bg_height
                var r = rect.r / bg_width
                var b = rect.b / bg_height

                var recc_arr = [parseFloat(l.toFixed(6)),
                                parseFloat(t.toFixed(6)),
                                parseFloat(r.toFixed(6)),
                                parseFloat(b.toFixed(6))]

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
