﻿/**
 * Class: SuperMap.REST.FindPathService
 * 最佳路径分析服务类。
 * 最佳路径是在网络数据集中指定一些节点，按照节点的选择顺序，
 * 顺序访问这些节点从而求解起止点之间阻抗最小的路经。
 * 该类负责将客户端指定的最佳路径分析参数传递给服务端，并接收服务端返回的结果数据。
 * 最佳路径分析结果通过该类支持的事件的监听函数参数获取
 *
 * Inherits from:
 *  - <SuperMap.REST.NetworkAnalystServiceBase>
 */
require('./NetworkAnalystServiceBase');
require('./FindPathParameters');
SuperMap.REST.FindPathService = SuperMap.Class(SuperMap.REST.NetworkAnalystServiceBase, {

    /**
     * Constructor: SuperMap.REST.FindPathService
     * 最佳路径分析服务类构造函数。
     *
     * 例如：
     * (start code)
     * var myFindPathService = new SuperMap.REST.FindPathService(url, {
     *     eventListeners: {
     *	       "processCompleted": findPathCompleted, 
     *		   "processFailed": findPathError
     *		   }
     * });
     * (end)
     *
     * Parameters:
     * url - {String} 网络分析服务地址。请求网络分析服务，URL应为：
     * http://{服务器地址}:{服务端口号}/iserver/services/{网络分析服务名}/rest/networkanalyst/{网络数据集@数据源}；
     * 例如:"http://localhost:8090/iserver/services/components-rest/rest/networkanalyst/RoadNet@Changchun"。
     * options - {Object} 参数。
     *
     * Allowed options properties:
     * eventListeners - {Object} 需要被注册的监听器对象。
     */
    initialize: function (url, options) {
        SuperMap.REST.NetworkAnalystServiceBase.prototype.initialize.apply(this, arguments);
    },

    /**
     * APIMethod: destroy
     * 释放资源，将引用资源的属性置空。
     */
    destroy: function () {
        SuperMap.REST.NetworkAnalystServiceBase.prototype.destroy.apply(this, arguments);
    },

    /**
     * APIMethod: processAsync
     * 负责将客户端的查询参数传递到服务端。
     *
     * Parameters:
     * params - {<SuperMap.FindPathParameters>}
     */
    processAsync: function (params) {
        if (!params) {
            return;
        }
        var me = this, jsonObject,
            end = me.url.substr(me.url.length - 1, 1);
        me.url = me.url + ((end === "/") ? "path" : "/path") + (this.isInTheSameDomain ? ".json?" : ".jsonp?");
        jsonObject = {
            hasLeastEdgeCount: params.hasLeastEdgeCount,
            parameter: SuperMap.Util.toJSON(params.parameter),
            nodes: me.getJson(params.isAnalyzeById, params.nodes)
        };
        me.request({
            method: "GET",
            params: jsonObject,
            scope: me,
            success: me.serviceProcessCompleted,
            failure: me.serviceProcessFailed
        });
    },

    /**
     * Method: getJson
     * 将对象转化为JSON字符串。
     *
     * Parameters:
     * isAnalyzeById - {Boolean}
     * params - {Array}
     *
     * Returns:
     * {Object} 转化后的JSON字符串。
     */
    getJson: function (isAnalyzeById, params) {
        var jsonString = "[",
            len = params ? params.length : 0;

        if (isAnalyzeById === false) {
            for (var i = 0; i < len; i++) {
                if (i > 0) jsonString += ",";
                jsonString += '{"x":' + params[i].x + ',"y":' + params[i].y + '}';
            }
        } else if (isAnalyzeById == true) {
            for (var i = 0; i < len; i++) {
                if (i > 0) jsonString += ",";
                jsonString += params[i];
            }
        }
        jsonString += ']';
        return jsonString;
    },

    /**
     * Method: toGeoJSONResult
     * 将含有geometry的数据转换为geojson格式。
     *
     * Parameters:
     * result - {Object} 服务器返回的结果对象。
     */
    toGeoJSONResult: function (result) {
        if (!result || !result.pathList || result.pathList.length < 1) {
            return null;
        }
        //只处理route ,pathGuide,edgeFeatures,nodeFeatures
        var analystResults = [];
        var geoJSONFormat = new SuperMap.Format.GeoJSON();
        result.pathList.forEach(function (path) {
            var analystResult = {};
            if (path.route) {
                analystResult.route = JSON.parse(geoJSONFormat.write(path.route));
            }
            if (path.pathGuideItems) {
                analystResult.pathGuideItems = JSON.parse(geoJSONFormat.write(path.pathGuideItems));

            }
            if (path.edgeFeatures) {
                analystResult.edgeFeatures = JSON.parse(geoJSONFormat.write(path.edgeFeatures));
            }
            if (path.nodeFeatures) {
                analystResult.nodeFeatures = JSON.parse(geoJSONFormat.write(path.nodeFeatures));
            }
            analystResults.push(analystResult);
        });
        return analystResults;
    },

    CLASS_NAME: "SuperMap.REST.FindPathService"
});

module.exports = function (url, options) {
    return new SuperMap.REST.FindPathService(url, options);
};