<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="车牌号" prop="plateNumber">
        <el-input
          v-model="queryParams.plateNumber"
          placeholder="请输入车牌号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="车辆品牌" prop="brand">
        <el-input
          v-model="queryParams.brand"
          placeholder="请输入车辆品牌"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="车辆颜色" prop="color">
        <el-input
          v-model="queryParams.color"
          placeholder="请输入车辆颜色"
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
          v-hasPermi="['vehicle:vehicles:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['vehicle:vehicles:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['vehicle:vehicles:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="vehiclesList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="车辆id" align="center" prop="id" />
      <el-table-column label="车牌号" align="center" prop="plateNumber" />
      <el-table-column label="图片" align="center" prop="cover" width="120">
        <template #default="scope">
          <el-image
              style="width: 80px; height: 80px"
              :src="BASE+scope.row.cover"
              fit="cover"
          />
        </template>
      </el-table-column>

      <el-table-column label="品牌" align="center" prop="brand" />
      <el-table-column label="类型" align="center" prop="carType" />
      <el-table-column label="颜色" align="center" prop="color" />
      <el-table-column label="里程数" align="center" prop="mileage" />
      <el-table-column label="购买日期" align="center" prop="purchaseDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.purchaseDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上次维护" align="center" prop="lastMaintenance" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.lastMaintenance, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="保险到期" align="center" prop="insuranceExpiry" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.insuranceExpiry, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="130">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['vehicle:vehicles:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['vehicle:vehicles:remove']">删除</el-button>
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

    <!-- 添加或修改车辆信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="vehiclesRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="车牌号" prop="plateNumber">
          <el-input v-model="form.plateNumber" placeholder="请输入车牌号" />
        </el-form-item>
        <el-form-item label="类型" prop="plateNumber">
          <el-input v-model="form.carType" placeholder="请输入类型" />
        </el-form-item>
        <el-form-item label="图片" prop="cover">
          <el-upload
              class="avatar-uploader"
              :action="uploadUrl"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :before-upload="beforeUpload"
          >
            <template #default>
              <div>
                <el-image
                    :src="BASE + form.cover"
                    style="width: 100px; height: 100px; border-radius: 6px;display: flex"
                    fit="cover"/>
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="品牌" prop="brand">
          <el-input v-model="form.brand" placeholder="请输入车辆品牌" />
        </el-form-item>
        <el-form-item label="颜色" prop="color">
          <el-input v-model="form.color" placeholder="请输入车辆颜色" />
        </el-form-item>
        <el-form-item label="里程数" prop="mileage">
          <el-input v-model="form.mileage" placeholder="请输入车辆里程数，单位：公里" />
        </el-form-item>
        <el-form-item label="购买日期" prop="purchaseDate">
          <el-date-picker clearable
            v-model="form.purchaseDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择购买日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="上次维护" prop="lastMaintenance">
          <el-date-picker clearable
            v-model="form.lastMaintenance"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择上一次维护日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="保险到期" prop="insuranceExpiry">
          <el-date-picker clearable
            v-model="form.insuranceExpiry"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择保险到期日期">
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

<script setup name="Vehicles">
import { listVehicles, getVehicles, delVehicles, addVehicles, updateVehicles } from "@/api/vehicle/vehicles";

const { proxy } = getCurrentInstance();

const vehiclesList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const BASE = import.meta.env.VITE_APP_BASE_API

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    plateNumber: null,
    cover: null,
    brand: null,
    carType: null,
    color: null,
    mileage: null,
    purchaseDate: null,
    lastMaintenance: null,
    insuranceExpiry: null
  },
  rules: {
  }
});

const uploadUrl = ref(BASE + '/vehicle/uploads');

const { queryParams, form, rules } = toRefs(data);

const handleUploadSuccess = (res) => {
  if (res.code === 200) {
    form.value.cover = res.data; // 上传成功后赋值
    ElMessage.success("上传成功");
  } else {
    ElMessage.error("上传失败：" + res.msg);
  }
};

const beforeUpload = (file) => {
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    ElMessage.error("只能上传图片格式！");
  }
  return isImage;
};

/** 查询车辆信息列表 */
function getList() {
  loading.value = true;
  listVehicles(queryParams.value).then(response => {
    vehiclesList.value = response.rows;
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
    plateNumber: null,
    cover: null,
    brand: null,
    carType: null,
    color: null,
    mileage: null,
    purchaseDate: null,
    lastMaintenance: null,
    insuranceExpiry: null
  };
  proxy.resetForm("vehiclesRef");
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
  title.value = "添加车辆信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getVehicles(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改车辆信息";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["vehiclesRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateVehicles(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addVehicles(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除车辆信息编号为"' + _ids + '"的数据项？').then(function() {
    return delVehicles(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('vehicle/vehicles/export', {
    ...queryParams.value
  }, `vehicles_${new Date().getTime()}.xlsx`)
}

getList();
</script>

<style>
.avatar-uploader {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

</style>
