<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="车辆ID，关联vehicles表" prop="vehicleId">
        <el-input
          v-model="queryParams.vehicleId"
          placeholder="请输入车辆ID，关联vehicles表"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="纬度坐标，精确到小数点后6位" prop="latitude">
        <el-input
          v-model="queryParams.latitude"
          placeholder="请输入纬度坐标，精确到小数点后6位"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="经度坐标，精确到小数点后6位" prop="longitude">
        <el-input
          v-model="queryParams.longitude"
          placeholder="请输入经度坐标，精确到小数点后6位"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="位置地址描述" prop="address">
        <el-input
          v-model="queryParams.address"
          placeholder="请输入位置地址描述"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="记录时间" prop="recordedAt">
        <el-date-picker clearable
          v-model="queryParams.recordedAt"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择记录时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="当前使用者ID，关联users表" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入当前使用者ID，关联users表"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['vehicle:locations:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['vehicle:locations:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['vehicle:locations:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['vehicle:locations:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="locationsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="位置记录ID，自动递增的主键" align="center" prop="id" />
      <el-table-column label="车辆ID，关联vehicles表" align="center" prop="vehicleId" />
      <el-table-column label="纬度坐标，精确到小数点后6位" align="center" prop="latitude" />
      <el-table-column label="经度坐标，精确到小数点后6位" align="center" prop="longitude" />
      <el-table-column label="位置地址描述" align="center" prop="address" />
      <el-table-column label="记录时间" align="center" prop="recordedAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.recordedAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="车辆状态，例如：使用中、空闲等" align="center" prop="status" />
      <el-table-column label="当前使用者ID，关联users表" align="center" prop="userId" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['vehicle:locations:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['vehicle:locations:remove']">删除</el-button>
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

    <!-- 添加或修改实时定位对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="locationsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="车辆ID，关联vehicles表" prop="vehicleId">
          <el-input v-model="form.vehicleId" placeholder="请输入车辆ID，关联vehicles表" />
        </el-form-item>
        <el-form-item label="纬度坐标，精确到小数点后6位" prop="latitude">
          <el-input v-model="form.latitude" placeholder="请输入纬度坐标，精确到小数点后6位" />
        </el-form-item>
        <el-form-item label="经度坐标，精确到小数点后6位" prop="longitude">
          <el-input v-model="form.longitude" placeholder="请输入经度坐标，精确到小数点后6位" />
        </el-form-item>
        <el-form-item label="位置地址描述" prop="address">
          <el-input v-model="form.address" placeholder="请输入位置地址描述" />
        </el-form-item>
        <el-form-item label="记录时间" prop="recordedAt">
          <el-date-picker clearable
            v-model="form.recordedAt"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择记录时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="当前使用者ID，关联users表" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入当前使用者ID，关联users表" />
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

<script setup name="Locations">
import { listLocations, getLocations, delLocations, addLocations, updateLocations } from "@/api/vehicle/locations";

const { proxy } = getCurrentInstance();

const locationsList = ref([]);
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
    latitude: null,
    longitude: null,
    address: null,
    recordedAt: null,
    status: null,
    userId: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询实时定位列表 */
function getList() {
  loading.value = true;
  listLocations(queryParams.value).then(response => {
    locationsList.value = response.rows;
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
    latitude: null,
    longitude: null,
    address: null,
    recordedAt: null,
    status: null,
    userId: null
  };
  proxy.resetForm("locationsRef");
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
  title.value = "添加实时定位";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getLocations(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改实时定位";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["locationsRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateLocations(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addLocations(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除实时定位编号为"' + _ids + '"的数据项？').then(function() {
    return delLocations(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('vehicle/locations/export', {
    ...queryParams.value
  }, `locations_${new Date().getTime()}.xlsx`)
}

getList();
</script>
