<template>
  <div class="app-container">
    <el-table v-loading="loading" :data="recordsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="派出车辆" align="center" prop="vehicle" />
      <el-table-column label="用车人" align="center" prop="username" />
      <el-table-column label="用车原因" align="center" prop="useReason" />
      <el-table-column label="开始时间" align="center" prop="startTime" width="180" />
      <el-table-column label="结束时间" align="center" prop="endTime" width="180" />
      <el-table-column label="出发地点" align="center" prop="startLocation" />
      <el-table-column label="目的地点" align="center" prop="endLocation" />
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createdAt, '{y}-{m}-{d}') }}</span>
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

  </div>
</template>

<script setup name="Records">
import { listRecords, getRecords, delRecords, addRecords, updateRecords } from "@/api/vehicle/records";

const { proxy } = getCurrentInstance();

const recordsList = ref([]);
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
    vehicleId: null,
    userId: null,
    useReason: null,
    startTime: null,
    endTime: null,
    startLocation: null,
    endLocation: null,
    mileage: null,
    createdAt: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询派车记录列表 */
function getList() {
  loading.value = true;
  listRecords(queryParams.value).then(response => {
    recordsList.value = response.rows;
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
    vehicleId: null,
    userId: null,
    useReason: null,
    startTime: null,
    endTime: null,
    startLocation: null,
    endLocation: null,
    mileage: null,
    createdAt: null
  };
  proxy.resetForm("recordsRef");
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
  title.value = "添加派车记录";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getRecords(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改派车记录";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["recordsRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateRecords(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addRecords(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除派车记录编号为"' + _ids + '"的数据项？').then(function() {
    return delRecords(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('vehicle/records/export', {
    ...queryParams.value
  }, `records_${new Date().getTime()}.xlsx`)
}

getList();
</script>
