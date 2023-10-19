$(function () {

    $("#jqGrid").jqGrid({
        url: baseURL + 'person/work/list',
        datatype: "json",
        colModel: [
            {label: '主键', name: 'id', index: "id", width: 45, key: true, hidden: true},
            {label: '用户ID', name: 'userId', width: 45, hidden: true},
            {label: '员工姓名', name: 'userName', width: 75},
            // {label: '工作月份', name: 'workMonth', width: 75},
            {label: '工作日期', name: 'workDate', width: 75},
            {label: '上班时间', name: 'upTime', width: 75},
            {label: '下班时间', name: 'downTime', width: 75},
            {
                label: '状态', name: 'status', width: 60, formatter: function (value, options, row) {
                    if (value === 0) {
                        return '<span class="label label-success">正常</span>'
                    } else if (value === 1) {
                        return '<span class="label label-danger">迟到</span>'
                    } else if (value === 2) {
                        return '<span class="label label-warning">早退</span>'
                    } else if (value === 3) {
                        return '<span class="label label-info">加班</span>'
                    }
                }
            },
            {label: '创建时间', name: 'createTime', index: "create_time", width: 85}
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
            status: null,
            workMonth: null
        },
        showList: true,
        title: null,
        work: {},
        upFlag: true,
        downFlag: false,
        isReadOnly: false
    },
    methods: {
        query: function () {
            vm.reload();
        },
        add: function () {
            vm.showList = false;
            vm.title = "上班打卡";
            vm.work = {};
            vm.upFlag = true;
            vm.downFlag = false;
        },
        update: function () {
            var id = getSelectedRow();
            if (id == null) {
                return;
            }
            vm.upFlag = false;
            vm.downFlag = true;
            vm.showList = false;
            vm.title = "下班打卡";
            vm.isReadOnly = true;
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
                    url: baseURL + "person/work/delete",
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
            var url = vm.work.id == null ? "person/work/save" : "person/work/update";
            $.ajax({
                type: "POST",
                url: baseURL + url,
                contentType: "application/json",
                data: JSON.stringify(vm.work),
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
            $.get(baseURL + "person/work/info/" + id, function (r) {
                vm.work = r.work;
            });
        },
        reload: function () {
            vm.showList = true;
            var page = $("#jqGrid").jqGrid('getGridParam', 'page');
            $("#jqGrid").jqGrid('setGridParam', {
                postData: {
                    'workDate': vm.q.workDate,
                    'workMonth': vm.q.workMonth,
                    'status': vm.q.status
                },
                page: page
            }).trigger("reloadGrid");
        }
    }
});

layui.use('laydate', function () {

    var laydate = layui.laydate;
    laydate.render({
        elem: '#workDate',
        trigger: 'click',
        value: new Date(),
        done: function (value) {
            vm.work.workDate = value;
        }
    });

    laydate.render({
        elem: '#upTime',
        type: 'time',
        value: new Date(),
        trigger: 'click',
        done: function (value) {
            vm.work.upTime = value;
        }
    });
    laydate.render({
        elem: '#downTime',
        type: 'time',
        value: new Date(),
        trigger: 'click',
        done: function (value) {
            vm.work.downTime = value;
        }
    });
    laydate.render({
        elem: '#workDateQuery',
        trigger: 'click',
        done: function (value) {
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