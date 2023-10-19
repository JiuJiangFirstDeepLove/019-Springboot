$(function () {

    $("#jqGrid").jqGrid({
        url: baseURL + 'person/merit/list',
        datatype: "json",
        colModel: [			
			{ label: '主键', name: 'id', index: "id", width: 45, key: true,hidden:true},
            { label: '设置日期', name: 'setDate', width: 75 },
            { label: '月考核量', name: 'monthQuota', width: 75 },
            { label: '周考核量', name: 'weekQuota', width: 75 }
        ],
		viewrecords: true,
        height: 385,
        rowNum: 10,
		rowList : [10,30,50],
        rownumbers: true, 
        rownumWidth: 25, 
        autowidth:true,
        multiselect: true,
        pager: "#jqGridPager",
        jsonReader : {
            root: "page.list",
            page: "page.currPage",
            total: "page.totalPage",
            records: "page.totalCount"
        },
        prmNames : {
            page:"page", 
            rows:"limit", 
            order: "order"
        },
        gridComplete:function(){
        	//隐藏grid底部滚动条
        	$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
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
            url:"nourl"
        }
    }
};
var ztree;

var vm = new Vue({
    el:'#rrapp',
    data:{
        q:{
            userId: null,
            deptId: null,
            deptName: null
        },
        showList: true,
        title:null,
        merit:{},
        deptId:null,
        deptName:null,
        users: [],
        user: {}
    },
    methods: {
        query: function () {
            vm.reload();
            vm.getUsers();
            vm.getDept();
        },
        add: function(){
            vm.showList = false;
            vm.title = "新增";
            vm.merit = { deptName:null, deptId:null, status:0};
            vm.getUsers();
            vm.getDept();
        },
        getDept: function(){
            //加载部门树
            $.get(baseURL + "sys/dept/list", function(r){
                ztree = $.fn.zTree.init($("#deptTree"), setting, r);
                var node = ztree.getNodeByParam("deptId", vm.merit.deptId);
                if(node != null){
                    ztree.selectNode(node);
                    vm.merit.deptName = node.name;
                    vm.q.deptName = node.name;
                }
            })
         },
        update: function () {
            var id = getSelectedRow();
            if(id == null){
                return ;
            }
            vm.showList = false;
            vm.title = "修改";
            vm.getRecord(id);
        },
        permissions: function () {
            var id = getSelectedRow();
            if(id == null){
                return ;
            }

            window.location.href=baseURL+"person/permissions/index/"+id;
        },
        del: function () {
            var ids = getSelectedRows();
            if(ids == null){
                return ;
            }

            confirm('确定要删除选中的记录？', function(){
                $.ajax({
                    type: "POST",
                    url: baseURL + "person/merit/delete",
                    contentType: "application/json",
                    data: JSON.stringify(ids),
                    success: function(r){
                        if(r.code == 0){
                            alert('操作成功', function(){
                                vm.reload();
                            });
                        }else{
                            alert(r.msg);
                        }
                    }
                });
            });
        },
        saveOrUpdate: function () {
            var url = vm.merit.id == null ? "person/merit/save" : "person/merit/update";
            $.ajax({
                type: "POST",
                url: baseURL + url,
                contentType: "application/json",
                data: JSON.stringify(vm.merit),
                success: function(r){
                    if(r.code === 0){
                        alert('操作成功', function(){
                            vm.reload();
                        });
                    }else{
                        alert(r.msg);
                    }
                }
            });
        },
        getRecord: function(id){
            $.get(baseURL + "person/merit/info/"+id, function(r){
                vm.merit = r.merit;

            });
        },
        getUsers: function () {
            $.get(baseURL + "sys/user/users" , function (r) {
                vm.users = r.users;
            });
        },
        deptTree: function(){
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
                    vm.merit.deptId = node[0].deptId;
                    vm.merit.deptName = node[0].name;
                    vm.q.deptId = node[0].deptId;
                    vm.q.deptName = node[0].name;
                    layer.close(index);
                }
            });
        },
        reload: function () {
            vm.showList = true;
            var page = $("#jqGrid").jqGrid('getGridParam','page');
            $("#jqGrid").jqGrid('setGridParam',{
                postData:{
                    'userId': vm.q.userId,
                    'deptId': vm.q.deptId
                },
                page:page
            }).trigger("reloadGrid")
            vm.getUsers();
        }
    }
});
layui.use('laydate', function () {
    $.get(baseURL + "sys/user/users" , function (r) {
        vm.users = r.users;
    });
    var laydate = layui.laydate;
    laydate.render({
        elem: '#birth',
        trigger: 'click',
        done: function (value) {
            vm.merit.birth = value;
        }
    });

    laydate.render({
        elem: '#setDate',
        trigger: 'click',
        done: function (value) {
            vm.merit.setDate = value;
        }
    });
});