$(function () {
    $("#jqGrid").jqGrid({
        url: baseURL + 'person/apply/list',
        datatype: "json",
        colModel: [
            {label: '主键', name: 'id', index: "id", width: 45, key: true, hidden: true},
            {label: '申请日期', name: 'applyDate', width: 75},
            {label: '申请人', name: 'applyName', width: 45},
            {label: '申请内容', name: 'applyContent', width: 75},
            {label: '审批日期', name: 'approvalDate', width: 75},
            {label: '审批人', name: 'approvalName', width: 75},
            {
                label: '审批结果', name: 'approvalResult', width: 60,
                formatter: function (value, options, row) {
                    if (value == 1) {
                        return '<span class="label label-danger">未通过</span>'
                    } else if (value == 2) {
                        return '<span class="label label-success">通过</span>'
                    } else {
                        return '<span class="label label-warning">审批中</span>'

                    }
                }
            },
            {label: '审批意见', name: 'approvalOpinion', width: 75},
            {
                label: '状态', name: 'status', width: 60,
                formatter: function (value, options, row) {
                    if (value == 1) {
                        return '<span class="label label-danger">未通过</span>'
                    } else if (value == 2) {
                        return '<span class="label label-success">通过</span>'
                    } else {
                        return '<span class="label label-warning">审批中</span>'

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
        q: {},
        showList: true,
        title: null,
        apply: {},
        isReadOnly: false,
        users: [],
        user: {},
        approvalFlag:true
    },
    methods: {
        query: function () {
            vm.reload();
            vm.getUsers();

        },
        add: function () {
            vm.showList = false;
            vm.title = "新增";
            vm.apply = {};
            vm.isReadOnly = false;
            vm.approvalFlag=false;
        },
        update: function () {
            var id = getSelectedRow();
            if (id == null) {
                return;
            }
            vm.getRecord(id);
            vm.showList = false;
            vm.isReadOnly = true;
            vm.title = "修改";
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
                    url: baseURL + "person/apply/delete",
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
            var url = vm.apply.id == null ? "person/apply/save" : "person/apply/approval";
            $.ajax({
                type: "POST",
                url: baseURL + url,
                contentType: "application/json",
                data: JSON.stringify(vm.apply),
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
        getUsers: function () {
            $.get(baseURL + "sys/user/users", function (r) {
                vm.users = r.users;
            });
        },
        getRecord: function (id) {
            $.get(baseURL + "person/apply/info/" + id, function (r) {
                vm.apply = r.apply;
            });
        },
        reload: function () {
            vm.showList = true;
            var page = $("#jqGrid").jqGrid('getGridParam', 'page');
            $("#jqGrid").jqGrid('setGridParam', {
                postData: {'applyUserId': vm.q.applyUserId},
                page: page
            }).trigger("reloadGrid");
        }
    }
});
layui.use('laydate', function () {
    $.get(baseURL + "sys/user/users", function (r) {
        vm.users = r.users;
    });
    var laydate = layui.laydate;
    laydate.render({
        elem: '#applyDate',
        trigger: 'click',
        value: new Date(),
        done: function (value) {
            vm.apply.applyDate = value;
        }
    });
    laydate.render({
        elem: '#approvalDate',
        trigger: 'click',
        value: new Date(),
        done: function (value) {
            vm.apply.approvalDate = value;
        }
    });

});