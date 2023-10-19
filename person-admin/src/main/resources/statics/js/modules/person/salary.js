$(function () {

    $("#jqGrid").jqGrid({
        url: baseURL + 'person/salary/list',
        datatype: "json",
        colModel: [
            {label: '主键', name: 'id', index: "id", width: 45, key: true, hidden: true},
            {label: '用户ID', name: 'userId', width: 45, hidden: true},
            {label: '员工姓名', name: 'userName', width: 75},
            {label: '所属部门', name: 'deptName', width: 75},
            {label: '工资月份', name: 'salaryMonth', width: 75},
            {label: '基本工资', name: 'mustSalary', width: 75},
            {label: '全勤工资', name: 'realitySalary', width: 75},
            { label: '迟到扣款', name: 'fundAmount', width: 75 },
            { label: '请假扣款', name: 'taxAmount', width: 75 },
            { label: '绩效奖金', name: 'medicalAmount', width: 75 },
            { label: '个税扣款', name: 'pensionAmount', width: 75 },
            { label: '五险一金', name: 'injuredAmount', width: 75 },
            // { label: '生育扣款', name: 'birthAmount', width: 75 },
            // { label: '失业扣款', name: 'unemploymentAmount', width: 75 },
            // { label: '请假扣款', name: 'leaveAmount', width: 75 },
            // { label: '迟到扣款', name: 'lateAmount', width: 75 },
            // { label: '基本工资', name: 'baseAmount', width: 75 },
            // { label: '工龄工资', name: 'workAmount', width: 75 },
            // { label: '加班费', name: 'overtimeAmount', width: 75 },
            // { label: '绩效奖金', name: 'meritsAmount', width: 75 },
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
            name: null,
            deptId:null,
            deptName:null,
        },
        showList: true,
        title: null,
        salary: {},
        users: [],
        user: {},
        deptId:null,
        deptName:null,
        nameFlag:true
    },
    methods: {
        query: function () {
            vm.reload();
            vm.getDept();
        },
        add: function () {
            vm.showList = false;
            vm.title = "新增";
            vm.salary = {};
            vm.getUsers();

        },
        getDept: function(){
            //加载部门树
            $.get(baseURL + "sys/dept/list", function(r){
                ztree = $.fn.zTree.init($("#deptTree"), setting, r);
                var node = ztree.getNodeByParam("deptId", vm.salary.deptId);
                if(node != null){
                    ztree.selectNode(node);
                    vm.q.deptName = node.name;
                }
            })
        },
        update: function () {
            var id = getSelectedRow();
            if (id == null) {
                return;
            }

            vm.showList = false;
            vm.title = "修改";
            vm.nameFlag=false;
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
                    url: baseURL + "person/salary/delete",
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
            var url = vm.salary.id == null ? "person/salary/save" : "person/salary/update";
            $.ajax({
                type: "POST",
                url: baseURL + url,
                contentType: "application/json",
                data: JSON.stringify(vm.salary),
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
            $.get(baseURL + "person/salary/info/" + id, function (r) {
                vm.salary = r.salary;

            });
        },
        getUsers: function () {
            $.get(baseURL + "sys/user/users" , function (r) {
                vm.users = r.users;
            });
        },
        deptTree: function() {
            layer.open({
                type: 1,
                offset: '50px',
                skin: 'layui-layer-molv',
                title: "选择部门",
                area: ['300px', '300px'],
                shade: 0,
                shadeClose: false,
                content: jQuery("#deptLayer"),
                btn: ['确定', '取消'],
                btn1: function (index) {
                    var node = ztree.getSelectedNodes();
                    //选择上级部门
                    vm.q.deptId = node[0].deptId;
                    vm.q.deptName = node[0].name;
                    layer.close(index);
                }
            });
        },
        reload: function () {
            vm.showList = true;
            var page = $("#jqGrid").jqGrid('getGridParam', 'page');
            $("#jqGrid").jqGrid('setGridParam', {
                postData: {
                    'salaryMonth': vm.q.salaryMonth,
                    'deptId': vm.q.deptId
                },
                page: page
            }).trigger("reloadGrid");
        }
    }
});
layui.use('laydate', function () {
    var laydate = layui.laydate;
    laydate.render({
        elem: '#salaryMonth',
        trigger: 'click',
        type:'month',
        done: function (value) {
            vm.salary.salaryMonth = value;
        }
    });

    laydate.render({
        elem: '#salaryMonthQuery',
        trigger: 'click',
        type:'month',
        done: function (value) {
            vm.q.salaryMonth = value;
        }
    });
    vm.getDept();
});