$(function () {

    $("#jqGrid").jqGrid({
        url: baseURL + 'person/interview/list',
        datatype: "json",
        colModel: [
            {label: '主键', name: 'id', index: "id", width: 45, key: true, hidden: true},
            {label: '候选人姓名', name: 'candidate', width: 75},
            {label: '候选人电话', name: 'candidateMobile', width: 75},
            {label: '面试时间', name: 'meetTime', width: 75},
            {label: '面试官', name: 'meetName', width: 75},
            {
                label: '面试结果', name: 'status', width: 60, formatter: function (value, options, row) {
                    if(value == 0){
                        return '<span class="label label-info">面试中</span>';
                    }else if(value == 1){
                        return '<span class="label label-success">通过</span>';
                    }else if(value == 2){
                       return '<span class="label label-danger">未通过</span>';

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
        interview: {
            status: 1
        },
        users: [],
        user: {},
        interviewFlag:false
    },
    methods: {
        query: function () {
            vm.reload();
            vm.getUsers();
        },
        add: function () {
            vm.showList = false;
            vm.title = "新增";
            vm.interview = {status: 0};
            vm.getUsers();
        },
        update: function () {
            var id = getSelectedRow();
            if (id == null) {
                return;
            }
            vm.interviewFlag=true;
            vm.showList = false;
            vm.title = "修改";
            vm.getUsers();
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
                    url: baseURL + "person/interview/delete",
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
            var url = vm.interview.id == null ? "person/interview/save" : "person/interview/update";
            $.ajax({
                type: "POST",
                url: baseURL + url,
                contentType: "application/json",
                data: JSON.stringify(vm.interview),
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
            $.get(baseURL + "person/interview/info/" + id, function (r) {
                vm.interview = r.interview;

            });
        },
        reload: function () {
            vm.showList = true;
            var page = $("#jqGrid").jqGrid('getGridParam', 'page');
            $("#jqGrid").jqGrid('setGridParam', {
                postData: {
                    'candidate': vm.q.candidate,
                    'candidateMobile': vm.q.candidateMobile
                },
                page: page
            }).trigger("reloadGrid");
            vm.getUsers();
        }
    }
});
layui.use('laydate', function () {
    var laydate = layui.laydate;
    laydate.render({
        elem: '#meetTime',
        type: 'datetime',
        value: new Date(),
        trigger: 'click',
        done: function (value) {
            vm.interview.meetTime = value;
        }
    });
});