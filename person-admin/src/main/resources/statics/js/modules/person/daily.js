$(function () {

    $("#jqGrid").jqGrid({
        url: baseURL + 'person/daily/list',
        datatype: "json",
        colModel: [
            {label: '主键', name: 'id', index: "id", width: 45, key: true, hidden: true},
            {label: '用户ID', name: 'userId', width: 45, hidden: true},
            {label: '员工姓名', name: 'userName', width: 75},
            {label: '工作月份', name: 'workMonth', width: 75},
            {label: '工作日期', name: 'workDate', width: 75},
            {label: '工作内容', name: 'workContent', width: 75},
            {
                label: '完成进度', name: 'progress', width: 75,
                formatter: function (value, options, row) {
                    return value + '%';
                }
            },
            {label: '创建时间', name: 'createTime', width: 85}
        ],
        viewrecords: true,
        height: 385,
        rowNum: 10,
        rowList: [10, 30, 50],
        rownumbers: true,
        rownumWidth: 25,
        autowidth: true,
        multiselect: true,
        pager: "#jqGridPager",
        jsonReader: {
            root: "page.list",
            page: "page.currPage",
            total: "page.totalPage",
            records: "page.totalCount"
        },
        prmNames: {
            page: "page",
            rows: "limit",
            order: "order"
        },
        gridComplete: function () {
            //隐藏grid底部滚动条
            $("#jqGrid").closest(".ui-jqgrid-bdiv").css({"overflow-x": "hidden"});
        }
    });
});


var vm = new Vue({
    el: '#rrapp',
    data: {
        q: {
            workDate: null,
            workMonth: null
        },
        showList: true,
        title: null,
        daily: {}
    },
    methods: {
        query: function () {
            vm.reload();
        },
        add: function () {
            vm.showList = false;
            vm.title = "新增";
            vm.daily = {};


        },
        update: function () {
            var id = getSelectedRow();
            if (id == null) {
                return;
            }

            vm.showList = false;
            vm.title = "修改";

            vm.getRecord(id);
        },
        permissions: function () {
            var id = getSelectedRow();
            if (id == null) {
                return;
            }

            window.location.href = baseURL + "person/permissions/index/" + id;
        },
        del: function () {
            var ids = getSelectedRows();
            if (ids == null) {
                return;
            }

            confirm('确定要删除选中的记录？', function () {
                $.ajax({
                    type: "POST",
                    url: baseURL + "person/daily/delete",
                    contentType: "application/json",
                    data: JSON.stringify(ids),
                    success: function (r) {
                        if (r.code == 0) {
                            alert('操作成功', function () {
                                vm.reload();
                            });
                        } else {
                            alert(r.msg);
                        }
                    }
                });
            });
        },
        saveOrUpdate: function () {
            var url = vm.daily.id == null ? "person/daily/save" : "person/daily/update";
            $.ajax({
                type: "POST",
                url: baseURL + url,
                contentType: "application/json",
                data: JSON.stringify(vm.daily),
                success: function (r) {
                    if (r.code === 0) {
                        alert('操作成功', function () {
                            vm.reload();
                        });
                    } else {
                        alert(r.msg);
                    }
                }
            });
        },
        getRecord: function (id) {
            $.get(baseURL + "person/daily/info/" + id, function (r) {
                vm.daily = r.daily;
            });
        },
        reload: function () {
            vm.showList = true;
            var page = $("#jqGrid").jqGrid('getGridParam', 'page');
            $("#jqGrid").jqGrid('setGridParam', {
                postData: {
                    'workMonth': vm.q.workMonth,
                    'workDate': vm.q.workDate,
                },
                page: page
            }).trigger("reloadGrid");
        }
    }
});
layui.use('laydate', function () {
    var laydate = layui.laydate;

    //执行一个laydat
    laydate.render({
        elem: '#workDate' //指定元素
        , value: new Date()
        , trigger: 'click'
        , done: function (value) {
            vm.daily.workDate = value;
        }
    });
    //执行一个laydat
    laydate.render({
        elem: '#workDateQuery' //指定元素
        , trigger: 'click'
        , done: function (value) {
            vm.q.workDate = value;
        }
    });
    laydate.render({
        elem: '#workMonthQuery',
        type: 'month',
        trigger: 'click',
        done: function (value) {
            vm.q.workMonth = value;
        }
    });
});