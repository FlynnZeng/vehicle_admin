<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="车辆" prop="vehicleId">
        <el-input
          v-model="queryParams.vehicleId"
          placeholder="车牌号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="applicationsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="id" align="center" prop="id" />
      <el-table-column label="用户" align="center" prop="username" />
      <el-table-column label="车牌号" align="center" prop="plateNumber" width="150" />
      <el-table-column label="申请日期" align="center" prop="applyDate" width="150" />
      <el-table-column label="开始时间" align="center" prop="startTime" />
      <el-table-column label="结束时间" align="center" prop="endTime" />
      <el-table-column label="同行人员" align="center" prop="companions" />
      <el-table-column label="用车理由" align="center" prop="reason" />
      <el-table-column label="出发地点" align="center" prop="startLocation" />
      <el-table-column label="目的地点" align="center" prop="endLocation" />
      <el-table-column label="申请状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="getStateType(scope.row.status)">
            {{ getState(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="申请时间" align="center" prop="createdAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createdAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['vehicle:applications:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['vehicle:applications:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改车辆申请对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="applicationsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="申请状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择申请状态">
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="使用中" value="use" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Applications">
import { listApplications, getApplications, delApplications, addApplications, updateApplications } from "@/api/vehicle/applications";

const { proxy } = getCurrentInstance();

const applicationsList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: null,
    vehicleId: null,
    applyDate: null,
    startTime: null,
    endTime: null,
    companions: null,
    reason: null,
    startLocation: null,
    endLocation: null,
    status: null,
    createdAt: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

function getState(state) {
  switch (state) {
    case 'pending':
      return '待审核'
    case 'approved':
      return '已通过'
    case 'rejected':
      return '已拒绝'
    case 'use':
      return '使用中'
    case 'completed':
      return '已完成'
    default:
      return '未知状态'
  }
}

function getStateType(state) {
  switch (state) {
    case 'pending':
      return 'warning'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'danger'
    case 'use':
      return 'info'
    case 'completed':
      return ''
    default:
      return 'info'
  }
}


/** 查询车辆申请列表 */
function getList() {
  loading.value = true;
  listApplications(queryParams.value).then(response => {
    applicationsList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    userId: null,
    vehicleId: null,
    applyDate: null,
    startTime: null,
    endTime: null,
    companions: null,
    reason: null,
    startLocation: null,
    endLocation: null,
    status: null,
    createdAt: null
  };
  proxy.resetForm("applicationsRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加车辆申请";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getApplications(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改车辆申请";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["applicationsRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateApplications(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addApplications(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除车辆申请编号为"' + _ids + '"的数据项？').then(function() {
    return delApplications(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('vehicle/applications/export', {
    ...queryParams.value
  }, `applications_${new Date().getTime()}.xlsx`)
}

getList();
</script>
