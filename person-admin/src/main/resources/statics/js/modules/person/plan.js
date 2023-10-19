$(function () {

    $("#jqGrid").jqGrid({
        url: baseURL + 'person/plan/list',
        datatype: "json",
        colModel: [
            {label: '主键', name: 'id', index: "id", width: 45, key: true, hidden: true},
            {label: '用户ID', name: 'userId', width: 45, hidden: true},
            {label: '员工姓名', name: 'userName', width: 75},
            {label: '计划主题', name: 'name', width: 75},
            {label: '计划内容', name: 'content', width: 75},
            {label: '开始日期', name: 'startDate', width: 75},
            {label: '结束日期', name: 'endDate', width: 75},
            {
                label: '状态', name: 'status', width: 60, formatter: function (value, options, row) {
                    return value === 0 ?
                        '<span class="label label-danger">进行中</span>' :
                        '<span class="label label-success">完成</span>';
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
var setting = {
    data: {
        simpleData: {
            enable: true,
            idKey: "deptId",
            pIdKey: "parentId",
            rootPId: -1
        },
        key: {
            url: "nourl"
        }
    }
};
var ztree;

var vm = new Vue({
    el: '#rrapp',
    data: {
        q: {
            name: null
        },
        showList: true,
        title: null,
        plan: {
            status: 1
        }
    },
    methods: {
        query: function () {
            vm.reload();
        },
        add: function () {
            vm.showList = false;
            vm.title = "新增";
            vm.plan = {
                status: 0,
                startDate: '',
                endDate: ''
            };
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
                    url: baseURL + "person/plan/delete",
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
            var url = vm.plan.id == null ? "person/plan/save" : "person/plan/update";
            $.ajax({
                type: "POST",
                url: baseURL + url,
                contentType: "application/json",
                data: JSON.stringify(vm.plan),
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
            $.get(baseURL + "person/plan/info/" + id, function (r) {
                vm.plan = r.plan;

            });
        },
        reload: function () {
            vm.showList = true;
            var page = $("#jqGrid").jqGrid('getGridParam', 'page');
            $("#jqGrid").jqGrid('setGridParam', {
                postData: {'name': vm.q.name},
                page: page
            }).trigger("reloadGrid");
        }
    }
});
layui.use('laydate', function () {
    var laydate = layui.laydate;
    laydate.render({
        elem: '#startDate',
        trigger: 'click',
        done: function (value) {
            vm.plan.startDate = value;
        }
    });

    laydate.render({
        elem: '#endDate',
        trigger: 'click',
        done: function (value) {
            vm.plan.endDate = value;
        }
    });
});