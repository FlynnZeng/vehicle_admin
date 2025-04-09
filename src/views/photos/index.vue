<template>
  <div class="app-container">

    <el-table v-loading="loading" :data="photosList" @selection-change="handleSelectionChange">
      <el-table-column label="车牌号" align="center" prop="vehicle" />
      <el-table-column label="用户" align="center" prop="username" />
      <el-table-column label="照片" align="center" prop="photoPath">
        <template #default="scope">
          <el-image
              style="width: 80px; height: 80px"
              :src="BASE+scope.row.photoPath"
              :preview-src-list="[BASE+scope.row.photoPath]"
              fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column label="拍摄时间" align="center" prop="shootTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.shootTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="拍摄类型" align="center" prop="shootType" />
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改车辆照片对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="photosRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="相关车辆ID，关联vehicles表" prop="vehicleId">
          <el-input v-model="form.vehicleId" placeholder="请输入相关车辆ID，关联vehicles表" />
        </el-form-item>
        <el-form-item label="拍摄用户ID，关联users表" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入拍摄用户ID，关联users表" />
        </el-form-item>
        <el-form-item label="照片存储路径" prop="photoPath">
          <el-input v-model="form.photoPath" placeholder="请输入照片存储路径" />
        </el-form-item>
        <el-form-item label="拍摄时间" prop="shootTime">
          <el-date-picker clearable
            v-model="form.shootTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择拍摄时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="照片备注信息" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入照片备注信息" />
        </el-form-item>
        <el-form-item label="记录创建时间，默认为当前时间戳" prop="createdAt">
          <el-date-picker clearable
            v-model="form.createdAt"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择记录创建时间，默认为当前时间戳">
          </el-date-picker>
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

<script setup name="Photos">
import { listPhotos, getPhotos, delPhotos, addPhotos, updatePhotos } from "@/api/vehicle/photos";

const { proxy } = getCurrentInstance();

const BASE = import.meta.env.VITE_APP_BASE_API

const photosList = ref([]);
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
    photoPath: null,
    shootTime: null,
    shootType: null,
    createdAt: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询车辆照片列表 */
function getList() {
  loading.value = true;
  listPhotos(queryParams.value).then(response => {
    photosList.value = response.rows;
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
    photoPath: null,
    shootTime: null,
    shootType: null,
    remark: null,
    createdAt: null
  };
  proxy.resetForm("photosRef");
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
  title.value = "添加车辆照片";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getPhotos(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改车辆照片";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["photosRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updatePhotos(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPhotos(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除车辆照片编号为"' + _ids + '"的数据项？').then(function() {
    return delPhotos(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('vehicle/photos/export', {
    ...queryParams.value
  }, `photos_${new Date().getTime()}.xlsx`)
}

getList();
</script>
